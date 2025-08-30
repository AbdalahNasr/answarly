"use client"

import { useEffect, useRef } from "react"

export default function WorkingGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    const stars: Array<{x: number, y: number, size: number, speed: number, opacity: number}> = []
    const numStars = 200

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.8 + 0.2
      })
    }

    let time = 0
    let animationId: number

    const animate = () => {
      time += 0.01
      
      // Clear canvas with gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      )
      gradient.addColorStop(0, 'rgba(25, 25, 112, 1)') // Dark blue center
      gradient.addColorStop(0.5, 'rgba(72, 61, 139, 0.8)') // Dark slate blue
      gradient.addColorStop(1, 'rgba(25, 25, 112, 0.6)') // Dark blue edge
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star, index) => {
        // Twinkle effect
        const twinkle = Math.sin(time * 2 + index) * 0.3 + 0.7
        const opacity = star.opacity * twinkle
        
        ctx.save()
        ctx.globalAlpha = opacity
        
        // Star glow
        const glowGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        )
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
        glowGradient.addColorStop(0.5, `rgba(173, 216, 230, ${opacity * 0.5})`)
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Star core
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()

        // Move stars slowly
        star.y += star.speed * 0.5
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      // Add some shooting stars occasionally
      if (Math.random() < 0.02) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: 0,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 5 + 3,
          opacity: 1
        }
        
        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = shootingStar.size
        ctx.beginPath()
        ctx.moveTo(shootingStar.x, shootingStar.y)
        ctx.lineTo(shootingStar.x + 50, shootingStar.y + 50)
        ctx.stroke()
        ctx.restore()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

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
