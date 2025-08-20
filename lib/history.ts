// lib/history.ts
export type HistoryRecord = {
	_id?: string
	userId?: string
	score: number
	totalQuestions: number
	correctAnswers: number
	answers: { questionId: string; selectedOption: string; isCorrect: boolean }[]
}

export type LocalHistoryItem = {
	id: string
	question: string
	answer: string
	ts: number
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

export function getHistory(): LocalHistoryItem[] {
	if (typeof window === 'undefined') return []
	
	try {
		const stored = localStorage.getItem('answerly-history')
		return stored ? JSON.parse(stored) : []
	} catch (e) {
		return []
	}
}

export function clearHistory() {
	if (typeof window === 'undefined') return
	
	localStorage.removeItem('answerly-history')
}

export function addHistoryItem(item: Omit<LocalHistoryItem, 'id' | 'ts'>) {
	if (typeof window === 'undefined') return
	
	const history = getHistory()
	const newItem: LocalHistoryItem = {
		...item,
		id: Date.now().toString(),
		ts: Date.now()
	}
	
	history.unshift(newItem)
	
	// Keep only last 50 items
	const limitedHistory = history.slice(0, 50)
	
	localStorage.setItem('answerly-history', JSON.stringify(limitedHistory))
}

export default { getUserHistory, getHistory, clearHistory, addHistoryItem }

