"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Sparkles } from "lucide-react"
import VisualDiagramEditor, { createDefaultVisualDiagram } from "@/components/visual-diagram-editor"
import type { VisualDiagramData, VisualDiagramMode } from "@/lib/questions"

export default function StudioEditorClient({
  initialReturnTo = "/qa",
  initialMode = "flowchart",
}: {
  initialReturnTo?: string
  initialMode?: VisualDiagramMode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || initialReturnTo
  const modeFromQuery = (searchParams.get("mode") as VisualDiagramMode) || initialMode
  const [diagram, setDiagram] = useState<VisualDiagramData>(createDefaultVisualDiagram(modeFromQuery))

  const modeLabel = useMemo(() => {
    switch (diagram.mode) {
      case "mind_map":
        return "Mind map"
      case "table":
        return "Table"
      default:
        return "Flowchart"
    }
  }, [diagram.mode])

  const saveAndReturn = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("answerly-visual-diagram", JSON.stringify(diagram))
    }
    router.push(returnTo)
  }

  return (
    <main className="min-h-screen bg-[#0a0b1a] text-[#e7e6fc]">
      <div className="border-b border-white/10 bg-[#111223]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push(returnTo)}
              className="rounded-xl border border-white/10 bg-white/5 text-[#e7e6fc] hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300/80">Visual Studio</p>
              <h1 className="text-2xl font-black tracking-tight">Design your diagram</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200 md:flex">
              <Sparkles className="h-3.5 w-3.5" />
              {modeLabel}
            </div>
            <Button
              type="button"
              onClick={saveAndReturn}
              className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-900/20"
            >
              <Check className="mr-2 h-4 w-4" />
              Use this diagram
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="overflow-hidden rounded-[28px] border border-violet-500/20 bg-[#0d1220] shadow-[0_20px_80px_rgba(92,60,160,0.35)]">
          <VisualDiagramEditor value={diagram} onChange={setDiagram} />
        </div>
      </div>
    </main>
  )
}
