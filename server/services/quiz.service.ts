import { connectToDatabase } from '../../lib/db';
import Question from '../models/question.model';
import History from '../models/history.model';
import { Types } from 'mongoose';

export async function startQuiz(opts: { categoryId?: string; subCategoryId?: string; difficulty?: string; limit?: number }) {
	await connectToDatabase();
	const filter: any = {};
	if (opts.categoryId && Types.ObjectId.isValid(opts.categoryId)) filter.category = opts.categoryId;
	if (opts.subCategoryId && Types.ObjectId.isValid(opts.subCategoryId)) filter.subCategory = opts.subCategoryId;
	if (opts.difficulty) filter.difficulty = opts.difficulty;
	const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;
	const questions = await Question.find(filter).limit(limit).lean();
	// Do not expose correctAnswer
	const payload = questions.map((q: any) => ({
		id: q._id,
		text: q.text,
		options: q.options,
		difficulty: q.difficulty,
		category: q.category,
		subCategory: q.subCategory,
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
