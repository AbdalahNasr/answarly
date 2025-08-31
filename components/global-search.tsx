"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getTrendingTopics, type Topic } from "@/lib/topics"
import { useI18n } from "@/components/i18n"
import Link from "next/link"
import GradientLoader from "@/components/gradient-loader"

export default function GlobalSearch() {
  const { dict, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [isPending, startTransition] = useTransition()
  const [topics, setTopics] = useState<Topic[]>([])

  // Fetch topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const trendingTopics = await getTrendingTopics(20)
        setTopics(trendingTopics)
      } catch (error) {
        console.error('Error fetching topics for search:', error)
      }
    }

    fetchTopics()
  }, [])

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      try {
        // Safely normalize key
        const rawKey = e && typeof e.key === "string" ? e.key : ""
        const key = rawKey ? rawKey.toLowerCase() : ""
        // Fallback for older browsers/environments
        const isK = key ? key === "k" : "keyCode" in e && (e as any).keyCode === 75

        if ((e.ctrlKey || e.metaKey) && isK) {
          e.preventDefault()
          setOpen((o) => !o)
        }
      } catch {
        // Silently ignore unexpected keyboard event shapes
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const [debouncedQ, setDebouncedQ] = useState("")
  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => setDebouncedQ(q))
    }, 200) // simulate fetch/debounce; shows loader
    return () => clearTimeout(id)
  }, [q])

  const results = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase()
    if (!needle) return []
    return topics.filter((t) => {
      const title = t.title[lang].toLowerCase()
      const desc = t.description[lang].toLowerCase()
      return title.includes(needle) || desc.includes(needle) || t.tags.some((tag) => tag.toLowerCase().includes(needle))
    })
  }, [topics, debouncedQ, lang])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-full max-w-sm"
        aria-label={dict.ui.openSearch}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
        <div className="rounded-xl bg-white/90 dark:bg-white/5 border border-white/60 dark:border-white/10 px-9 py-2 text-sm text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-400 transition-colors hover:bg-white dark:hover:bg-white/10">
          {dict.ui.searchPlaceholder}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
          ⌘K
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {dict.ui.searchAria}
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={dict.ui.searchPlaceholder}
              className="pl-9 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-colors"
            />
            {isPending && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <GradientLoader size="sm" />
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              {dict.topics.title}
            </div>

            <ul className="mt-4 max-h-[50vh] overflow-y-auto space-y-2">
              {results.length === 0 ? (
                <li className="text-sm text-zinc-600 dark:text-zinc-400 px-2 py-6 text-center">{dict.ui.noResults}</li>
              ) : (
                results.map((t) => {
                  // Create quiz setup URL with category information
                  const quizSetupUrl = t.categoryId 
                    ? `/quiz/setup?category=${t.categoryId}`
                    : `/quiz/setup?category=${t.title[lang]}`

                  return (
                    <li key={t.slug}>
                      <Link
                        href={quizSetupUrl}
                        onClick={() => setOpen(false)}
                        className="group block rounded-xl border border-white/60 dark:border-white/10 bg-white/90 dark:bg-white/5 p-3 transition hover:shadow-md relative overflow-hidden"
                      >
                        {/* Gradient hover overlay with scale animation */}
                        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 transform group-hover:scale-105 bg-gradient-to-r from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
                        <div className="relative">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.title[lang]}</div>
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{t.description[lang]}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {t.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] rounded-full px-2 py-0.5 border border-white/60 dark:border-white/10 text-zinc-600 dark:text-zinc-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
