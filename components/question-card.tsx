"use client"

import { useEffect, useMemo, useState } from "react"
import type { Question } from "@/lib/questions"
import {
  BadgeCheck,
  Code2,
  HelpCircle,
  ListChecks,
  CheckCircle2,
  XCircle,
  Clipboard,
  ClipboardCheck,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getProgress, setProgress } from "@/lib/progress"

function TypeIcon({ type }: { type: Question["type"] }) {
  switch (type) {
    case "code_snippet":
      return <Code2 className="h-4 w-4" />
    case "multiple_choice":
      return <ListChecks className="h-4 w-4" />
    case "true_false":
      return <BadgeCheck className="h-4 w-4" />
    default:
      return <HelpCircle className="h-4 w-4" />
  }
}

export default function QuestionCard({ q }: { q: Question }) {
  const [copiedStarter, setCopiedStarter] = useState(false)
  const [copiedUser, setCopiedUser] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)

  const [choice, setChoice] = useState<string | null>(null)
  const [tf, setTf] = useState<string | null>(null)

  // Open-ended answer text (persisted)
  const [text, setText] = useState("")

  // Code snippet user inputs (persisted)
  const [codeInput, setCodeInput] = useState(q.code || "")
  const [output, setOutput] = useState("")

  // Load persisted progress on mount
  useEffect(() => {
    const saved = getProgress(q.id)
    if (saved?.text !== undefined) setText(saved.text)
    if (saved?.code !== undefined) setCodeInput(saved.code)
    if (saved?.output !== undefined) setOutput(saved.output)
  }, [q.id])

  // Auto-save with small debounce for text/code/output
  useEffect(() => {
    const id = setTimeout(() => {
      if (q.type === "open_ended") setProgress(q.id, { text })
      if (q.type === "code_snippet") setProgress(q.id, { code: codeInput, output })
    }, 250)
    return () => clearTimeout(id)
  }, [q.id, q.type, text, codeInput, output])

  const isCorrect = useMemo(() => {
    if (q.type === "multiple_choice" && choice && q.answer) return choice === q.answer
    if (q.type === "true_false" && tf && q.answer) return tf === q.answer
    return null
  }, [q.type, choice, tf, q.answer])

  const categoryGradient = "from-fuchsia-500/15 via-indigo-500/15 to-pink-500/15"

  async function copyToClipboard(content: string, which: "starter" | "user" | "output") {
    try {
      await navigator.clipboard.writeText(content)
      if (which === "starter") {
        setCopiedStarter(true)
        setTimeout(() => setCopiedStarter(false), 1200)
      } else if (which === "user") {
        setCopiedUser(true)
        setTimeout(() => setCopiedUser(false), 1200)
      } else {
        setCopiedOutput(true)
        setTimeout(() => setCopiedOutput(false), 1200)
      }
    } catch {
      // ignore
    }
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      {/* Gradient overlay on hover */}
      <span className="pointer-events-none absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 transition duration-500 transform group-hover:scale-105 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-2">
                <TypeIcon type={q.type} />
                <span className="ml-1 capitalize">{q.type.replace("_", " ")}</span>
              </span>
              {q.difficulty && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 border border-white/60 dark:border-white/10",
                    q.difficulty === "easy" && "text-emerald-700 dark:text-emerald-300",
                    q.difficulty === "medium" && "text-amber-700 dark:text-amber-300",
                    q.difficulty === "hard" && "text-rose-700 dark:text-rose-300",
                  )}
                >
                  {q.difficulty}
                </span>
              )}
            </div>
            <CardTitle className="mt-2 text-lg text-zinc-900 dark:text-zinc-50">{q.question}</CardTitle>
          </div>
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full border border-white/60 dark:border-white/10 bg-gradient-to-r px-2.5 py-0.5 text-xs text-zinc-800 dark:text-zinc-100",
              categoryGradient,
            )}
          >
            {q.category}
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Code Snippet: Starter + User Code + Output input with Copy */}
        {q.type === "code_snippet" && (
          <div className="space-y-4">
            {q.code && (
              <div className="relative">
                <Label className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300">Starter code</Label>
                <pre className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-white/60 dark:border-white/10 p-3 overflow-x-auto text-sm">
                  <code>{q.code}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-7 right-2 rounded-full bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10"
                  onClick={() => copyToClipboard(q.code || "", "starter")}
                  aria-label="Copy starter code"
                >
                  {copiedStarter ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Copy Code</span>
                </Button>
              </div>
            )}

            <div className="relative">
              <Label
                htmlFor={`user-code-${q.id}`}
                className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300"
              >
                Your solution (code)
              </Label>
              <Textarea
                id={`user-code-${q.id}`}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder={"// Write your answer (code) here..."}
                className="min-h-[160px] font-mono rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                  onClick={() => copyToClipboard(codeInput || "", "user")}
                  aria-label="Copy your code"
                >
                  {copiedUser ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1">Copy Code</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setCodeInput("")}
                  aria-label="Clear your code"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1">Clear</span>
                </Button>
              </div>
            </div>

            {/* New: Expected/Your Output input */}
            <div className="relative">
              <Label
                htmlFor={`user-output-${q.id}`}
                className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300"
              >
                Your output (answer)
              </Label>
              <Textarea
                id={`user-output-${q.id}`}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder={'e.g., "olleh" or printed lines...'}
                className="min-h-[96px] font-mono rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                  onClick={() => copyToClipboard(output || "", "output")}
                  aria-label="Copy your output"
                >
                  {copiedOutput ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1">Copy Output</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice */}
        {q.type === "multiple_choice" && (
          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(q.options || []).map((opt) => {
              const active = choice === opt
              const correct = q.answer === opt
              const showState = choice !== null
              return (
                <Button
                  key={opt}
                  variant="outline"
                  className={cn(
                    "justify-start rounded-xl border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-left",
                    active && "ring-2 ring-violet-500",
                    showState && correct && "bg-emerald-500/10 dark:bg-emerald-400/10",
                    showState && active && !correct && "bg-rose-500/10 dark:bg-rose-400/10",
                  )}
                  onClick={() => setChoice(opt)}
                >
                  <span className="truncate">{opt}</span>
                  {showState && correct && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                  {showState && active && !correct && <XCircle className="ml-auto h-4 w-4 text-rose-500" />}
                </Button>
              )
            })}
          </div>
        )}

        {/* True / False */}
        {q.type === "true_false" && (
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["true", "false"] as const).map((val) => {
              const active = tf === val
              const correct = q.answer === val
              const showState = tf !== null
              return (
                <Button
                  key={val}
                  aria-pressed={active}
                  className={cn(
                    "h-12 rounded-xl border transition-colors",
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100",
                  )}
                  onClick={() => setTf(val)}
                >
                  <span className="capitalize">{val}</span>
                  {active && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-white/80" />}
                  {showState && correct && active && <CheckCircle2 className="ml-2 h-4 w-4 text-white" />}
                  {showState && !correct && active && <XCircle className="ml-2 h-4 w-4 text-white" />}
                </Button>
              )
            })}
          </div>
        )}

        {/* Open Ended */}
        {q.type === "open_ended" && (
          <div className="space-y-2">
            <Label htmlFor={`open-ended-${q.id}`} className="text-xs text-zinc-600 dark:text-zinc-300">
              Your answer
            </Label>
            <Textarea
              id={`open-ended-${q.id}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Write your answer here..."}
              className="min-h-[120px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
            />
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{"This question isn't auto-graded."}</span>
              <span>{text.length} chars</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
