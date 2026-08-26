"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, ChevronLeft, ChevronRight, X, Save, Send } from "lucide-react"
import AddQuestionForm from "@/components/add-question-form"
import { DebugPageListeners } from "@/hooks/use-debug"
import { fetchCategories, createCategoryApi } from "@/lib/api/categories"
import { fetchSubcategoriesByCategory, createSubcategoryApi } from "@/lib/api/subcategories"
import { createQuestionApi } from "@/lib/api/questions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export default function CreateQuestionPage() {
  const [justAdded, setJustAdded] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(1)
  
  const [jsonText, setJsonText] = useState("")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  // -- Existing Logic: JSON Import --
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
      let categories = await fetchCategories()

      for (const item of list) {
        const name = (item.category || "").trim()
        if (!name) continue
        let categoryId = categories.find((c) => (c.name || "").toLowerCase() === name.toLowerCase())?._id
        if (!categoryId) {
          try {
            const created = await createCategoryApi({ name })
            categoryId = created?.category?._id || created?._id
            categories = await fetchCategories()
          } catch {}
        }
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
        try {
          await createQuestionApi({
            text: item.question,
            type: item.type,
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

  const handleQuestionAdded = () => {
    setJustAdded(true)
    setTotalQuestions(prev => prev + 1)
    setCurrentQuestion(prev => prev + 1)
  }

  return (
    <main className="w-full bg-[#0A0B1A] min-h-screen text-[#e7e6fc]">
      <DebugPageListeners page="qa-add-question" />
      
      {/* SECONDARY HEADER BAR */}
      <div className="bg-[#111223]/50 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-[#aaa9be] hover:text-[#e7e6fc]">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#464658]" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/my-questions" className="text-[#aaa9be] hover:text-[#e7e6fc]">My Questions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#464658]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#e7e6fc] font-bold">Create Question</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-8">
          {/* Question Counter */}
          <div className="flex items-center gap-4 bg-[#0A0B1A]/40 px-4 py-2 rounded-full border border-[#464658]/20">
            <button className="text-[#464658] hover:text-fuchsia-400 disabled:opacity-20" disabled><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#aaa9be]">
              Question {currentQuestion} of {totalQuestions}
            </span>
            <button className="text-[#464658] hover:text-fuchsia-400 disabled:opacity-20" disabled><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-[#aaa9be] hover:text-red-400 hover:bg-red-400/10 rounded-xl">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#111223] border-[#464658]/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#e7e6fc]">Discard changes?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#aaa9be]">Any unsaved progress will be permanently lost.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#1d1e32] text-[#e7e6fc] border-none">Keep Editing</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 border-none">Discard</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-[#aaa9be] hover:text-fuchsia-400 hover:bg-fuchsia-400/10 rounded-xl">
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#111223] border-[#464658]/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#e7e6fc]">Save as draft?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#aaa9be]">You can return and finish this question later.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#1d1e32] text-[#e7e6fc] border-none">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-fuchsia-600 text-white hover:bg-fuchsia-700 border-none">Save Draft</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/20">
                  <Send className="w-4 h-4 mr-2" /> Publish Quiz
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#111223] border-[#464658]/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#e7e6fc]">Ready to publish?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#aaa9be]">This will make the quiz available to your learners immediately.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#1d1e32] text-[#e7e6fc] border-none">Not Yet</AlertDialogCancel>
                  <AlertDialogAction className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white border-none">Publish Now</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <section className="w-full">
        <div className="max-w-7xl mx-auto p-6 lg:p-12">
          
          {justAdded && (
            <Alert className="mb-12 rounded-2xl border-none bg-[#1d1e32] text-[#e7e6fc] shadow-[0_0_20px_rgba(192,38,211,0.1)]">
              <CheckCircle2 className="h-5 w-5 text-fuchsia-500" />
              <AlertTitle className="text-lg font-bold">Saved Successfully</AlertTitle>
              <AlertDescription className="text-[#aaa9be]">Your question was added to the database.</AlertDescription>
            </Alert>
          )}

          <div className="w-full">
            <AddQuestionForm onAdded={handleQuestionAdded} />
          </div>

          {/* JSON Import Section */}
          <div className="mt-24 grid gap-4 max-w-4xl mx-auto rounded-2xl bg-[#111223] p-10 border-none shadow-2xl">
            <h2 className="text-2xl font-black text-[#e7e6fc] tracking-tight">Bulk Import</h2>
            <p className="text-[#aaa9be] text-sm">
              Paste JSON for one question or an array of questions. For true/false, you can include a
              <code className="mx-2 text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded font-mono text-sm">reason</code>.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Example: [{"question":"JS is single-threaded?","type":"true_false","answer":"true"}]'
              className="min-h-[160px] rounded-xl bg-[#0A0B1A] border-none focus:ring-2 focus:ring-fuchsia-600/40 transition-shadow p-6 font-mono text-sm outline-none text-[#e7e6fc] placeholder:text-[#23243a]"
            />
            {jsonError && <p className="text-sm text-fuchsia-500 font-medium">{jsonError}</p>}
            <div className="pt-4 flex justify-end">
              <Button 
                onClick={importJson} 
                disabled={importing} 
                className="rounded-xl px-10 h-14 bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                {importing ? "Processing..." : "Import JSON"}
              </Button>
            </div>
          </div>
          
        </div>
      </section>
    </main>
  )
}
