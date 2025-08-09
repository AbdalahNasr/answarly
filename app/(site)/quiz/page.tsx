"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAllQuestions, type Question } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import QuestionCard from "@/components/question-card"
import Reveal from "@/components/reveal"
import { DebugPageListeners } from "@/hooks/use-debug"

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const router = useRouter()
  const params = useSearchParams()
  const category = params.get("category") || ""
  const level = (params.get("level") || "") as "easy" | "medium" | "hard" | "all" | ""
  const count = Math.max(1, Math.min(Number(params.get("count") || 5), 50))

  const all = getAllQuestions()

  const selected = useMemo(() => {
    let list = all
    if (category && category !== "all") list = list.filter((q) => q.category === category)
    if (level && level !== "all") list = list.filter((q) => q.difficulty === level)
    return shuffle(list).slice(0, count)
  }, [all, category, level, count])

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
                  {category ? `Category: ${category}` : "All categories"} •{" "}
                  {level && level !== "all" ? `Level: ${level}` : "All levels"} • {`Questions: ${selected.length}`}
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
            {selected.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                {"No questions found for this selection. Try a different setup."}
              </p>
            ) : (
              selected.map((q: Question) => <QuestionCard key={q.id} q={q} />)
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
