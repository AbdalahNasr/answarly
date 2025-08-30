"use client"

import { useEffect, useRef } from 'react'

export function TestParticle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    console.log('TestParticle: useEffect started')
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('TestParticle: No canvas found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('TestParticle: No context found')
      return
    }
    
    console.log('TestParticle: Canvas and context ready')

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Simple test animation
    const animate = () => {
      console.log('TestParticle: Animation frame', canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw a simple gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      )
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)')
      gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.2)')
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw some simple particles
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 3 + 1
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}
