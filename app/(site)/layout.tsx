import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/i18n"
import Navbar from "@/components/navbar"
import SmoothScroll from "@/components/smooth-scroll"
import ConditionalFooter from "@/components/conditional-footer"
import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "Answerly",
  description: "A modern Q&A platform for curious minds",
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="answerly-theme">
      <LanguageProvider>
        <AuthProvider>
          <SmoothScroll />
          <div className="min-h-svh flex flex-col transition-colors duration-500 bg-gradient-to-b from-white via-[#f7f7fb] to-[#f0f3ff] dark:from-[#0a0b1a] dark:via-[#101231] dark:to-[#171a3f]">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <ConditionalFooter />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
