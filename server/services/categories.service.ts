import { connectToDatabase } from '../../lib/db';
import Category from '../models/category.model';
import { Types } from 'mongoose';

export async function createCategory(data: { name: string; description?: string }) {
	await connectToDatabase();
	const category = new Category(data);
	return category.save();
}

export async function getAllCategories() {
	await connectToDatabase();
	return Category.find().sort({ createdAt: -1 }).lean();
}

export async function getCategoryById(id: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return Category.findById(id).lean();
}

export async function updateCategoryById(id: string, data: { name?: string; description?: string }) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return Category.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export default {
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategoryById,
};
