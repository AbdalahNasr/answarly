"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import AddQuestionForm from "@/components/add-question-form"
import Reveal from "@/components/reveal"
import { DebugPageListeners } from "@/hooks/use-debug"
import { fetchCategories, createCategoryApi } from "@/lib/api/categories"
import { fetchSubcategoriesByCategory, createSubcategoryApi } from "@/lib/api/subcategories"
import { createQuestionApi } from "@/lib/api/questions"

export default function CreateQuestionPage() {
  const [justAdded, setJustAdded] = useState(false)
  const [jsonText, setJsonText] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  type ImportQuestion = {
    question: string
    type: "multiple_choice" | "true_false" | "code_snippet" | "open_ended"
    options?: string[]
    answer?: string
    code?: string
    category: string
    subcategory?: string
    reason?: string
    difficulty?: "easy" | "medium" | "hard"
  }

  const importJson = async () => {
    if (!jsonText.trim()) return
    setJsonError(null)
    setImporting(true)
    try {
      const parsed = JSON.parse(jsonText)
      const list: ImportQuestion[] = Array.isArray(parsed) ? parsed : [parsed]

      // Preload categories
      let categories = await fetchCategories()

      for (const item of list) {
        const name = (item.category || "").trim()
        if (!name) continue

        // Resolve or create category id
        let categoryId = categories.find((c) => (c.name || "").toLowerCase() === name.toLowerCase())?._id
        if (!categoryId) {
          try {
            const created = await createCategoryApi({ name })
            categoryId = created?.category?._id || created?._id
            categories = await fetchCategories()
          } catch {}
        }

        // Resolve or create subcategory id
        let subCategoryId: string | undefined
        if (item.subcategory && categoryId) {
          try {
            const subs = await fetchSubcategoriesByCategory(categoryId)
            const exist = subs.find((s) => (s.name || "").toLowerCase() === item.subcategory!.toLowerCase())
            if (exist?._id) subCategoryId = exist._id
            else {
              const createdSub = await createSubcategoryApi({ name: item.subcategory, category: categoryId })
              subCategoryId = createdSub?.sub?._id || createdSub?._id
            }
          } catch {}
        }

        // Try server create; fallback to client store
        try {
          await createQuestionApi({
            text: item.question,
            options: item.type === "multiple_choice" ? (item.options || []) : undefined,
            correctAnswer: item.type === "multiple_choice" || item.type === "true_false" ? (item.answer || "") : undefined,
            category: (categoryId as any) || name,
            subCategory: subCategoryId,
            reason: item.type === "true_false" ? item.reason : undefined,
            difficulty: item.difficulty,
          })
        } catch {
          const { addQuestion } = require("@/lib/questions") as typeof import("@/lib/questions")
          addQuestion({
            question: item.question,
            type: item.type,
            options: item.type === "multiple_choice" ? (item.options || []) : undefined,
            answer: item.type === "multiple_choice" || item.type === "true_false" ? (item.answer || "") : undefined,
            code: item.type === "code_snippet" ? item.code : undefined,
            category: name,
            subcategory: item.subcategory,
            reason: item.type === "true_false" ? item.reason : undefined,
            difficulty: item.difficulty,
          })
        }
      }

      setJustAdded(true)
      setJsonText("")
    } catch (e: any) {
      setJsonError(e?.message || "Invalid JSON format")
    } finally {
      setImporting(false)
    }
  }

  return (
    <main>
      {/* Toggle with Alt+D or ?debug=1, then run window.AnswerlyDebug.report() */}
      <DebugPageListeners page="qa-add-question" />
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {"Create a Question"}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {
                  "Use the form below to add a new question. Choose a category (or create one), select a difficulty, and provide the question details."
                }
              </p>
            </div>
          </Reveal>

          <div className="mt-6 max-w-3xl">
            {justAdded && (
              <Alert className="mb-6 rounded-2xl border-white/60 dark:border-white/10 bg-white/90 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{"Saved"}</AlertTitle>
                <AlertDescription>{"Your question was added successfully."}</AlertDescription>
              </Alert>
            )}

            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              {/* Ensure overlay sits behind content */}
              <span className="pointer-events-none absolute -inset-1 -z-10 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{"Question Details"}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <AddQuestionForm onAdded={() => setJustAdded(true)} />
              </CardContent>
            </Card>

            <div className="mt-8 grid gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Import questions (JSON)</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Paste JSON for one question or an array of questions. For true/false, you can include a
                <code className="mx-1">reason</code> that is shown after answering.
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Example: [{"question":"JS is single-threaded?","type":"true_false","answer":"true","reason":"The runtime uses an event loop on a single thread.","category":"Programming Languages","subcategory":"JavaScript","difficulty":"easy"}]'
                className="min-h-[160px] rounded-xl bg-white/90 dark:bg-white/5 border border-white/60 dark:border-white/10 p-3 font-mono text-sm"
              />
              {jsonError && <p className="text-sm text-rose-600">{jsonError}</p>}
              <div>
                <Button onClick={importJson} disabled={importing} className="rounded-full">
                  {importing ? "Importing..." : "Import"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
