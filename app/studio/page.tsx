import { Suspense } from "react"
import StudioEditorClient from "./StudioEditorClient"

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0a0b1a] text-[#e7e6fc]">Loading studio...</div>}>
      <StudioEditorClient initialReturnTo="/qa" initialMode="flowchart" />
    </Suspense>
  )
}
