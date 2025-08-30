"use client"

import AdvancedGalaxy from "@/components/ui/advanced-galaxy"

export default function TestAdvancedPage() {
  return (
    <div className="min-h-screen w-full relative">
      <AdvancedGalaxy />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Advanced Galaxy Test</h1>
          <p className="text-white/80">Move your mouse around to see the repulsion effect!</p>
          <p className="text-white/60 text-sm mt-2">Features: Light streaks, mouse interaction, star repulsion, twinkling</p>
        </div>
      </div>
    </div>
  )
}
