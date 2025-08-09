"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getAllTopics } from "@/lib/topics"
import { useI18n } from "@/components/i18n"
import Link from "next/link"
import GradientLoader from "@/components/gradient-loader"

export default function GlobalSearch() {
  const { dict, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [isPending, startTransition] = useTransition()
  const topics = getAllTopics()

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
    if (!needle) return topics
    return topics.filter((t) => {
      const title = t.title[lang].toLowerCase()
      const desc = t.description[lang].toLowerCase()
      return title.includes(needle) || desc.includes(needle) || t.tags.some((tag) => tag.toLowerCase().includes(needle))
    })
  }, [debouncedQ, lang, topics])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-full border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-white hover:shadow-sm transition"
        aria-label={dict.ui.openSearch}
        title={`${dict.ui.openSearch} (⌘/Ctrl+K)`}
      >
        <Search className="h-4 w-4 text-zinc-400" />
        <span className="opacity-80">{dict.ui.searchPlaceholder}</span>
        <kbd className="ml-2 rounded bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-base">{dict.ui.openSearch}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={dict.ui.searchPlaceholder}
                className="pl-9 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
              {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <GradientLoader size={18} />
                </div>
              )}
            </div>

            <ul className="mt-4 max-h-[50vh] overflow-y-auto space-y-2">
              {results.length === 0 ? (
                <li className="text-sm text-zinc-600 dark:text-zinc-400 px-2 py-6 text-center">{dict.ui.noResults}</li>
              ) : (
                results.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/topics/${t.slug}`}
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
                ))
              )}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
