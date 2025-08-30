"use client"

import Galaxy from "@/components/ui/galaxy"

export default function TestGalaxyPage() {
  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100vh' }}>
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.2}
          glowIntensity={0.4}
          saturation={0.6}
          hueShift={240}
          twinkleIntensity={0.5}
          rotationSpeed={0.05}
          transparent={true}
        />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white">Galaxy Test Page</h1>
          <p className="text-white/80">If you can see this text, the Galaxy background is working!</p>
        </div>
      </div>
    </div>
  )
}
