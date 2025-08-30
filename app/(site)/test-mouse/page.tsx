"use client"

import { useState, useEffect } from "react"
import AdvancedGalaxy from "@/components/ui/advanced-galaxy"

export default function TestMousePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen w-full relative">
      <AdvancedGalaxy />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Mouse Test</h1>
          <p className="text-white/80">Move your mouse around to see the repulsion effect!</p>
          <p className="text-white/60 text-sm mt-2">Mouse position: {mousePos.x}, {mousePos.y}</p>
          <p className="text-white/60 text-sm">Features: Light streaks, mouse interaction, star repulsion, twinkling</p>
        </div>
      </div>
    </div>
  )
}
