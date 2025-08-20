"use client"

import { useMemo, useState } from "react"
import type { Question } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clipboard, ClipboardCheck, Code2, ListChecks, BadgeCheck } from "lucide-react"
import { useInputDebug, isDebugEnabled } from "@/hooks/use-debug"

type QuizValue =
  | { choice?: string }
  | { tf?: "true" | "false" }
  | { code?: string; output?: string }
  | { text?: string }

export default function QuizQuestion({
  question,
  value,
  onChange,
}: {
  question: Question
  value: QuizValue | undefined
  onChange: (v: QuizValue) => void
}) {
  const typeBadge = useMemo(() => {
    switch (question.type) {
      case "multiple_choice":
        return { icon: <ListChecks className="h-3.5 w-3.5" />, label: "Multiple Choice" }
      case "true_false":
        return { icon: <BadgeCheck className="h-3.5 w-3.5" />, label: "True / False" }
      case "code_snippet":
        return { icon: <Code2 className="h-3.5 w-3.5" />, label: "Code Snippet" }
      default:
        return { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Open Ended" }
    }
  }, [question.type])

  const dbgCode = useInputDebug(`quiz-code-${question.id}`)
  const dbgOutput = useInputDebug(`quiz-output-${question.id}`)
  const dbgText = useInputDebug(`quiz-text-${question.id}`)

  const [copied, setCopied] = useState<"starter" | "code" | "output" | null>(null)
  async function copy(text: string, which: "starter" | "code" | "output") {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1000)
    } catch {}
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
      {/* Ensure overlay is behind content and non-interactive */}
      <span className="pointer-events-none absolute -inset-1 -z-10 lg:opacity-100 opacity-0 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-2 py-0.5">
                {typeBadge.icon}
                <span>{typeBadge.label}</span>
              </span>
              {question.difficulty && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 border border-white/60 dark:border-white/10 text-amber-700 dark:text-amber-300">
                  {question.difficulty}
                </span>
              )}
            </div>
            <CardTitle className="mt-2 text-lg text-zinc-900 dark:text-zinc-50">{question.question}</CardTitle>
          </div>
          <span className="mt-1 inline-flex items-center rounded-full border border-white/60 dark:border-white/10 bg-gradient-to-r from-fuchsia-500/15 via-indigo-500/15 to-pink-500/15 px-2.5 py-0.5 text-xs text-zinc-800 dark:text-zinc-100">
            {question.category}
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {question.type === "multiple_choice" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(question.options || []).map((opt) => {
              const active = (value as any)?.choice === opt
              return (
                <Button
                  key={opt}
                  variant="outline"
                  onMouseDownCapture={(e) => {
                    if (isDebugEnabled()) {
                      // eslint-disable-next-line no-console
                      console.log("[DEBUG][quiz-mcq] mousedown", { opt, defaultPrevented: e.defaultPrevented })
                    }
                  }}
                  onClick={(e) => {
                    if (isDebugEnabled()) {
                      // eslint-disable-next-line no-console
                      console.log("[DEBUG][quiz-mcq] click", { opt, defaultPrevented: (e as any).defaultPrevented })
                    }
                    onChange({ choice: opt })
                  }}
                  className={cn(
                    "justify-start rounded-xl border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-left hover:shadow-sm",
                    active && "ring-2 ring-violet-500",
                  )}
                >
                  <span className="truncate">{opt}</span>
                </Button>
              )
            })}
          </div>
        )}

        {question.type === "true_false" && (
          <div className="grid grid-cols-2 gap-2">
            {(["true", "false"] as const).map((val) => {
              const active = (value as any)?.tf === val
              return (
                <Button
                  key={val}
                  aria-pressed={active}
                  onMouseDownCapture={(e) => {
                    if (isDebugEnabled()) {
                      // eslint-disable-next-line no-console
                      console.log("[DEBUG][quiz-tf] mousedown", { val, defaultPrevented: e.defaultPrevented })
                    }
                  }}
                  onClick={(e) => {
                    if (isDebugEnabled()) {
                      // eslint-disable-next-line no-console
                      console.log("[DEBUG][quiz-tf] click", { val, defaultPrevented: (e as any).defaultPrevented })
                    }
                    onChange({ tf: val })
                  }}
                  className={cn(
                    "h-12 rounded-xl border transition-colors",
                    active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  <span className="capitalize">{val}</span>
                  {active && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-white/80" />}
                </Button>
              )
            })}
            {(value as any)?.tf && question.reason && (
              <div className="col-span-2 mt-2 rounded-xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-3 text-sm text-zinc-700 dark:text-zinc-300">
                <strong className="block mb-1">Reason:</strong>
                <span>{question.reason}</span>
              </div>
            )}
          </div>
        )}

        {question.type === "code_snippet" && (
          <div className="space-y-4">
            {question.code && (
              <div className="relative">
                <Label className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300">Starter code</Label>
                <pre className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-white/60 dark:border-white/10 p-3 overflow-x-auto text-sm">
                  <code>{question.code}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-7 right-2 rounded-full bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10"
                  onClick={() => copy(question.code || "", "starter")}
                  aria-label="Copy starter code"
                >
                  {copied === "starter" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">Copy Code</span>
                </Button>
              </div>
            )}

            <div className="relative">
              <Label className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300">Your solution (code)</Label>
              <Textarea
                ref={dbgCode.ref as any}
                {...dbgCode.bind}
                value={(value as any)?.code || ""}
                onChange={(e) => onChange({ ...(value as any), code: e.target.value })}
                placeholder={"// Write your answer (code) here..."}
                className="min-h-[160px] font-mono rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                  onClick={() => copy(((value as any)?.code || "") as string, "code")}
                >
                  {copied === "code" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1">Copy Code</span>
                </Button>
              </div>
            </div>

            <div className="relative">
              <Label className="mb-2 inline-block text-xs text-zinc-600 dark:text-zinc-300">Your output (answer)</Label>
              <Textarea
                ref={dbgOutput.ref as any}
                {...dbgOutput.bind}
                value={(value as any)?.output || ""}
                onChange={(e) => onChange({ ...(value as any), output: e.target.value })}
                placeholder={'e.g., "olleh" or printed lines...'}
                className="min-h-[96px] font-mono rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                  onClick={() => copy(((value as any)?.output || "") as string, "output")}
                >
                  {copied === "output" ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  <span className="ml-1">Copy Output</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {question.type === "open_ended" && (
          <div className="space-y-2">
            <Label className="text-xs text-zinc-600 dark:text-zinc-300">Your answer</Label>
            <Textarea
              ref={dbgText.ref as any}
              {...dbgText.bind}
              value={(value as any)?.text || ""}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder={"Write your answer here..."}
              className="min-h-[120px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
