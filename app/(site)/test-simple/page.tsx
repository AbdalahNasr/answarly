"use client"

import SimpleGalaxy from "@/components/ui/simple-galaxy"

export default function TestSimplePage() {
  return (
    <div className="min-h-screen w-full relative">
      <SimpleGalaxy />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Simple Galaxy Test</h1>
          <p className="text-white/80">Testing basic WebGL functionality</p>
        </div>
      </div>
    </div>
  )
}
