"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/question-card"
import Reveal from "@/components/reveal"
import { DebugPageListeners } from "@/hooks/use-debug"
import { startQuiz } from "@/lib/quiz"
import { fetchCategories, fetchCategoryTree, type Category } from "@/lib/categories"

export default function QuizPage() {
  const router = useRouter()
  const params = useSearchParams()
  const categoryId = params.get("category") || ""
  const questionType = params.get("type") || "multiple_choice"
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

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

  const retake = () => {
    setFinished(false)
    setSeed(Date.now())
  }

  const backToSetup = () => {
    router.push("/quiz/setup")
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
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-full bg-transparent" 
                onClick={backToSetup}
              >
                Back to Setup
              </Button>
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
                  onClick={() => setFinished(true)}
                >
                  {"Finish"}
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
              questions.map((q: any) => <QuestionCard key={q.id} q={q} />)
            )}
          </div>

          {finished && (
            <div className="mt-10 rounded-2xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {"Great job! You can retake with the same selections or change them in setup."}
              </p>
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
