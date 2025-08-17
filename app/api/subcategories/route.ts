import { NextRequest } from 'next/server';
import * as SubController from '../../../server/controllers/subcategories.controller';

export async function POST(req: NextRequest) {
	return SubController.createSubcategory(req);
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const id = url.searchParams.get('id');
	const categoryId = url.searchParams.get('categoryId');
	if (id) return SubController.getSubcategory(req);
	if (categoryId) return SubController.getSubcategoriesByCategory(req);
	return SubController.getSubcategories();
}

export async function PUT(req: NextRequest) {
	return SubController.updateSubcategory(req);
}

export async function DELETE(req: NextRequest) {
	return SubController.deleteSubcategory(req);
}
