"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState, useEffect, useRef } from "react"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useI18n } from "@/components/i18n"
import { getAllTopics } from "@/lib/topics"
import TopicCard from "@/components/topic-card"
import RippleGrid from "@/src/backgrounds /RippleGrid/RippleGrid"

// Custom CardSwap component that matches React Bits exactly
const CustomCardSwap = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const cards = [
    {
      title: "Customizable",
      description: "Tailored to your needs",
      icon: "3",
      color: "from-purple-500 to-indigo-500",
      bgColor: "from-slate-800/90 via-purple-900/80 to-slate-900/90"
    },
    {
      title: "Smooth",
      description: "Seamless interactions",
      icon: "○",
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-slate-800/90 via-indigo-900/80 to-slate-900/90"
    },
    {
      title: "Reliable",
      description: "Built to last",
      icon: "</>",
      color: "from-pink-500 to-purple-500",
      bgColor: "from-slate-800/90 via-pink-900/80 to-slate-900/90"
    }
  ]

  return (
    <div className="relative w-[400px] h-[300px] perspective-[1000px]">
      {cards.map((card, index) => {
        const isActive = index === currentIndex
        const isNext = index === (currentIndex + 1) % 3
        const isPrev = index === (currentIndex + 2) % 3

        let transform = ""
        let zIndex = 0
        let opacity = 0

        if (isActive) {
          transform = "translateZ(0px) translateX(0px) translateY(0px)"
          zIndex = 30
          opacity = 1
        } else if (isNext) {
          transform = "translateZ(-60px) translateX(60px) translateY(-70px)"
          zIndex = 20
          opacity = 0.8
        } else if (isPrev) {
          transform = "translateZ(-120px) translateX(120px) translateY(-140px)"
          zIndex = 10
          opacity = 0.6
        }

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-out rounded-2xl overflow-hidden`}
            style={{
              transform,
              zIndex,
              opacity,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className={`w-full h-full p-6 bg-gradient-to-br ${card.bgColor} backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl relative overflow-hidden`}>
              {/* Glowing background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 rounded-2xl"></div>
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              
              <div className="h-full flex flex-col justify-center items-center text-center relative z-10">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg border border-white/20`}>
                  <span className="text-4xl font-bold text-white">{card.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-purple-200">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
      {/* Hero with Card Swap + Ripple Grid Background */}
      <section className="relative w-full overflow-hidden min-h-[78svh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Ripple Grid Background - Using correct props */}
        <div className="absolute inset-0 z-0">
          <RippleGrid
            enableRainbow={false}
            gridColor="#8b5cf6"
            rippleIntensity={0.05}
            gridSize={10}
            gridThickness={15}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={0.8}
          />
        </div>
        
        {/* Content with Card Swap */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 min-h-[78svh] flex items-center">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              {/* Left side - Text content */}
              <div className="flex-1 max-w-2xl z-20">
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 backdrop-blur-sm px-3 py-1 text-xs text-purple-100">
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-indigo-400 animate-pulse" />
                    {dict.hero.badge}
                  </div>
                </Reveal>
                <Reveal delay={80}>
                  <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                    {dict.hero.title}
                  </h1>
                </Reveal>
                <Reveal delay={140}>
                  <p className="mt-6 max-w-2xl text-lg sm:text-xl md:text-2xl text-purple-100 leading-relaxed">
                    {dict.hero.desc}
                  </p>
                </Reveal>
                <Reveal delay={200}>
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Link href="/#topics" className="w-full sm:w-auto">
                      <Button
                        className="w-full sm:w-auto rounded-full text-white transition-all hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-purple-400 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg hover:shadow-xl"
                        size="lg"
                      >
                        {dict.hero.ctaPrimary}
                      </Button>
                    </Link>
                    <Link href="/#topics" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-full border-purple-400/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-100 hover:text-white transition-all hover:-translate-y-1 backdrop-blur-sm"
                        size="lg"
                      >
                        {dict.hero.ctaSecondary}
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
              
              {/* Right side - Custom Card Swap - React Bits Style */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <CustomCardSwap />
              </div>
            </div>
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
