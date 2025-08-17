import { NextRequest, NextResponse } from 'next/server';
import * as QuizService from '../services/quiz.service';

export async function startQuiz(req: NextRequest) {
	try {
		const body = await req.json();
		const { categoryId, subCategoryId, difficulty, limit } = body || {};
		const result = await QuizService.startQuiz({ categoryId, subCategoryId, difficulty, limit });
		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function submitQuiz(req: NextRequest) {
	try {
		// expect middleware to attach req.user with userId
		// @ts-ignore
		const user = (req as any).user;
		if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const body = await req.json();
		const result = await QuizService.submitQuiz(user.userId, body);
		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}

export async function getHistory(req: NextRequest) {
	try {
		// @ts-ignore
		const user = (req as any).user;
		if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const history = await QuizService.getHistoryForUser(user.userId);
		return NextResponse.json({ history });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}
}
