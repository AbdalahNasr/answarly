export type Interaction = {
  id: string
  question: string
  answer: string
  ts: number
}

const KEY = "answerly-history"

function safeGet(): Interaction[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Interaction[]) : []
  } catch {
    return []
  }
}

function safeSet(items: Interaction[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(items))
}

export function getHistory(): Interaction[] {
  return safeGet().sort((a, b) => b.ts - a.ts)
}

export function addInteraction(input: { question: string; answer: string }): Interaction {
  const entry: Interaction = {
    id: Math.random().toString(36).slice(2),
    question: input.question,
    answer: input.answer,
    ts: Date.now(),
  }
  const list = [entry, ...safeGet()]
  safeSet(list)
  return entry
}

export function clearHistory() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}
