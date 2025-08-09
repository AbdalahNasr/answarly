"use client"

import Link from "next/link"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"
import type { Topic } from "@/lib/topics"
import { useI18n } from "@/components/i18n"

export default function TopicDetail({ topic }: { topic: Topic }) {
  const { lang, dict } = useI18n()
  return (
    <main>
      {/* Top banner gradient */}
      <section className="w-full bg-gradient-to-b from-white/50 via-transparent to-transparent dark:from-[#0a0b1a]/60 dark:via-transparent dark:to-transparent transition-colors">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Topic</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {topic.title[lang]}
            </h1>
            <p className="mt-3 max-w-3xl text-zinc-700 dark:text-zinc-300">{topic.description[lang]}</p>
            <div className="mt-6">
              <Link href="/#topics">
                <Button
                  variant="outline"
                  className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
                >
                  {dict.ui.back}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 pb-20">
          <Reveal delay={80}>
            <article className="prose dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
              <div className="rounded-2xl bg-white/90 dark:bg-white/5 border border-white/60 dark:border-white/10 p-6 md:p-8 leading-relaxed text-zinc-800 dark:text-zinc-200 transition-colors">
                {topic.content[lang]}
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
