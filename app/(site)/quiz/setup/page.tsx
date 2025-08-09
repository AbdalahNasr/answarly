"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getAllQuestions } from "@/lib/questions"
import { getCategoryNames } from "@/lib/categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Reveal from "@/components/reveal"

export default function QuizSetupPage() {
  const router = useRouter()
  const all = getAllQuestions()

  const categories = useMemo(() => {
    const names = getCategoryNames()
    return ["all", ...names]
  }, [])

  const levels = ["all", "easy", "medium", "hard"] as const

  const [category, setCategory] = useState<string>(categories[0] || "all")
  const [level, setLevel] = useState<(typeof levels)[number]>("all")
  const [count, setCount] = useState<number>(5)

  const maxForSelection = useMemo(() => {
    const filtered = all.filter((q) => (category === "all" ? true : q.category === category))
    const filteredByLevel = filtered.filter((q) => (level === "all" ? true : q.difficulty === level))
    return Math.max(1, filteredByLevel.length || 10)
  }, [all, category, level])

  const start = () => {
    const c = Math.max(1, Math.min(count, 50))
    const params = new URLSearchParams({
      category,
      level,
      count: String(c),
    })
    // Navigate to the quiz page that shows questions
    router.push(`/quiz?${params.toString()}`)
  }

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {"Quiz Setup"}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {"Choose a category, difficulty, and how many questions you’d like to practice."}
            </p>
          </Reveal>

          <div className="mt-8 max-w-2xl">
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{"Configure your quiz"}</CardTitle>
              </CardHeader>
              <CardContent className="relative grid gap-5">
                <div className="grid gap-2">
                  <Label className="text-sm">{"Category"}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm">{"Difficulty"}</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm">
                    {"Number of questions"}
                    <span className="ml-2 text-xs text-zinc-500">{`(up to ${Math.max(1, maxForSelection)})`}</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={start}
                    className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                    {"Start Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
