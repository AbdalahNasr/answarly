"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Topic } from "@/lib/topics"

export default function TopicCard({ topic, lang }: { topic: Topic; lang: "en" | "ar" }) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl"
    >
      <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
        {/* Gradient overlay that scales on hover */}
        <span className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition duration-500 transform group-hover:scale-105 bg-gradient-to-br from-fuchsia-500/15 via-indigo-500/15 to-pink-500/15" />
        <CardHeader className="relative">
          <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">{topic.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="relative text-zinc-600 dark:text-zinc-300">{topic.description[lang]}</CardContent>
      </Card>
    </Link>
  )
}
