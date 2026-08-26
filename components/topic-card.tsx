"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Topic } from "@/lib/topics"

export default function TopicCard({ topic, lang }: { topic: Topic; lang: "en" | "ar" }) {
  // Create quiz setup URL with category information
  const quizSetupUrl = topic.categoryId 
    ? `/quiz/setup?category=${topic.categoryId}`
    : `/quiz/setup?category=${topic.title[lang]}`

  return (
    <Link
      href={quizSetupUrl}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl"
    >
      <Card className="relative overflow-hidden rounded-2xl bg-card border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(192,38,211,0.15)]">
        {/* Gradient overlay that scales on hover */}
        <span className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition duration-500 transform group-hover:scale-105 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10" />
        <CardHeader className="relative">
          <CardTitle className="text-lg text-foreground">{topic.title[lang]}</CardTitle>
        </CardHeader>
        <CardContent className="relative text-muted-foreground">{topic.description[lang]}</CardContent>
      </Card>
    </Link>
  )
}
