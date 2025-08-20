"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { startQuiz } from "@/lib/quiz"
import QuizQuestion from "@/components/quiz-question"
import type { Question } from "@/lib/questions"
import { Card } from "@/components/ui/card"
import { DebugPageListeners } from "@/hooks/use-debug"

type AnswerMap = Record<
  string,
  { choice?: string; tf?: "true" | "false"; code?: string; output?: string; text?: string }
>

export default function TakeQuizPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})

  // Get quiz parameters
  const categoryId = params.get("category") || ""
  const subcatId = params.get("subcat") || ""
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))

  // Fetch questions from database
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        
        const quizOptions = {
          category: categoryId === "all" ? undefined : categoryId,
          subCategoryId: subcatId === "all" ? undefined : subcatId,
          difficulty: level === "all" ? undefined : level,
          limit: count
        }
        
        const result = await startQuiz(quizOptions)
        setQuestions(result.questions || [])
      } catch (err) {
        console.error('Failed to fetch questions:', err)
        setError('Failed to load questions. Please try again.')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [categoryId, subcatId, level, count])

  const current = questions[idx]
  const total = questions.length

  function setAnswer(id: string, value: AnswerMap[string]) {
    setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...value } }))
  }

  function next() {
    setIdx((i) => Math.min(i + 1, total - 1))
  }
  function prev() {
    setIdx((i) => Math.max(i - 1, 0))
  }

  const isLast = idx === total - 1
  const isFirst = idx === 0

  const [finished, setFinished] = useState(false)

  function submit() {
    setFinished(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function retake() {
    setAnswers({})
    setIdx(0)
    setFinished(false)
  }

  if (loading) {
    return (
      <main>
        <DebugPageListeners page="quiz-take" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading questions...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <DebugPageListeners page="quiz-take" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Link href="/quiz/setup">
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full bg-transparent"
                >
                  Back to Setup
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main>
        <DebugPageListeners page="quiz-take" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">No questions found for this selection.</p>
              <Link href="/quiz/setup">
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full bg-transparent"
                >
                  Back to Setup
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <DebugPageListeners page="quiz-take" />
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Quiz: {categoryId === "all" ? "All Categories" : categoryId} • {level === "all" ? "All Levels" : level} • {total} questions
            </h1>
            <div className="flex gap-2">
              <Link href="/quiz/setup">
                <Button
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                >
                  Back to Setup
                </Button>
              </Link>
              <Button
                className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                onClick={retake}
              >
                Retake
              </Button>
            </div>
          </div>

          {!finished ? (
            <>
              <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
                Question {idx + 1} of {total}
              </div>
              <div className="mt-3">
                <QuizQuestion
                  question={current}
                  value={answers[current.id]}
                  onChange={(v) => setAnswer(current.id, v as any)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={isFirst}
                  onClick={prev}
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                >
                  Previous
                </Button>
                {isLast ? (
                  <Button
                    onClick={submit}
                    className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    onClick={next}
                    className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                    Next
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 space-y-4">
              <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 p-4">
                <span className="pointer-events-none absolute -inset-1 -z-10 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
                <div className="relative">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Submitted</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Results displayed on the previous quiz page.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
