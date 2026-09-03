import { Suspense } from "react"
import DrawioStudioCanvas from "./drawio-studio-canvas"

export default function DrawioStudioPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0c1020] text-[#e7e6fc]">Loading studio...</div>}>
      <DrawioStudioCanvas />
    </Suspense>
  )
}
