// lib/history.ts
export type HistoryRecord = {
	_id?: string
	userId?: string
	score: number
	totalQuestions: number
	correctAnswers: number
	answers: { questionId: string; selectedOption: string; isCorrect: boolean }[]
}

export async function getUserHistory() {
	try {
		const res = await fetch('/api/quiz?action=history')
		if (!res.ok) return []
		const json = await res.json()
		return json?.history ?? []
	} catch (e) {
		return []
	}
}

export default { getUserHistory }
