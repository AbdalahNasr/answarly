"use client"

import { useMemo, useState } from "react"
import { getAllTopics } from "@/lib/topics"
import { useI18n } from "@/components/i18n"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TopicCard from "@/components/topic-card"
import Reveal from "@/components/reveal"

export default function TopicsIndexPage() {
  const topics = getAllTopics()
  const { dict, lang } = useI18n()
  const [q, setQ] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])

  const allTags = useMemo(() => {
    const s = new Set<string>()
    topics.forEach((t) => t.tags.forEach((tag) => s.add(tag)))
    return Array.from(s).sort()
  }, [topics])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return topics.filter((t) => {
      const inText =
        !needle ||
        t.title[lang].toLowerCase().includes(needle) ||
        t.description[lang].toLowerCase().includes(needle) ||
        t.tags.some((tg) => tg.toLowerCase().includes(needle))
      const inTags = activeTags.length === 0 || activeTags.every((tg) => t.tags.includes(tg))
      return inText && inTags
    })
  }, [topics, q, activeTags, lang])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {dict.topicsPage.title}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{dict.topicsPage.desc}</p>
            </div>
          </Reveal>

          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={dict.ui.searchPlaceholder}
                className="pl-4 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-colors"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const active = activeTags.includes(tag)
                return (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border-white/60 dark:border-white/10 ${
                      active
                        ? "text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600"
                        : "bg-white/80 dark:bg-white/5"
                    }`}
                  >
                    {tag}
                  </Button>
                )
              })}
              {activeTags.length > 0 && (
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setActiveTags([])}>
                  {dict.topicsPage.clearFilters}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">{dict.ui.noResults}</p>
            ) : (
              filtered.map((t, i) => (
                <Reveal key={t.slug} delay={i * 60}>
                  <TopicCard topic={t} lang={lang} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
