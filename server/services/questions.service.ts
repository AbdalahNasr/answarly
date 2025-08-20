import { connectToDatabase } from '../../lib/db';
import Question from '../models/question.model';
import SubCategory from '../models/subcategory.model';
import { Types } from 'mongoose';

export async function createQuestion(data: { text: string; options: string[]; correctAnswer: string; category: string; subCategory?: string; reason?: string; difficulty?: string }) {
	await connectToDatabase();
	if (data.subCategory && !Types.ObjectId.isValid(data.subCategory)) throw new Error('Invalid subCategory id');
	const q = new Question({
		text: data.text,
		options: data.options || [],
		correctAnswer: data.correctAnswer,
		category: data.category,
		subCategory: data.subCategory,
		reason: data.reason,
		difficulty: data.difficulty || 'medium',
	});
	return q.save();
}

export async function getAllQuestions() {
	await connectToDatabase();
	return Question.find().sort({ createdAt: -1 }).lean();
}

export async function getQuestionById(id: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return Question.findById(id).lean();
}

export async function getQuestionsBySubcategory(subId: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(subId)) return [];
	return Question.find({ subCategory: subId }).lean();
}

export async function updateQuestionById(id: string, data: any) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return Question.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export async function deleteQuestionById(id: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return Question.findByIdAndDelete(id).lean();
}

export default {
	createQuestion,
	getAllQuestions,
	getQuestionById,
	getQuestionsBySubcategory,
	updateQuestionById,
	deleteQuestionById,
};
