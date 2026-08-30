import { Suspense } from "react"
import VideoQuestionCanvas from "./video-question-canvas"

export default function VideoQuestionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-[#20263a]">Loading video question...</div>}>
      <VideoQuestionCanvas />
    </Suspense>
  )
}
