export type QuestionProgress = {
  text?: string // for open_ended
  code?: string // for code_snippet: user's solution
  output?: string // for code_snippet: user's expected output/answer
}

const KEY = "answerly-question-progress"

function safeRead(): Record<string, QuestionProgress> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Record<string, QuestionProgress>) : {}
  } catch {
    return {}
  }
}

function safeWrite(data: Record<string, QuestionProgress>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(data))
}

export function getProgress(id: string): QuestionProgress | undefined {
  const store = safeRead()
  return store[id]
}

export function setProgress(id: string, update: QuestionProgress) {
  const store = safeRead()
  store[id] = { ...store[id], ...update }
  safeWrite(store)
}
