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
import { QuizAnimation, QuestionFeedback, ProgressIndicator } from "@/components/ui/quiz-animations"

type AnswerMap = Record<
  string,
  { choice?: string; tf?: "true" | "false"; code?: string; output?: string; text?: string }
>

interface QuizResult {
  questionId: string
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
}

interface QuizSummary {
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number
  category: string
  difficulty: string
  questionType: string
}

export default function TakeQuizPage() {
  const params = useSearchParams()
  const router = useRouter()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [showQuizAnimation, setShowQuizAnimation] = useState(false)
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)

  // Get quiz parameters
  const categoryId = params.get("category") || ""
  const subcatId = params.get("subcat") || ""
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))
  const questionType = params.get("type") || "multiple_choice"

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
        setStartTime(Date.now())
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

  // Evaluate answers and calculate results
  const evaluateAnswers = (): { results: QuizResult[], summary: QuizSummary } => {
    const results: QuizResult[] = []
    let correctCount = 0

    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      let userAnswerText = ""
      let isCorrect = false

      // Extract user's answer based on question type
      if (question.type === "multiple_choice") {
        userAnswerText = userAnswer?.choice || ""
        isCorrect = userAnswerText === question.correctAnswer
      } else if (question.type === "true_false") {
        userAnswerText = userAnswer?.tf || ""
        isCorrect = userAnswerText === question.correctAnswer
      } else if (question.type === "code_snippet") {
        userAnswerText = userAnswer?.code || ""
        // For code questions, we'll consider it correct if they attempted an answer
        isCorrect = userAnswerText.trim() !== ""
      } else if (question.type === "open_ended") {
        userAnswerText = userAnswer?.text || ""
        // For open-ended questions, we'll consider it correct if they attempted an answer
        isCorrect = userAnswerText.trim() !== ""
      }

      if (isCorrect) correctCount++

      results.push({
        questionId: question.id,
        questionText: question.text,
        userAnswer: userAnswerText || "No answer provided",
        correctAnswer: question.correctAnswer || "Not specified",
        isCorrect,
        explanation: question.reason
      })
    })

    const timeSpent = Date.now() - startTime
    const score = Math.round((correctCount / total) * 100)

    const summary: QuizSummary = {
      totalQuestions: total,
      correctAnswers: correctCount,
      score,
      timeSpent,
      category: categoryId || "All Categories",
      difficulty: level || "All Levels",
      questionType
    }

    return { results, summary }
  }

  function submit() {
    console.log('Submit button clicked')
    console.log('Setting showQuizAnimation to true')
    console.log('Setting finished to true')
    setShowQuizAnimation(true)
    setFinished(true) // Mark quiz as finished
  }

  function handleAnimationComplete() {
    console.log('Animation complete, redirecting to results')
    const { results, summary } = evaluateAnswers()
    
    // Store results in localStorage
    const resultsData = { results, summary }
    localStorage.setItem('quizResults', JSON.stringify(resultsData))
    
    // Create URL with results data
    const resultsParam = encodeURIComponent(JSON.stringify(resultsData))
    const resultsUrl = `/quiz/results?results=${resultsParam}`
    
    // Redirect to results page
    router.push(resultsUrl)
  }

  function retake() {
    console.log('Retake clicked, resetting all states')
    setAnswers({})
    setIdx(0)
    setFinished(false)
    setShowQuizAnimation(false)
    setShowQuestionFeedback(false)
    setStartTime(Date.now())
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
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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
                    Submit & View Results
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
            <div className="mt-8 text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Quiz Completed!
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Click "Retake" to start over or wait for the animation to complete.
              </p>
              <Button
                onClick={retake}
                className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                size="lg"
              >
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quiz Completion Animation */}
      {showQuizAnimation && (
        <QuizAnimation
          isSuccess={true}
          score={3}
          totalQuestions={5}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      {/* Question Feedback Animation */}
      {showQuestionFeedback && (
        <QuestionFeedback
          isCorrect={lastAnswerCorrect}
          onComplete={() => setShowQuestionFeedback(false)}
        />
      )}
    </main>
  )
}
