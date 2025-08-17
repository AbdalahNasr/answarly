import { connectToDatabase } from '../../lib/db';
import SubCategory from '../models/subcategory.model';
import Category from '../models/category.model';
import { Types } from 'mongoose';

export async function createSubcategory(data: { name: string; description?: string; category: string }) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(data.category)) throw new Error('Invalid category id');
	const exists = await Category.findById(data.category);
	if (!exists) throw new Error('Category not found');
	const sub = new SubCategory({ ...data, category: data.category });
	return sub.save();
}

export async function getAllSubcategories() {
	await connectToDatabase();
	return SubCategory.find().populate('category').sort({ createdAt: -1 }).lean();
}

export async function getSubcategoryById(id: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return SubCategory.findById(id).populate('category').lean();
}

export async function getSubcategoriesByCategory(categoryId: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(categoryId)) return [];
	return SubCategory.find({ category: categoryId }).lean();
}

export async function updateSubcategoryById(id: string, data: { name?: string; description?: string; category?: string }) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	if (data.category && !Types.ObjectId.isValid(data.category)) throw new Error('Invalid category id');
	return SubCategory.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export async function deleteSubcategoryById(id: string) {
	await connectToDatabase();
	if (!Types.ObjectId.isValid(id)) return null;
	return SubCategory.findByIdAndDelete(id).lean();
}

export default {
	createSubcategory,
	getAllSubcategories,
	getSubcategoryById,
	getSubcategoriesByCategory,
	updateSubcategoryById,
	deleteSubcategoryById,
};
