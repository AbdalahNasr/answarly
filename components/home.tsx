"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  HelpCircle,
  HistoryIcon,
  MessageSquare,
  Rocket,
  Sparkles,
  Tag,
} from "lucide-react"
import Reveal from "@/components/reveal"
import { useI18n } from "./i18n"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  const { dict } = useI18n()

  return (
    <>
      {/* Hero */}
      <section id="home" className="relative min-h-[90svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/qa-hero.png"
            alt="Abstract background for Q&A platform"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#FAFAFA]/40 to-[#FAFAFA]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 flex min-h-[90svh] items-center">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-zinc-200 px-3 py-1 text-xs text-zinc-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                {dict.hero.badge}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-[#111] drop-shadow-sm">
                {dict.hero.title}
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-[#333]">{dict.hero.desc}</p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="#cta" className="w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto rounded-full bg-teal-600 hover:bg-teal-600/90 text-white transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500"
                    size="lg"
                  >
                    {dict.hero.ctaPrimary}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#cta" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-zinc-200 bg-white hover:bg-zinc-50 transition-all hover:-translate-y-0.5"
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

      {/* Topics Section */}
      <section id="topics" className="scroll-mt-24 w-full border-t bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">{dict.topics.title}</h2>
              <p className="mt-2 text-zinc-600">{dict.topics.desc}</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dict.topics.items.map((t, i) => (
              <Reveal key={i} delay={i * 70}>
                <Card className="rounded-2xl bg-white border-zinc-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
                      {i === 0 && <Tag className="h-5 w-5 text-teal-700" />}
                      {i === 1 && <Rocket className="h-5 w-5 text-teal-700" />}
                      {i === 2 && <BadgeCheck className="h-5 w-5 text-teal-700" />}
                      {i === 3 && <MessageSquare className="h-5 w-5 text-teal-700" />}
                      {i === 4 && <Clock className="h-5 w-5 text-teal-700" />}
                      {i === 5 && <HelpCircle className="h-5 w-5 text-teal-700" />}
                    </div>
                    <CardTitle className="text-lg text-[#111]">{t.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-zinc-600">{t.desc}</CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="scroll-mt-24 w-full border-t bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">{dict.how.title}</h2>
              <p className="mt-2 text-zinc-600">{dict.how.desc}</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {dict.how.steps.map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <Card className="rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <CardHeader>
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white">
                      {i + 1}
                    </div>
                    <CardTitle className="mt-2 text-xl text-[#111]">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-zinc-600">{s.desc}</CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Q&A (Accordion) */}
      <section id="qa" className="scroll-mt-24 w-full border-t bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">{dict.qa.title}</h2>
              <p className="mt-2 text-zinc-600">{dict.qa.desc}</p>
            </div>
          </Reveal>

          <div className="mt-8">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {dict.qa.items.map((item, i) => (
                <Reveal key={i} delay={i * 60}>
                  <AccordionItem
                    value={`qa-${i}`}
                    className="rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-sm transition-colors data-[state=open]:bg-[#E6F0FA]"
                  >
                    <AccordionTrigger className="text-left py-4 hover:no-underline px-4">
                      <span className="text-base sm:text-lg font-bold text-[#333]">{item.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 text-sm text-[#555]">{item.a}</AccordionContent>
                  </AccordionItem>
                </Reveal>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* History / Recent Activity */}
      <section id="history" className="scroll-mt-24 w-full border-t bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <HistoryIcon className="h-6 w-6 text-teal-700" />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">{dict.history.title}</h2>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {dict.history.items.map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <Card className="rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#111]">{item.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-600">{item.a}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-[#333] bg-zinc-50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ask / CTA */}
      <section id="cta" className="scroll-mt-24 w-full border-t bg-[#FAFAFA]">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111]">{dict.cta.title}</h2>
              <p className="mt-2 text-zinc-600">{dict.cta.desc}</p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Link href="#cta">
                  <Button className="rounded-full bg-teal-600 hover:bg-teal-600/90 text-white">{dict.cta.ask}</Button>
                </Link>
                <Link href="#topics">
                  <Button variant="outline" className="rounded-full bg-white hover:bg-zinc-50">
                    {dict.cta.explore}
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
