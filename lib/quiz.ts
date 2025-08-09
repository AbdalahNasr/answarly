import { getAllQuestions, type Question } from "@/lib/questions"
import { getCategoryNames } from "@/lib/categories"

export type QuizParams = {
  category: string // "all" | category name
  level: "all" | "easy" | "medium" | "hard"
  count: number
}

export function getAllCategories(): string[] {
  // Use the dedicated categories collection
  return getCategoryNames()
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickQuestions(params: QuizParams): Question[] {
  const all = getAllQuestions()
  const filtered = all.filter((q) => {
    const byCat = params.category === "all" ? true : q.category === params.category
    const byLevel = params.level === "all" ? true : (q.difficulty || "medium") === params.level
    return byCat && byLevel
  })
  const desired = Math.max(1, params.count)
  const primary = shuffle(filtered).slice(0, desired)
  if (primary.length >= desired) return primary

  // Top up with other questions (no duplicates) to reach count
  const needed = desired - primary.length
  const ids = new Set(primary.map((q) => q.id))
  const fallback = shuffle(all.filter((q) => !ids.has(q.id))).slice(0, needed)
  return [...primary, ...fallback]
}
