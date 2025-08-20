import { connectToDatabase } from '../../lib/db';
import Question from '../models/question.model';
import History from '../models/history.model';
import Category from '../models/category.model';
import SubCategory from '../models/subcategory.model';
import { Types } from 'mongoose';

export async function startQuiz(opts: { categoryId?: string; subCategoryId?: string; difficulty?: string; limit?: number; questionType?: string }) {
	await connectToDatabase();
	const filter: any = {};
	
	// Handle category filtering with hierarchical support
	if (opts.categoryId) {
		if (Types.ObjectId.isValid(opts.categoryId)) {
			// If it's a valid ObjectId, use it directly
			filter.category = opts.categoryId;
		} else {
			// If not a valid ObjectId, treat as custom category name
			// Find or create category by name
			let category = await Category.findOne({ name: opts.categoryId, isActive: true }).lean();
			if (!category) {
				// Create new category
				const newCategory = new Category({ 
					name: opts.categoryId,
					level: 0,
					path: [opts.categoryId],
					isActive: true
				});
				category = await newCategory.save();
			}
			filter.category = category._id;
		}
	}
	
	// Handle subcategory filtering (now part of hierarchical categories)
	if (opts.subCategoryId && Types.ObjectId.isValid(opts.subCategoryId)) {
		// For now, we'll use the subCategoryId as a direct category filter
		// In the future, this could be enhanced to find questions in subcategories
		filter.category = opts.subCategoryId;
	}
	
	if (opts.difficulty) filter.difficulty = opts.difficulty;
	
	// Handle question type filtering (for now, all questions are multiple choice)
	// In the future, you can add a type field to the Question model
	// if (opts.questionType) filter.type = opts.questionType;
	
	const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;
	
	// Get questions with populated category
	const questions = await Question.find(filter)
		.populate('category', 'name path level')
		.limit(limit)
		.lean();
	
	// Use the requested question type
	const questionType = opts.questionType || 'multiple_choice';
	
	// Do not expose correctAnswer
	const payload = questions.map((q: any) => ({
		id: q._id,
		question: q.text, // Map text to question for frontend compatibility
		type: questionType, // Use the requested question type
		options: q.options,
		difficulty: q.difficulty,
		category: q.category?.name || 'Unknown', // Use category name
		categoryPath: q.category?.path || [], // Use category path for hierarchical display
		categoryLevel: q.category?.level || 0, // Use category level
	}));
	
	return { questions: payload };
}

export async function submitQuiz(userId: string, submission: { quizId?: string; answers: { questionId: string; selectedOption: string }[] }) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');
	const questionIds = submission.answers.map((a) => a.questionId).filter((id) => Types.ObjectId.isValid(id));
	const questions = await Question.find({ _id: { $in: questionIds } }).lean();
	const questionMap: Record<string, any> = {};
	questions.forEach((q: any) => (questionMap[q._id.toString()] = q));

	let correctAnswers = 0;
	const answersRecord = submission.answers.map((a) => {
		const q = questionMap[a.questionId];
		const isCorrect = q ? String(a.selectedOption).trim() === String(q.correctAnswer).trim() : false;
		if (isCorrect) correctAnswers++;
		return {
			questionId: a.questionId,
			selectedOption: a.selectedOption,
			isCorrect,
		};
	});

	const totalQuestions = answersRecord.length;
	const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

	const history = new History({
		userId,
		quizId: submission.quizId || null,
		score,
		totalQuestions,
		correctAnswers,
		answers: answersRecord,
		startedAt: new Date(),
		completedAt: new Date(),
	});

	const saved = await history.save();
	return { score, correctAnswers, totalQuestions, history: saved };
}

export async function getHistoryForUser(userId: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(userId)) return [];
	return History.find({ userId }).sort({ createdAt: -1 }).lean();
}

export default {
	startQuiz,
	submitQuiz,
	getHistoryForUser,
};
