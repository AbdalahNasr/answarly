"use client"

import { useMemo, useState } from "react"
import type { Question } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  Clipboard, 
  ClipboardCheck, 
  Code2, 
  ListChecks, 
  BadgeCheck,
  Headphones,
  FormInput,
  Shuffle,
  AlignJustify,
  Calculator,
  BarChart,
  Layers,
  Image as ImageIcon
} from "lucide-react"
import { useInputDebug, isDebugEnabled } from "@/hooks/use-debug"
import { MediaPlayer } from "@/components/media-player"

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import 'katex/dist/katex.min.css';
import katex from 'katex';

type QuizValue =
  | { choice?: string }
  | { tf?: "true" | "false" }
  | { code?: string; output?: string }
  | { text?: string }
  | { blanks?: string[] }
  | { pairs?: Array<{ left: string; right: string }> }
  | { order?: string[] }
  | { labels?: Array<{ x: number; y: number; text: string }> }

function SortableItem({ id, content }: { id: string; content: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-2 rounded-xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 cursor-grab active:cursor-grabbing hover:shadow-sm"
    >
      {content}
    </div>
  );
}

import { useI18n } from "@/components/i18n"

export default function QuizQuestion({
  question,
  value,
  onChange,
}: {
  question: Question
  value: QuizValue | undefined
  onChange: (v: QuizValue) => void
}) {
  const { dict } = useI18n()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const typeBadge = useMemo(() => {
    const label = dict.questionTypes[question.type as keyof typeof dict.questionTypes] || question.type
    switch (question.type) {
      case "multiple_choice":
        return { icon: <ListChecks className="h-3.5 w-3.5" />, label }
      case "true_false":
        return { icon: <BadgeCheck className="h-3.5 w-3.5" />, label }
      case "code_snippet":
        return { icon: <Code2 className="h-3.5 w-3.5" />, label }
      case "listening":
        return { icon: <Headphones className="h-3.5 w-3.5" />, label }
      case "fill_in_blank":
        return { icon: <FormInput className="h-3.5 w-3.5" />, label }
      case "match_pairs":
        return { icon: <Shuffle className="h-3.5 w-3.5" />, label }
      case "ordering":
        return { icon: <AlignJustify className="h-3.5 w-3.5" />, label }
      case "math_equation":
        return { icon: <Calculator className="h-3.5 w-3.5" />, label }
      case "graph_chart":
        return { icon: <BarChart className="h-3.5 w-3.5" />, label }
      case "diagram_label":
        return { icon: <Layers className="h-3.5 w-3.5" />, label }
      case "image_mcq":
        return { icon: <ImageIcon className="h-3.5 w-3.5" />, label }
      default:
        return { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label }
    }
  }, [question.type, dict])

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
            {/* Display question heading if it exists and showHeading is true */}
            {(question as any).heading && (question as any).contentLayout?.showHeading && (
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                {(question as any).heading}
              </h3>
            )}
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
        {/* Display description and media if they exist */}
        {((question as any).description || (question as any).media?.length > 0) && (
          <div className="mb-6 space-y-4">
            {/* Display description before media if configured */}
            {(question as any).description && (question as any).contentLayout?.showDescription &&
             (question as any).contentLayout?.descriptionPosition === "before" && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {(question as any).description}
              </p>
            )}

            {/* Display media */}
            {(question as any).media && (question as any).media.length > 0 && (
              <MediaPlayer media={(question as any).media} />
            )}

            {/* Display description after media if configured */}
            {(question as any).description && (question as any).contentLayout?.showDescription &&
             (question as any).contentLayout?.descriptionPosition === "after" && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {(question as any).description}
              </p>
            )}
          </div>
        )}

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

        {question.type === "listening" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-primary">
                <Headphones className="w-4 h-4" />
                <span>Audio Prompt</span>
              </div>
              <audio src={question.audioUrl} controls className="w-full h-10" />
            </div>

            {question.listeningAnswerFormat === "mcq" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(question.options || []).map((opt) => {
                  const active = (value as any)?.choice === opt
                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      onClick={() => onChange({ choice: opt })}
                      className={cn(
                        "justify-start rounded-xl border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-left",
                        active && "ring-2 ring-primary",
                      )}
                    >
                      <span className="truncate">{opt}</span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300">Your transcription/answer</Label>
                <Textarea
                  value={(value as any)?.text || ""}
                  onChange={(e) => onChange({ text: e.target.value })}
                  placeholder={"What did you hear?"}
                  className="min-h-[100px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                />
              </div>
            )}
          </div>
        )}

        {question.type === "fill_in_blank" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-muted/20 border border-white/10 leading-loose text-lg">
              {question.blankTemplate?.split(/___/).map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <input
                      type="text"
                      value={(value as any)?.blanks?.[i] || ""}
                      onChange={(e) => {
                        const newBlanks = [...((value as any)?.blanks || [])]
                        newBlanks[i] = e.target.value
                        onChange({ blanks: newBlanks })
                      }}
                      className="mx-2 w-32 h-8 px-2 rounded-lg bg-primary/10 border-b-2 border-primary outline-none focus:bg-primary/20 transition-all text-sm font-bold text-center"
                      placeholder={`...`}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {question.type === "ordering" && (
          <div className="space-y-4">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  const oldOrder = (value as any)?.order || question.orderItems || [];
                  const oldIndex = oldOrder.indexOf(active.id);
                  const newIndex = oldOrder.indexOf(over.id);
                  onChange({ order: arrayMove(oldOrder, oldIndex, newIndex) });
                }
              }}
            >
              <SortableContext 
                items={(value as any)?.order || question.orderItems || []}
                strategy={verticalListSortingStrategy}
              >
                {((value as any)?.order || question.orderItems || []).map((item: string) => (
                  <SortableItem key={item} id={item} content={item} />
                ))}
              </SortableContext>
            </DndContext>
            <p className="text-[10px] text-muted-foreground italic text-center">Drag items to reorder them correctly.</p>
          </div>
        )}

        {question.type === "match_pairs" && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Terms</Label>
              {(question.matchPairs || []).map((pair, i) => (
                <div key={i} className="h-14 flex items-center px-4 rounded-xl bg-muted/20 border border-white/5 font-bold text-sm">
                  {pair.left}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Definitions</Label>
              {(question.matchPairs || []).map((_, i) => (
                <select
                  key={i}
                  value={(value as any)?.pairs?.[i]?.right || ""}
                  onChange={(e) => {
                    const newPairs = [...((value as any)?.pairs || (question.matchPairs || []).map(p => ({ left: p.left, right: "" })))]
                    newPairs[i] = { left: question.matchPairs![i].left, right: e.target.value }
                    onChange({ pairs: newPairs })
                  }}
                  className="w-full h-14 px-4 rounded-xl bg-white/90 dark:bg-white/5 border border-white/60 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                >
                  <option value="">Select match...</option>
                  {(question.matchPairs || []).map(p => p.right).sort().map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}

        {question.type === "math_equation" && (
          <div className="space-y-6">
            <div className="p-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
              <div 
                className="text-3xl"
                dangerouslySetInnerHTML={{ 
                  __html: question.latex ? katex.renderToString(question.latex, { throwOnError: false }) : "" 
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-600 dark:text-zinc-300">Your solution</Label>
              <Input
                value={(value as any)?.text || ""}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder="Enter value..."
                className="h-14 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 px-6 text-lg font-bold"
              />
            </div>
          </div>
        )}

        {question.type === "diagram_label" && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
              {(question as any).media?.[0]?.url && (
                <img src={(question as any).media[0].url} className="w-full h-auto" />
              )}
              {(question.diagramLabels || []).map((l, i) => (
                <div 
                  key={i} 
                  className="absolute h-8 w-8 -ml-4 -mt-4 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white shadow-xl cursor-help group/pin" 
                  style={{ left: `${l.x}%`, top: `${l.y}%` }}
                >
                  {i + 1}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 text-[10px] whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity">
                    Label #{i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(question.diagramLabels || []).map((l, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 border border-white/5">
                  <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                    {i + 1}
                  </span>
                  <Input
                    value={(value as any)?.labels?.find((item: any) => item.id === String(i))?.text || ""}
                    onChange={(e) => {
                      const oldLabels = (value as any)?.labels || []
                      const index = oldLabels.findIndex((item: any) => item.id === String(i))
                      const newLabels = [...oldLabels]
                      if (index > -1) {
                        newLabels[index] = { id: String(i), text: e.target.value, x: l.x, y: l.y }
                      } else {
                        newLabels.push({ id: String(i), text: e.target.value, x: l.x, y: l.y })
                      }
                      onChange({ labels: newLabels })
                    }}
                    placeholder="Identification..."
                    className="flex-1 bg-transparent border-none h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {(question.type === "graph_chart" || question.type === "image_mcq") && (
          <div className="space-y-6">
            {question.type === "image_mcq" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(question.options || []).map((opt) => {
                  const active = (value as any)?.choice === opt
                  return (
                    <Button
                      key={opt}
                      variant="outline"
                      onClick={() => onChange({ choice: opt })}
                      className={cn(
                        "justify-start rounded-xl border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-left",
                        active && "ring-2 ring-primary",
                      )}
                    >
                      <span className="truncate">{opt}</span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-600 dark:text-zinc-300">Your synthesis</Label>
                <Textarea
                  value={(value as any)?.text || ""}
                  onChange={(e) => onChange({ text: e.target.value })}
                  placeholder={"Enter your answer..."}
                  className="min-h-[100px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                />
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}
