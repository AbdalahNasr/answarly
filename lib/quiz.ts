// lib/quiz.ts
import type { Question } from './questions'

export type QuizOptions = { category?: string; level?: string; count?: number }

export async function startQuiz(opts: QuizOptions) {
	// forward to backend API if available
	try {
		const res = await fetch(`/api/quiz?action=start`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ categoryId: opts.category, difficulty: opts.level, limit: opts.count }),
		})
		if (!res.ok) return { questions: [] }
		return res.json()
	} catch (e) {
		return { questions: [] }
	}
}

export async function submitQuiz(payload: { answers: { questionId: string; selectedOption: string }[] }) {
	const res = await fetch(`/api/quiz?action=submit`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	if (!res.ok) throw new Error('Failed to submit')
	return res.json()
}

export default { startQuiz, submitQuiz }
