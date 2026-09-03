"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost, Home } from "lucide-react"
import { useI18n } from "@/components/i18n"

export default function NotFound() {
  const { lang } = useI18n()
  
  return (
    <div className="min-h-screen bg-[#0A0B1A] text-[#e7e6fc] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 size-[400px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        <div className="bg-[#111223]/80 backdrop-blur-xl border-none rounded-2xl p-12 shadow-[0_0_50px_rgba(17,18,35,0.5)]">
          <div className="space-y-8">
            <div className="inline-flex items-center justify-center size-24 rounded-3xl bg-[#0A0B1A] text-fuchsia-500 mb-2 animate-float">
              <Ghost className="size-12" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 via-indigo-500 to-pink-500">
                404
              </h1>
              <h2 className="text-3xl font-bold">
                {lang === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
              </h2>
            </div>

            <p className="text-[#aaa9be] text-lg font-light leading-relaxed">
              {lang === "ar" 
                ? "المسار التعليمي الذي تبحث عنه اختفى في الفراغ الرقمي. ربما تمت إعادة تسميته أو نقله أو لم يكن موجودًا أبدًا في هذا البعد."
                : "The educational path you are seeking has vanished into the digital void. Perhaps it was renamed, moved, or never existed in this dimension."}
            </p>

            <div className="pt-4">
              <Button variant="brand" asChild className="h-14 px-10 rounded-2xl w-full text-lg shadow-[0_0_30px_rgba(192,38,211,0.3)] group">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="size-5 mr-3 group-hover:scale-110 transition-transform" />
                  {lang === "ar" ? "العودة للرئيسية" : "Return to Home"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111223] border-none text-xs font-mono text-indigo-400">
            <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
            ERROR_CODE: NULL_DOMAIN_REFERENCE
          </div>
        </div>
      </div>
    </div>
  )
}
