"use client"

import { useEffect, useState } from "react"
import { MoonStar, SunMedium } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "answerly-theme"

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Initialize from localStorage and apply immediately
  useEffect(() => {
    const root = document.documentElement
    const stored = localStorage.getItem(STORAGE_KEY)
    const dark = stored ? stored === "dark" : false
    setIsDark(dark)
    root.classList.toggle("dark", dark)
    setMounted(true)
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    root.classList.toggle("dark", next)
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 transition-colors"
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {!mounted ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <>
          <SunMedium
            className={`h-4 w-4 transition-all ${isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
          />
          <MoonStar
            className={`absolute h-4 w-4 transition-all ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"}`}
          />
        </>
      )}
    </Button>
  )
}
