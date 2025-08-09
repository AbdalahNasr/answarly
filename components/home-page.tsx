"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useI18n } from "@/components/i18n"
import { getAllTopics } from "@/lib/topics"
import TopicCard from "@/components/topic-card"

export default function HomeClient() {
  const { dict, lang } = useI18n()
  const [query, setQuery] = useState("")

  const topics = getAllTopics()
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return topics
    return topics.filter((t) => {
      const title = t.title[lang].toLowerCase()
      const desc = t.description[lang].toLowerCase()
      return title.includes(q) || desc.includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q))
    })
  }, [topics, query, lang])

  return (
    <main>
      {/* Hero with modern gradients that adapt to theme */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/qa-hero.png"
            alt="Abstract gradient background for Q&A platform"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent dark:from-[#0a0b1a]/70 dark:via-transparent dark:to-transparent transition-colors duration-500" />
        </div>
        <div className="relative z-10 container mx-auto px-4 md:px-6 min-h-[78svh] flex items-center">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs text-zinc-700 dark:text-zinc-200 backdrop-blur transition-colors">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-pink-500" />
                {dict.hero.badge}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {dict.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-zinc-700 dark:text-zinc-300">
                {dict.hero.desc}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/#topics" className="w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto rounded-full text-white transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-500 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                    size="lg"
                  >
                    {dict.hero.ctaPrimary}
                  </Button>
                </Link>
                <Link href="/#topics" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-white transition-all hover:-translate-y-0.5"
                    size="lg"
                  >
                    {dict.hero.ctaSecondary}
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Topics + local search */}
      <section id="topics" className="w-full border-t border-white/50 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {dict.topics.title}
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{dict.topics.desc}</p>
            </div>
          </Reveal>

          <div className="mt-6 max-w-2xl">
            <label htmlFor="topic-search" className="sr-only">
              {dict.ui.searchAria}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                id="topic-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.ui.searchPlaceholder}
                className="pl-9 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 transition-colors"
              />
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
