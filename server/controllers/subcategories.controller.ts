import { NextRequest, NextResponse } from 'next/server';
import * as SubService from '../services/subcategories.service';

export async function createSubcategory(req: NextRequest) {
	try {
		const body = await req.json();
		const sub = await SubService.createSubcategory(body);
		return NextResponse.json({ sub }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function getSubcategories() {
	try {
		const subs = await SubService.getAllSubcategories();
		return NextResponse.json({ subcategories: subs });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function getSubcategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const sub = await SubService.getSubcategoryById(id);
		if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ sub });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function getSubcategoriesByCategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryId = searchParams.get('categoryId') || req.nextUrl.pathname.split('/').pop();
		if (!categoryId) return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
		const subs = await SubService.getSubcategoriesByCategory(categoryId);
		return NextResponse.json({ subcategories: subs });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function updateSubcategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const body = await req.json();
		const updated = await SubService.updateSubcategoryById(id, body);
		if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ subcategory: updated });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function deleteSubcategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const deleted = await SubService.deleteSubcategoryById(id);
		if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
