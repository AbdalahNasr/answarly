"use client"

import { useEffect, useState } from "react"
import { getHistory, clearHistory } from "@/lib/history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Trash2 } from "lucide-react"
import { useI18n } from "@/components/i18n"
import Link from "next/link"
import GradientLoader from "@/components/gradient-loader"

export default function HistoryPage() {
  const { dict } = useI18n()
  const [items, setItems] = useState(getHistory())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "answerly-history") setItems(getHistory())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const wipe = () => {
    setLoading(true)
    setTimeout(() => {
      clearHistory()
      setItems([])
      setLoading(false)
    }, 500)
  }

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {dict.historyPage.title}
            </h1>
            <Button
              variant="outline"
              onClick={wipe}
              disabled={loading || items.length === 0}
              className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
            >
              {loading ? <GradientLoader size={18} /> : <Trash2 className="h-4 w-4" />}
              <span className="ml-2">{dict.historyPage.clear}</span>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {items.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">{dict.historyPage.empty}</p>
            ) : (
              items.map((it) => (
                <Card
                  key={it.id}
                  className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm"
                >
                  <span className="pointer-events-none absolute -inset-1 opacity-0 hover:opacity-100 transition duration-500 transform hover:scale-105 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
                  <CardHeader className="relative">
                    <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">{it.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{it.answer}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(it.ts).toLocaleString()}
                      </span>
                      <Link href={`/qa?q=${encodeURIComponent(it.question)}`} className="underline hover:no-underline">
                        {dict.historyPage.open}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
