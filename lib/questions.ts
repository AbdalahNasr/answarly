import { ensureCategory } from "@/lib/categories"

export type QuestionType = "multiple_choice" | "code_snippet" | "true_false" | "open_ended"
export type Difficulty = "easy" | "medium" | "hard"

export type Question = {
  id: string
  question: string
  type: QuestionType
  options?: string[] // for multiple_choice
  answer?: string // for multiple_choice and true_false
  code?: string // for code_snippet
  category: string
  difficulty?: Difficulty
  createdAt: number
}

const SEED: Question[] = [
  {
    id: "1",
    question: "What is the output of console.log(typeof null)?",
    type: "multiple_choice",
    options: ["null", "object", "undefined", "string"],
    answer: "object",
    category: "JavaScript",
    difficulty: "easy",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "2",
    question: "Write a function in JavaScript that reverses a string.",
    type: "code_snippet",
    code: "// Your code here\nfunction reverseString(str) {\n  return str.split('').reverse().join('')\n}\n",
    category: "JavaScript",
    difficulty: "medium",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "3",
    question: "React uses a virtual DOM to efficiently update the UI.",
    type: "true_false",
    answer: "true",
    category: "React",
    difficulty: "easy",
    createdAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: "4",
    question: "Explain Big-O notation and provide an example.",
    type: "open_ended",
    category: "Algorithms",
    difficulty: "medium",
    createdAt: Date.now() - 1000 * 60 * 5,
  },
]

export function getSeedQuestions(): Question[] {
  return SEED
}

const KEY = "answerly-questions"

function safeGet(): Question[] {
  if (typeof window === "undefined") return SEED
  try {
    const raw = window.localStorage.getItem(KEY)
    const user = raw ? (JSON.parse(raw) as Question[]) : []
    const ids = new Set(user.map((u) => u.id))
    const merged = [...SEED.filter((s) => !ids.has(s.id)), ...user]
    return merged.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return SEED
  }
}

function safeSet(items: Question[]) {
  if (typeof window === "undefined") return
  const nonSeed = items.filter((q) => !SEED.find((s) => s.id === q.id))
  window.localStorage.setItem(KEY, JSON.stringify(nonSeed))
}

export function getAllQuestions(): Question[] {
  return safeGet()
}

export function addQuestion(input: Omit<Question, "id" | "createdAt">): Question {
  // Normalize/ensure category: if it exists, reuse; otherwise create once.
  const cat = ensureCategory(input.category)

  const item: Question = {
    ...input,
    category: cat.name,
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  }
  const list = [item, ...safeGet()]
  safeSet(list)
  return item
}

export function clearUserQuestions() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KEY)
}

export function writeSeedsToStorage() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(SEED))
}
