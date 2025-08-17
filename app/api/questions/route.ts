import { NextRequest } from 'next/server';
import * as QController from '../../../server/controllers/questions.controller';

export async function POST(req: NextRequest) {
	return QController.createQuestion(req);
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const id = url.searchParams.get('id');
	const subId = url.searchParams.get('subId');
	if (id) return QController.getQuestion(req);
	if (subId) return QController.getQuestionsBySubcategory(req);
	return QController.getQuestions();
}

export async function PUT(req: NextRequest) {
	return QController.updateQuestion(req);
}

export async function DELETE(req: NextRequest) {
	return QController.deleteQuestion(req);
}
