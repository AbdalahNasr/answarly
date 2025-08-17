import { NextRequest } from 'next/server';
import * as QuizController from '../../../server/controllers/quiz.controller';

export async function POST(req: NextRequest) {
	const url = new URL(req.url);
	const action = url.searchParams.get('action');
	if (action === 'start') return QuizController.startQuiz(req);
	if (action === 'submit') return QuizController.submitQuiz(req);
	return QuizController.startQuiz(req);
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const action = url.searchParams.get('action');
	if (action === 'history') return QuizController.getHistory(req);
	return QuizController.getHistory(req);
}
