"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Brain,
  Globe,
  Trophy,
  ClipboardList,
  UserCheck,
  Palette,
  Search,
  Smartphone,
  FolderTree,
  History,
  Code2,
  Database,
  Layers,
  BarChart3,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Layout,
  MousePointerClick,
  Gem,
} from "lucide-react"

/* ───────────────────────── helpers ────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ───────────────────── animated particles ────────────────── */

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => {
        const size = 2 + Math.random() * 4
        const left = Math.random() * 100
        const animDuration = 6 + Math.random() * 10
        const animDelay = Math.random() * 8
        const opacity = 0.15 + Math.random() * 0.35
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: "-5%",
              opacity,
              animation: `floatUp ${animDuration}s ${animDelay}s linear infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

/* ───────────────────────── data ──────────────────────────── */

const features = [
  {
    icon: Brain,
    title: "Multi-Type Questions",
    desc: "MCQ, True/False, Code Snippets, and Open-ended—all beautifully rendered with instant feedback.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Bilingual — EN + AR",
    desc: "Full English & Arabic support with automatic RTL layout. Switch any time from the navbar.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Rankings",
    desc: "Global and category-specific leaderboards powered by data tables with sorting, filtering, and pagination.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: ClipboardList,
    title: "Quiz System",
    desc: "Full quiz flow — pick a category & difficulty, take the quiz, and view detailed results with scoring.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: UserCheck,
    title: "Auth & Profiles",
    desc: "JWT-based authentication, avatar uploads, user profiles, and personalized question management.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Palette,
    title: "Dark / Light Theme",
    desc: "One-click theme toggle with smooth transitions. Gorgeous gradient backgrounds in both modes.",
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    icon: Search,
    title: "Global Search",
    desc: "Search across topics, categories, and questions with a keyboard-friendly command palette.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    desc: "Looks stunning on every screen — mobile-first grid layouts, adaptive navigation, and touch-friendly controls.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: FolderTree,
    title: "Categories & Topics",
    desc: "Hierarchical category system with unlimited depth, trending topics, and tag-based filtering.",
    gradient: "from-lime-500 to-green-600",
  },
  {
    icon: History,
    title: "History & Progress",
    desc: "Full quiz history with data tables, progress tracking with auto-save, and detailed session analytics.",
    gradient: "from-orange-500 to-red-600",
  },
]

const techStack = [
  { name: "Next.js 15", icon: Layers, color: "text-white" },
  { name: "React 18", icon: Code2, color: "text-cyan-400" },
  { name: "TypeScript", icon: Code2, color: "text-blue-400" },
  { name: "Tailwind v4", icon: Palette, color: "text-sky-400" },
  { name: "PostgreSQL", icon: Database, color: "text-blue-300" },
  { name: "Sequelize", icon: Database, color: "text-indigo-400" },
  { name: "shadcn/ui", icon: Layout, color: "text-purple-400" },
  { name: "Radix UI", icon: Layers, color: "text-pink-400" },
  { name: "GSAP", icon: Zap, color: "text-green-400" },
  { name: "Recharts", icon: BarChart3, color: "text-amber-400" },
  { name: "Zod", icon: Shield, color: "text-rose-400" },
  { name: "JWT Auth", icon: Shield, color: "text-emerald-400" },
]

const designPrinciples = [
  {
    icon: Gem,
    title: "Glassmorphism",
    desc: "Translucent cards with backdrop-blur and frosted borders create depth and elegance.",
  },
  {
    icon: Sparkles,
    title: "Smooth Animations",
    desc: "Scroll-triggered reveals, float effects, shimmering gradients, and micro-interactions delight users.",
  },
  {
    icon: MousePointerClick,
    title: "Interactive Feedback",
    desc: "Hover lifts, ring highlights, toast notifications, and instant grading keep users engaged.",
  },
  {
    icon: Star,
    title: "Premium Aesthetics",
    desc: "Vibrant gradient palette, modern Inter typography, and carefully crafted spacing throughout.",
  },
]

/* ───────────────────────── page ──────────────────────────── */

export default function ShowcasePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* ──────── inline keyframes ──────── */}
      <style jsx global>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(139,92,246,.3); }
          50%      { border-color: rgba(139,92,246,.7); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #f472b6, #a78bfa);
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-glow:hover {
          box-shadow: 0 0 40px rgba(139,92,246,.15), 0 0 80px rgba(139,92,246,.08);
        }
      `}</style>

      <div className="min-h-screen bg-[#060818] text-white overflow-x-hidden">
        {/* ════════════════ HERO ════════════════ */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden">
          {/* gradient bg */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,.25) 0%, rgba(139,92,246,.12) 40%, transparent 70%)",
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          />
          {/* grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <Particles />

          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <Reveal>
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span>Project Showcase</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-8xl">
                <span className="gradient-text">Answerly</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl md:text-2xl leading-relaxed">
                A modern, bilingual <strong className="text-white">Q&A platform</strong> for curious minds — featuring quizzes, leaderboards, code challenges, and a stunning glassmorphic UI.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  Explore the App
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://github.com/AbdalahNasr/answerly"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  View on GitHub
                </Link>
              </div>
            </Reveal>
          </div>

          {/* scroll indicator */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </section>

        {/* ════════════════ FEATURES ════════════════ */}
        <section className="relative py-28">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="text-center">
                <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm text-purple-300">
                  Features
                </span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Everything you need to <span className="gradient-text">learn & grow</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                  From code challenges to multilingual support, Answerly was built to make learning interactive, competitive, and beautiful.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="card-glow group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.06]">
                    {/* glow circle */}
                    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.15]`} />

                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                      <f.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ TECH STACK ════════════════ */}
        <section className="relative py-28">
          {/* subtle divider glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="text-center">
                <span className="mb-4 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
                  Tech Stack
                </span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Powered by <span className="gradient-text">modern tools</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                  Built on battle-tested, production-ready technologies for performance, developer experience, and scalability.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {techStack.map((t, i) => (
                <Reveal key={t.name} delay={i * 50}>
                  <div className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.05]">
                    <t.icon className={`h-7 w-7 ${t.color} transition-transform group-hover:scale-110`} />
                    <span className="text-sm font-medium text-zinc-300">{t.name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ DESIGN PHILOSOPHY ════════════════ */}
        <section className="relative py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />

          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="text-center">
                <span className="mb-4 inline-block rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1 text-sm text-fuchsia-300">
                  Design Philosophy
                </span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Crafted for <span className="gradient-text">delight</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                  Every pixel is intentional. From glassmorphism to micro-animations, the interface feels alive and premium.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {designPrinciples.map((d, i) => (
                <Reveal key={d.title} delay={i * 80}>
                  <div
                    className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15]"
                    style={{ animation: `borderGlow ${3 + i}s ease-in-out infinite` }}
                  >
                    <d.icon className="mb-4 h-8 w-8 text-purple-400" />
                    <h3 className="mb-2 font-semibold text-white">{d.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{d.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════  STATS  ════════════════ */}
        <section className="relative py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "UI Components", value: "67+" },
                  { label: "Question Types", value: "4" },
                  { label: "Languages", value: "2" },
                  { label: "API Routes", value: "15+" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-8"
                  >
                    <span className="text-4xl font-extrabold gradient-text">{s.value}</span>
                    <span className="mt-2 text-sm text-zinc-400">{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════ CTA / FOOTER ════════════════ */}
        <section className="relative py-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          <div className="relative mx-auto max-w-3xl px-6 text-center">
            {/* ambient glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="h-[400px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to <span className="gradient-text">dive in</span>?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-zinc-400">
                Explore the platform, take a quiz, climb the leaderboard, and experience the design first-hand.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/quiz/setup"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  Start a Quiz
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/topics"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  Browse Topics
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* footer line */}
        <footer className="border-t border-white/[0.06] py-8 text-center">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Answerly · Built with 💜 by{" "}
            <Link href="https://github.com/AbdalahNasr" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">
              Abdalah Nasr
            </Link>
          </p>
        </footer>
      </div>
    </>
  )
}
