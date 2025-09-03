"use client"

import { usePathname } from "next/navigation"

export default function ConditionalFooter() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isQuizResultsPage = pathname === '/quiz/results'
  
  if (isAuthPage || isQuizResultsPage) {
    return null
  }
  
  return (
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
  )
}
