"use client"

import WorkingGalaxy from "@/components/ui/working-galaxy"

export default function TestWorkingPage() {
  return (
    <div className="min-h-screen w-full relative">
      <WorkingGalaxy />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Working Galaxy Test</h1>
          <p className="text-white/80">This should definitely work - using 2D canvas</p>
        </div>
      </div>
    </div>
  )
}
