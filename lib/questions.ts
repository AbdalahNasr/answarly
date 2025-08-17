// lib/questions.ts
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'multiple_choice' | 'code_snippet' | 'true_false' | 'open_ended'

export type Question = {
	_id?: string
	question: string
	type: QuestionType
	options?: string[]
	answer?: string
	code?: string
	category: string
	difficulty?: Difficulty
}

// Simple in-memory store fallback used on the client when server APIs are not available.
const clientStore: Question[] = []

export function addQuestion(q: Question) {
	try {
		// try to call server API (best-effort); if fetch fails, fallback to client store
		if (typeof window !== 'undefined') {
			fetch('/api/questions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(q),
			}).catch(() => {
				clientStore.push({ ...q, _id: String(Date.now()) })
			})
		} else {
			// server-side: push to in-memory store
			clientStore.push({ ...q, _id: String(Date.now()) })
		}
	} catch (e) {
		clientStore.push({ ...q, _id: String(Date.now()) })
	}
}

export function getAllQuestions(): Question[] {
	// try to access server API synchronously is not possible; return clientStore snapshot
	return [...clientStore]
}

export default {
	addQuestion,
	getAllQuestions,
}
