import { connectToDatabase } from '../../lib/db';
import Category from '../models/category.model';
import { Types } from 'mongoose';

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
}

export async function createCategory(data: CreateCategoryData) {
  await connectToDatabase();
  
  const { name, description, parentId } = data;
  
  // Validate parent if provided
  let parent = null;
  let level = 0;
  let path: string[] = [name];
  
  if (parentId) {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new Error('Invalid parent category ID');
    }
    
    parent = await Category.findById(parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    
    level = parent.level + 1;
    path = [...parent.path, name];
  }
  
  // Check if category with same name exists at this level
  const existingCategory = await Category.findOne({
    name,
    parent: parentId || null,
    isActive: true
  });
  
  if (existingCategory) {
    throw new Error(`Category "${name}" already exists at this level`);
  }
  
  const category = new Category({
    name,
    description,
    parent: parentId,
    level,
    path,
    isActive: true
  });
  
  return await category.save();
}

export async function getCategoriesByLevel(level: number = 0) {
  await connectToDatabase();
  
  return await Category.find({
    level,
    isActive: true
  }).sort({ name: 1 }).lean();
}

export async function getCategoriesByParent(parentId?: string) {
  await connectToDatabase();
  
  const filter: any = { isActive: true };
  
  if (parentId) {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new Error('Invalid parent category ID');
    }
    filter.parent = parentId;
  } else {
    filter.parent = null; // Root categories
  }
  
  return await Category.find(filter).sort({ name: 1 }).lean();
}

export async function getCategoryTree() {
  await connectToDatabase();
  
  const categories = await Category.find({ isActive: true }).sort({ level: 1, name: 1 }).lean();
  
  // Build tree structure
  const categoryMap = new Map();
  const rootCategories: any[] = [];
  
  // First pass: create map of all categories
  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      ...cat,
      children: []
    });
  });
  
  // Second pass: build tree structure
  categories.forEach(cat => {
    const categoryNode = categoryMap.get(cat._id.toString());
    
    if (cat.parent) {
      const parent = categoryMap.get(cat.parent.toString());
      if (parent) {
        parent.children.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });
  
  return rootCategories;
}

export async function getCategoryPath(categoryId: string) {
  await connectToDatabase();
  
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }
  
  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category.path;
}

export async function updateCategory(categoryId: string, data: Partial<CreateCategoryData>) {
  await connectToDatabase();
  
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }
  
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Update fields
  if (data.name) category.name = data.name;
  if (data.description !== undefined) category.description = data.description;
  
  // Update path if name changed
  if (data.name && category.path.length > 0) {
    category.path[category.path.length - 1] = data.name;
  }
  
  return await category.save();
}

export async function deleteCategory(categoryId: string) {
  await connectToDatabase();
  
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new Error('Invalid category ID');
  }
  
  // Check if category has children
  const hasChildren = await Category.exists({ parent: categoryId, isActive: true });
  if (hasChildren) {
    throw new Error('Cannot delete category with subcategories. Delete subcategories first.');
  }
  
  // Soft delete
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  
  category.isActive = false;
  return await category.save();
}

export default {
  createCategory,
  getCategoriesByLevel,
  getCategoriesByParent,
  getCategoryTree,
  getCategoryPath,
  updateCategory,
  deleteCategory
};
