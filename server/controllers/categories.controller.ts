import { NextRequest, NextResponse } from 'next/server';
import * as CategoryService from '../services/categories.service';

export async function createCategory(req: NextRequest) {
	try {
		const body = await req.json();
		const category = await CategoryService.createCategory(body);
		return NextResponse.json({ category }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function getCategories() {
	try {
		const categories = await CategoryService.getAllCategories();
		return NextResponse.json({ categories });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function getCategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const category = await CategoryService.getCategoryById(id);
		if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ category });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function updateCategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const body = await req.json();
		const updated = await CategoryService.updateCategoryById(id, body);
		if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ category: updated });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
