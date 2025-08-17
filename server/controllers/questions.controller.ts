import { NextRequest, NextResponse } from 'next/server';
import * as QService from '../services/questions.service';

export async function createQuestion(req: NextRequest) {
	try {
		const body = await req.json();
		const q = await QService.createQuestion(body);
		return NextResponse.json({ question: q }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function getQuestions() {
	try {
		const qs = await QService.getAllQuestions();
		return NextResponse.json({ questions: qs });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function getQuestion(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const q = await QService.getQuestionById(id);
		if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ question: q });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function getQuestionsBySubcategory(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const subId = searchParams.get('subId') || req.nextUrl.pathname.split('/').pop();
		if (!subId) return NextResponse.json({ error: 'Missing subId' }, { status: 400 });
		const qs = await QService.getQuestionsBySubcategory(subId);
		return NextResponse.json({ questions: qs });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function updateQuestion(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const body = await req.json();
		const updated = await QService.updateQuestionById(id, body);
		if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ question: updated });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function deleteQuestion(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id') || req.nextUrl.pathname.split('/').pop();
		if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		const deleted = await QService.deleteQuestionById(id);
		if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
