"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import LanguageToggle from "@/components/language-toggle"
import GlobalSearch from "@/components/global-search"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "./i18n"

export default function Navbar() {
  const { dict } = useI18n()
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/topics", label: dict.nav.topics },
    { href: "/history", label: dict.nav.history },
    { href: "/qa", label: dict.nav.qa },
    { href: "/quiz", label: dict.nav.quiz },
    { href: "/login", label: dict.nav.login },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/40 dark:border-white/10 bg-gradient-to-b from-white/70 to-white/40 dark:from-[#0a0b1a]/70 dark:to-[#0a0b1a]/40 backdrop-blur supports-[backdrop-filter]:bg-transparent transition-colors duration-500">
      <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl text-white">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-pink-600" />
            <span className="relative text-xs font-bold">Q&A</span>
          </div>
          <span className="font-semibold tracking-tight">Answerly</span>
          <span className="sr-only">Answerly Home</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <GlobalSearch />
          <LanguageToggle />
          <ThemeToggle />
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <GlobalSearch />
          <LanguageToggle />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl bg-white/80 dark:bg-white/5 border-white/60 dark:border-white/10"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {links.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
