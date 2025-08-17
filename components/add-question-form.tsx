"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Difficulty, QuestionType } from "@/lib/questions"
import { addQuestion } from "@/lib/questions"
import { ensureCategory /* keep existing helper */ } from "@/lib/categories"
import { fetchCategories } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GradientLoader from "@/components/gradient-loader"
import { cn } from "@/lib/utils"
import { useInputDebug } from "@/hooks/use-debug"
import OptionField from "@/components/option-field"

type Props = { onAdded?: () => void }

export default function AddQuestionForm({ onAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [type, setType] = useState<QuestionType>("multiple_choice")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>("easy")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [answer, setAnswer] = useState("")
  const [code, setCode] = useState("")

  // Debug binders for critical, fixed fields (safe: not dynamic)
  const dbgCategory = useInputDebug("category")
  const dbgQuestion = useInputDebug("question")
  const dbgAnswer = useInputDebug("answer")
  const dbgCode = useInputDebug("code")

  // Datalist categories (loaded from backend)
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  useEffect(() => {
    let mounted = true
    fetchCategories()
      .then((cats) => {
        if (!mounted) return
        setCategoryNames(cats.map((c) => c.name || ""))
      })
      .catch(() => {
        // keep silent and allow fallback to local ensureCategory behavior
      })
    return () => {
      mounted = false
    }
  }, [])

  const mcqValidOptions = useMemo(() => options.map((o) => o.trim()).filter(Boolean), [options])
  const canSubmit = useMemo(() => {
    if (!question.trim() || !category.trim()) return false
    if (type === "multiple_choice")
      return mcqValidOptions.length >= 2 && !!answer.trim() && mcqValidOptions.includes(answer.trim())
    if (type === "true_false") return !!answer
    if (type === "code_snippet") return !!code.trim()
    return true
  }, [question, category, type, mcqValidOptions, answer, code])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setTimeout(() => {
      const cat = ensureCategory(category)
      addQuestion({
        question: question.trim(),
        type,
        options: type === "multiple_choice" ? mcqValidOptions : undefined,
        answer: type === "multiple_choice" || type === "true_false" ? answer.trim() : undefined,
        code: type === "code_snippet" ? code : undefined,
        category: cat.name,
        difficulty,
      })
      setLoading(false)
      setQuestion("")
      setCategory("")
      setOptions(["", "", "", ""])
      setAnswer("")
      setCode("")
      onAdded?.()
      // Refresh categories list after creating new ones
      fetchCategories()
        .then((cats) => setCategoryNames(cats.map((c) => c.name || "")))
        .catch(() => {
          /* ignore */
        })
    }, 300)
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
      {/* Ensure decorative overlay is behind and non-interactive */}
      <span className="pointer-events-none absolute -inset-1 -z-10 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
      <CardHeader className="relative">
        <CardTitle className="text-xl">Add Question</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="code_snippet">Code Snippet</SelectItem>
                  <SelectItem value="true_false">True / False</SelectItem>
                  <SelectItem value="open_ended">Open Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Category</Label>
              <Input
                ref={dbgCategory.ref as any}
                {...dbgCategory.bind}
                list="categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., JavaScript, React"
                className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 pointer-events-auto"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="text"
              />
              <datalist id="categories">
                {categoryNames.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-zinc-500">
                Choose an existing category or type a new one. It will be created on save.
              </p>
            </div>

            <div>
              <Label className="text-sm">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm">Question</Label>
            <Textarea
              ref={dbgQuestion.ref as any}
              {...dbgQuestion.bind}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Write the question..."
              className="min-h-[84px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 pointer-events-auto"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              inputMode="text"
            />
          </div>

          {/* Multiple Choice */}
          <div className={cn(type === "multiple_choice" ? "grid gap-2" : "hidden")}>
            <Label className="text-sm">Options</Label>
            {options.map((opt, idx) => (
              <OptionField
                key={idx}
                index={idx}
                value={opt}
                onChange={(val) =>
                  setOptions((prev) => {
                    const copy = [...prev]
                    copy[idx] = val
                    return copy
                  })
                }
                onRemove={() =>
                  setOptions((prev) => {
                    const copy = prev.filter((_, i) => i !== idx)
                    return copy.length ? copy : [""]
                  })
                }
              />
            ))}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-transparent"
                onClick={() => setOptions((o) => [...o, ""])}
              >
                Add option
              </Button>
            </div>

            <div className="grid gap-1">
              <Label className="text-sm">Correct Answer</Label>
              <Input
                ref={dbgAnswer.ref as any}
                {...dbgAnswer.bind}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Must exactly match one option above"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="text"
                className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 pointer-events-auto"
              />
              <div className="mt-1 flex flex-wrap gap-2">
                {mcqValidOptions.map((o) => (
                  <Button
                    key={o}
                    type="button"
                    variant="outline"
                    onClick={() => setAnswer(o)}
                    className={`h-7 rounded-full border-white/60 dark:border-white/10 ${
                      answer.trim() === o ? "bg-teal-600 text-white border-teal-600" : "bg-white/80 dark:bg-white/5"
                    }`}
                    aria-pressed={answer.trim() === o}
                  >
                    {o}
                  </Button>
                ))}
              </div>
              {(() => {
                const showError = answer.trim().length > 0 && !mcqValidOptions.includes(answer.trim())
                return showError ? (
                  <p className="text-xs text-rose-600">Answer must exactly match one of the options.</p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Enter the correct answer or click a chip above to fill automatically.
                  </p>
                )
              })()}
            </div>
          </div>

          {/* True / False */}
          <div className={cn(type === "true_false" ? "grid gap-2" : "hidden")}>
            <Label className="text-sm">Correct Answer</Label>
            <Select value={answer || ""} onValueChange={(v) => setAnswer(v)}>
              <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                <SelectValue placeholder="Select True or False" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code Snippet */}
          <div className={cn(type === "code_snippet" ? "grid gap-2" : "hidden")}>
            <Label className="text-sm">Code</Label>
            <Textarea
              ref={dbgCode.ref as any}
              {...dbgCode.bind}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste or write your code here"
              className="min-h-[140px] font-mono rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
            >
              {loading ? <GradientLoader size={18} /> : "Add Question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
