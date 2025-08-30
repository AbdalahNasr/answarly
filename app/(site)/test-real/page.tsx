"use client"

import ReactBitsGalaxy from "@/components/ui/react-bits-galaxy"

export default function TestRealPage() {
  return (
    <div className="min-h-screen w-full relative">
      <ReactBitsGalaxy 
        mouseRepulsion={true}
        mouseInteraction={true}
        density={1.2}
        glowIntensity={0.4}
        saturation={0.6}
        hueShift={240}
        twinkleIntensity={0.5}
        rotationSpeed={0.05}
        repulsionStrength={8}
        transparent={true}
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Real React Bits Galaxy</h1>
          <p className="text-white/80">This is the actual React Bits Galaxy component!</p>
          <p className="text-white/60 text-sm mt-2">Move your mouse to see the real repulsion effect</p>
        </div>
      </div>
    </div>
  )
}
