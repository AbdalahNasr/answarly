"use client"

import { useEffect, useRef, useState } from "react"

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
  glow: number
  originalX: number
  originalY: number
}

interface LightStreak {
  x: number
  y: number
  angle: number
  length: number
  opacity: number
  speed: number
}

export default function AdvancedGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMouseActive, setIsMouseActive] = useState(false)

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

    // Create stars with more variety
    const stars: Star[] = []
    const numStars = 300

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      stars.push({
        x,
        y,
        originalX: x,
        originalY: y,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
        twinklePhase: Math.random() * Math.PI * 2,
        glow: Math.random() * 0.5 + 0.5
      })
    }

    // Create light streaks (like the original)
    const lightStreaks: LightStreak[] = []
    const numStreaks = 8

    for (let i = 0; i < numStreaks; i++) {
      lightStreaks.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
        angle: (i / numStreaks) * Math.PI * 2 + Math.random() * 0.5,
        length: Math.random() * 100 + 50,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2
      })
    }

    let time = 0
    let animationId: number

    const animate = () => {
      time += 0.016 // 60fps
      
      // Clear canvas with radial gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      )
      gradient.addColorStop(0, 'rgba(25, 25, 112, 1)') // Dark blue center
      gradient.addColorStop(0.3, 'rgba(72, 61, 139, 0.9)') // Dark slate blue
      gradient.addColorStop(0.7, 'rgba(25, 25, 112, 0.8)') // Dark blue
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)') // Black edge
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw light streaks (the signature effect from React Bits)
      lightStreaks.forEach((streak, index) => {
        const streakTime = time * streak.speed + index
        const opacity = streak.opacity * (0.5 + 0.5 * Math.sin(streakTime))
        
        ctx.save()
        ctx.globalAlpha = opacity
        
        // Create gradient for the streak
        const streakGradient = ctx.createLinearGradient(
          streak.x, streak.y,
          streak.x + Math.cos(streak.angle) * streak.length,
          streak.y + Math.sin(streak.angle) * streak.length
        )
        streakGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        streakGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
        streakGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)')
        streakGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.strokeStyle = streakGradient
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(streak.x, streak.y)
        ctx.lineTo(
          streak.x + Math.cos(streak.angle) * streak.length,
          streak.y + Math.sin(streak.angle) * streak.length
        )
        ctx.stroke()
        
        ctx.restore()
      })

      // Draw stars with mouse interaction
      stars.forEach((star, index) => {
        // Calculate distance from mouse
        const dx = star.x - mousePos.x
        const dy = star.y - mousePos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Mouse repulsion effect - make it much stronger and more visible
        let repulsionX = 0
        let repulsionY = 0
        
        if (isMouseActive && distance < 150) { // Increased radius
          const repulsionStrength = (150 - distance) / 150
          const repulsionForce = repulsionStrength * 8 // Much stronger effect
          repulsionX = (dx / distance) * repulsionForce
          repulsionY = (dy / distance) * repulsionForce
        }
        
        // Apply repulsion to current position
        star.x = star.originalX + repulsionX
        star.y = star.originalY + repulsionY
        
        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7
        const opacity = star.opacity * twinkle
        
        ctx.save()
        ctx.globalAlpha = opacity
        
        // Star glow (outer glow)
        const glowGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 4 * star.glow
        )
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`)
        glowGradient.addColorStop(0.5, `rgba(173, 216, 230, ${opacity * 0.2})`)
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 4 * star.glow, 0, Math.PI * 2)
        ctx.fill()
        
        // Star core (bright center)
        const coreGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        )
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
        coreGradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.5})`)
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Star center (brightest point)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()

        // Move original positions slowly for parallax effect
        star.originalY += star.speed * 0.3
        if (star.originalY > canvas.height) {
          star.originalY = -10
          star.originalX = Math.random() * canvas.width
          star.x = star.originalX
          star.y = star.originalY
        }
      })

      // Add shooting stars occasionally
      if (Math.random() < 0.01) {
        const shootingStar = {
          x: Math.random() * canvas.width,
          y: -10,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 3 + 2,
          opacity: 1
        }
        
        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = shootingStar.size
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(shootingStar.x, shootingStar.y)
        ctx.lineTo(shootingStar.x + 80, shootingStar.y + 80)
        ctx.stroke()
        
        // Shooting star glow
        const shootingGlow = ctx.createRadialGradient(
          shootingStar.x, shootingStar.y, 0,
          shootingStar.x, shootingStar.y, 20
        )
        shootingGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        shootingGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = shootingGlow
        ctx.beginPath()
        ctx.arc(shootingStar.x, shootingStar.y, 20, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Mouse event handlers - attach to window instead of canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsMouseActive(true)
    }

    const handleMouseLeave = () => {
      setIsMouseActive(false)
    }

    // Attach events to window to ensure they work
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
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
        zIndex: 0,
        pointerEvents: 'none' // Allow mouse events to pass through to content
      }}
    />
  )
}
