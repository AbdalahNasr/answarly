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
import { useToast } from "@/hooks/use-toast"
import { StyledAlert, useStyledAlert } from "@/components/ui/styled-alert"

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
  const { toast } = useToast()
  const { alertState, showAlert, hideAlert } = useStyledAlert()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showQuizAnimation, setShowQuizAnimation] = useState(false)
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const [finished, setFinished] = useState(false)
  const [quizResults, setQuizResults] = useState<{ results: QuizResult[], summary: QuizSummary } | null>(null)

  // Helper functions
  function handleTimeUp() {
    // Auto-submit the quiz when time runs out
    console.log('Time is up! Auto-submitting quiz...')
    
    // Show styled alert instead of window alert
    showAlert(
      "⏰ Time's Up!", 
      "Your quiz will be submitted automatically. Don't worry, your answers are saved!",
      "time"
    )
    
    // TODO: Implement actual auto-submission logic here
    // For now, we'll just show the notification
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get quiz parameters
  const categoryId = params.get("category") || ""
  const categoryName = params.get("categoryName") || "General"
  const subcatId = params.get("subcat") || ""
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))
  const questionType = params.get("type") || "multiple_choice"
  const timeLimit = params.get("timeLimit") ? Number(params.get("timeLimit")) : null

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
          limit: count,
          questionType: questionType === "all" ? undefined : questionType
        }
        
        const result = await startQuiz(quizOptions)
        setQuestions(result.questions || [])
        setStartTime(Date.now())
        
        // Initialize timer if time limit is set
        if (timeLimit && timeLimit > 0) {
          setTimeRemaining(timeLimit * 60) // Convert minutes to seconds
        } else {
          setTimeRemaining(null) // No time limit
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err)
        setError('Failed to load questions. Please try again.')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [categoryId, subcatId, level, count, questionType])

  // Timer effect for time-limited quizzes
  useEffect(() => {
    if (!timeLimit || timeLimit <= 0 || !timeRemaining) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Time's up! Auto-submit the quiz
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLimit, timeRemaining, toast])

  const current = questions[idx]
  const total = questions.length

  // Guard against undefined current question
  if (!current) {
    return (
      <main>
        <DebugPageListeners page="quiz-take" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">No questions available.</p>
              <Link href="/quiz/setup">
                <Button className="mt-4 rounded-full">Back to Setup</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  function setAnswer(id: string, value: AnswerMap[string]) {
    setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...value } }))
  }
  function next() {
    setIdx((i) => Math.min(i + 1, total - 1))
  }
  
      function goToQuestion(index: number) {
      setIdx(Math.max(0, Math.min(index, total - 1)))
    }

  const isLast = idx === total - 1
  const isFirst = idx === 0

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
        questionText: question.question,
        userAnswer: userAnswerText || "No answer provided",
        correctAnswer: question.correctAnswer || "Not specified",
        isCorrect,
        explanation: question.reason
      })
    })

    const timeSpent = Math.floor((Date.now() - startTime) / 1000) // Convert to seconds
    const score = Math.round((correctCount / total) * 100)

    const summary: QuizSummary = {
      totalQuestions: total,
      correctAnswers: correctCount,
      score,
      timeSpent,
      category: categoryName,
      difficulty: level || "All Levels",
      questionType
    }

    return { results, summary }
  }

  function submit() {
    console.log('Submit button clicked')
    console.log('Setting showQuizAnimation to true')
    console.log('Setting finished to true')
    
    // Calculate results first
    const { results, summary } = evaluateAnswers()
    console.log('Quiz results calculated:', { results, summary })
    
    // Set results first, then animation
    setQuizResults({ results, summary })
    
    // Small delay to ensure results are set before showing animation
    setTimeout(() => {
      setShowQuizAnimation(true)
      setFinished(true) // Mark quiz as finished
      console.log('Animation state set:', { showQuizAnimation: true, finished: true })
    }, 100)
    
    // Show styled alert for quiz completion
    if (timeLimit && timeLimit > 0 && timeRemaining !== null) {
      const timeUsed = (timeLimit * 60) - timeRemaining
      const minutesUsed = Math.floor(timeUsed / 60)
      const secondsUsed = timeUsed % 60
      
      showAlert(
        "🎉 Quiz Completed!", 
        `Great job! You used ${minutesUsed}:${secondsUsed.toString().padStart(2, '0')} out of ${timeLimit}:00.`,
        "success"
      )
    } else {
      showAlert(
        "🎉 Quiz Completed!", 
        "Great job! You've finished all the questions.",
        "success"
      )
    }
  }

  function handleAnimationComplete() {
    console.log('Animation complete, redirecting to results')
    
    if (!quizResults) {
      console.error('No quiz results available')
      return
    }
    
    // Store results in localStorage
    const resultsData = quizResults
    localStorage.setItem('quizResults', JSON.stringify(resultsData))
    
    // Create URL with results data and referrer info
    const resultsParam = encodeURIComponent(JSON.stringify(resultsData))
    const referrer = window.location.pathname
    const resultsUrl = `/quiz/results?results=${resultsParam}&referrer=${encodeURIComponent(referrer)}`
    
    // Redirect to results page
    router.push(resultsUrl)
  }

  function retake() {
    console.log('Retake clicked, resetting all states')
    
    // Reset all quiz states
    setAnswers({})
    setIdx(0)
    setFinished(false)
    setShowQuizAnimation(false)
    setShowQuestionFeedback(false)
    setQuizResults(null)
    setStartTime(Date.now())
    
    // Reset timer if time limit exists
    if (timeLimit && timeLimit > 0) {
      setTimeRemaining(timeLimit * 60)
    } else {
      setTimeRemaining(null)
    }
    
    // Show confirmation alert after reset
    setTimeout(() => {
      showAlert(
        "🔄 Quiz Reset", 
        "Your quiz has been reset. All answers have been cleared and you can start fresh!",
        "info"
      )
    }, 100) // Small delay to ensure state is properly reset
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
            <div className="flex flex-col gap-2">
                          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Quiz
            </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full border border-white/20">
                  {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                </span>
                <span className="px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full border border-white/20">
                  {total} question{total !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
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
              <div className="mt-6 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <div>Question {idx + 1} of {total}</div>
                {timeLimit && timeLimit > 0 && timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <span>Time:</span>
                    <span className={`font-mono font-bold ${
                      timeRemaining <= 60 ? 'text-red-500' : 
                      timeRemaining <= 120 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <QuizQuestion
                  question={current}
                  value={answers[current.id]}
                  onChange={(v) => setAnswer(current.id, v as any)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                {isLast ? (
                  <Button
                    onClick={submit}
                    disabled={!!(timeLimit && timeLimit > 0 && timeRemaining !== null && timeRemaining <= 0)}
                    className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {timeLimit && timeLimit > 0 && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Time limit: {timeLimit} minutes
                </div>
              )}
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
          isSuccess={quizResults?.summary?.score >= 60 || false}
          score={quizResults?.summary?.correctAnswers || 0}
          totalQuestions={quizResults?.summary?.totalQuestions || 1}
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

      {/* Styled Alert */}
      <StyledAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </main>
  )
}
