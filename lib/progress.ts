// lib/progress.ts
type Progress = Record<string, { attempts: number; correct: number }>

const store: Progress = {}

export function getProgress(key: string) {
	return store[key] ?? { attempts: 0, correct: 0 }
}

export function setProgress(key: string, data: { attempts?: number; correct?: number }) {
	const prev = store[key] ?? { attempts: 0, correct: 0 }
	store[key] = { attempts: (data.attempts ?? prev.attempts), correct: (data.correct ?? prev.correct) }
	return store[key]
}

export default { getProgress, setProgress }
