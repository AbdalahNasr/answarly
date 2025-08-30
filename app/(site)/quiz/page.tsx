"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/question-card"
import Reveal from "@/components/reveal"
import { DebugPageListeners } from "@/hooks/use-debug"
import { startQuiz } from "@/lib/quiz"
import { fetchCategories, fetchCategoryTree, type Category } from "@/lib/categories"
import { saveQuizResult, type QuizAnswer } from "@/lib/quiz-results"
import { useToast } from "@/hooks/use-toast"

export default function QuizPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useSearchParams()
  const categoryId = params.get("category") || ""
  const questionType = params.get("type") || "multiple_choice"
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [saving, setSaving] = useState(false)

  // Get category path for display
  const categoryPath = useMemo(() => {
    if (!categoryId) return "Unknown category"
    
    // If categoryId is not a valid ObjectId, it's a custom category name
    if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
      return categoryId
    }
    
    // Find the category in the tree and get its path
    const findCategoryPath = (cats: Category[], targetId: string): string[] | null => {
      for (const cat of cats) {
        if (cat._id === targetId) {
          return cat.path
        }
        if (cat.children) {
          const found = findCategoryPath(cat.children, targetId)
          if (found) return found
        }
      }
      return null
    }
    
    const path = findCategoryPath(categories, categoryId)
    return path ? path.join(" > ") : "Unknown category"
  }, [categoryId, categories])

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)
        setStartTime(Date.now()) // Reset start time when questions load
        
        // Check if user is authenticated
        const token = localStorage.getItem('answerly-token')
        if (!token) {
          setError('Please log in to take quizzes. Your progress will be saved.')
          setQuestions([])
          return
        }
        
        // Convert frontend params to backend format
        const quizOptions = {
          category: categoryId,
          difficulty: level === "all" ? undefined : level,
          limit: count,
          questionType: questionType
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
  }, [categoryId, level, count, questionType])

  // Load categories for path resolution
  useEffect(() => {
    async function loadCategories() {
      try {
        const tree = await fetchCategoryTree()
        setCategories(tree)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    
    loadCategories()
  }, [])

  const [finished, setFinished] = useState(false)
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    void seed
  }, [seed])

  // Handle answer updates from QuestionCard components
  const handleAnswerUpdate = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  // Calculate quiz results
  const calculateResults = () => {
    const quizAnswers: QuizAnswer[] = []
    let correctAnswers = 0

    console.log('Questions data:', questions) // Debug: log questions structure

    questions.forEach(question => {
      console.log('Processing question:', question) // Debug: log individual question
      
      const selectedAnswer = answers[question.id] || ""
      // Since the frontend doesn't have access to correct answers, we'll send the data to backend for scoring
      const correctAnswer = "" // Will be calculated on backend

      console.log('Answer data:', {
        questionId: question.id,
        selectedAnswer,
        questionText: question.question || question.text || question.questionText
      })

      quizAnswers.push({
        questionId: question.id,
        questionText: question.question || question.text || question.questionText || "Unknown question",
        selectedAnswer,
        correctAnswer: "", // Will be filled by backend
        isCorrect: false // Will be calculated by backend
      })
      
      console.log('Added answer:', {
        questionId: question.id,
        questionText: question.question || question.text || question.questionText,
        selectedAnswer
      })
    })

    // We'll let the backend calculate the score
    const score = 0 // Will be calculated by backend
    const timeSpent = Math.floor((Date.now() - startTime) / 1000) // in seconds

    console.log('Final results:', { correctAnswers: 0, score, timeSpent, answersCount: quizAnswers.length })

    return {
      correctAnswers: 0, // Will be calculated by backend
      score,
      timeSpent,
      answers: quizAnswers
    }
  }

  // Save quiz results
  const saveResults = async () => {
    try {
      setSaving(true)
      
      const results = calculateResults()
      const categoryName = categoryPath

      const quizData = {
        category: categoryId,
        categoryName,
        questionType,
        difficulty: level === "all" ? "mixed" : level,
        totalQuestions: questions.length,
        correctAnswers: results.correctAnswers,
        answers: results.answers,
        timeSpent: results.timeSpent
      }

      console.log('Saving quiz data:', quizData) // Debug: log the data being sent

      const savedResult = await saveQuizResult(quizData)
      
      // Get the actual score from the saved result
      const actualScore = savedResult.result?.score || results.score
      const actualCorrectAnswers = savedResult.result?.correctAnswers || results.correctAnswers

      toast({
        title: 'Quiz completed!',
        description: `Score: ${Math.round(actualScore)}% (${actualCorrectAnswers}/${questions.length} correct)`,
      })

    } catch (error: any) {
      console.error('Failed to save quiz results:', error)
      toast({
        title: 'Error',
        description: 'Failed to save quiz results. Your score may not be recorded.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const retake = () => {
    setFinished(false)
    setSeed(Date.now())
    setAnswers({})
  }

  const backToSetup = () => {
    router.push("/quiz/setup")
  }

  const handleFinish = async () => {
    setFinished(true)
    await saveResults()
  }

  if (loading) {
    return (
      <main>
        <DebugPageListeners page="quiz" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
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
        <DebugPageListeners page="quiz" />
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              {error.includes('log in') ? (
                <div className="space-y-3">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    You need to be logged in to take quizzes and save your progress.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/login">
                      <Button className="rounded-full bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500 text-white">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" className="rounded-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full bg-transparent" 
                  onClick={backToSetup}
                >
                  Back to Setup
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main key={seed}>
      <DebugPageListeners page="quiz" />
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {"Quiz"}
                </h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {categoryPath} • {questionType.replace("_", " ")} • {level && level !== "all" ? `Level: ${level}` : "All levels"} • {`Questions: ${questions.length}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full bg-transparent" onClick={backToSetup}>
                  {"Back to Setup"}
                </Button>
                <Button
                  className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  onClick={handleFinish}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Finish"}
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {questions.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                {"No questions found for this selection. Try a different setup."}
              </p>
            ) : (
              questions.map((q: any) => (
                <QuestionCard 
                  key={q.id} 
                  q={q} 
                  onAnswerUpdate={(answer) => handleAnswerUpdate(q.id, answer)}
                />
              ))
            )}
          </div>

          {finished && (
            <div className="mt-10 rounded-2xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {"Great job! You can retake with the same selections or change them in setup."}
                </p>
                {(() => {
                  const results = calculateResults()
                  return (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Score: {Math.round(results.score)}% ({results.correctAnswers}/{questions.length} correct)
                    </p>
                  )
                })()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full bg-transparent" onClick={backToSetup}>
                  {"Change Setup"}
                </Button>
                <Button
                  className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  onClick={retake}
                >
                  {"Retake"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
