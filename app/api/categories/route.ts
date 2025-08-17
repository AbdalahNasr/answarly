import { NextRequest } from 'next/server';
import * as CategoriesController from '../../../server/controllers/categories.controller';

export async function POST(req: NextRequest) {
	return CategoriesController.createCategory(req);
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const id = url.searchParams.get('id');
	if (id) {
		return CategoriesController.getCategory(req);
	}
	return CategoriesController.getCategories();
}

export async function PUT(req: NextRequest) {
	return CategoriesController.updateCategory(req);
}
