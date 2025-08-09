import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/i18n"
import Navbar from "@/components/navbar"
import SmoothScroll from "@/components/smooth-scroll"

export const metadata: Metadata = {
  title: "Answerly",
  description: "A modern Q&A platform for curious minds",
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="answerly-theme">
      <LanguageProvider>
        <SmoothScroll />
        <div className="min-h-svh transition-colors duration-500 bg-gradient-to-b from-white via-[#f7f7fb] to-[#f0f3ff] dark:from-[#0a0b1a] dark:via-[#101231] dark:to-[#171a3f]">
          <Navbar />
          {children}
          <footer className="w-full border-t border-white/40 dark:border-white/10">
            <div className="container mx-auto px-4 md:px-6 py-8 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Answerly</span>
                </div>
                <p>
                  {"© "}
                  {new Date().getFullYear()}
                  {" Answerly. All rights reserved."}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}
