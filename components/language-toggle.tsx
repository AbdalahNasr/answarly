"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "./i18n"

export default function LanguageToggle() {
  const { lang, setLang } = useI18n()
  return (
    <Button
      variant="outline"
      className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 transition-colors px-4 py-2 text-sm"
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "font-semibold" : "opacity-70"}>EN</span>
      <span className="mx-2 opacity-50">/</span>
      <span className={lang === "ar" ? "font-semibold" : "opacity-70"}>AR</span>
    </Button>
  )
}
