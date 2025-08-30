"use client"

import { useEffect, useRef, useState } from "react"

export default function SimpleGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) {
        setError('WebGL not supported')
        return
      }

      // Set canvas size
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        gl.viewport(0, 0, canvas.width, canvas.height)
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      // Simple animated background
      let animationId: number
      let time = 0

      const animate = () => {
        time += 0.01
        
        // Clear with a dark blue color
        gl.clearColor(0.05, 0.05, 0.2, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // Create a simple animated gradient effect
        const gradient = gl.createLinearGradient?.(0, 0, canvas.width, canvas.height) || null
        if (gradient) {
          gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 20}, 70%, 20%)`)
          gradient.addColorStop(1, `hsl(${280 + Math.sin(time * 0.5) * 30}, 80%, 30%)`)
        }

        // Draw some animated circles to simulate stars
        for (let i = 0; i < 50; i++) {
          const x = (Math.sin(time * 0.5 + i * 0.1) + 1) * 0.5
          const y = (Math.cos(time * 0.3 + i * 0.15) + 1) * 0.5
          const size = Math.sin(time + i) * 0.5 + 0.5
          
          // Simple star drawing (this is a placeholder - in real implementation you'd use proper WebGL)
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        }

        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        window.removeEventListener('resize', resizeCanvas)
        cancelAnimationFrame(animationId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Galaxy Background Error:</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    />
  )
}
