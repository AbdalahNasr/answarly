"use client"

import { useEffect, useState, useRef } from "react"
import { CheckCircle, XCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizAnimationProps {
  isSuccess: boolean
  score: number
  totalQuestions: number
  onAnimationComplete?: () => void
}

// Confetti component
const Confetti = ({ type }: { type: 'success' | 'good' | 'average' | 'fail' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles based on type
    const particleCount = type === 'success' ? 150 : type === 'good' ? 100 : type === 'average' ? 50 : 30
    const newParticles = []

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 4 + 2,
        color: type === 'success' 
          ? ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 5)]
          : type === 'good'
          ? ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 4)]
          : type === 'average'
          ? ['#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 3)]
          : ['#FF6B6B', '#FF8E8E', '#FFB3B3'][Math.floor(Math.random() * 3)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: type === 'success' ? 'star' : Math.random() > 0.5 ? 'circle' : 'square'
      })
    }

    setParticles(newParticles)
  }, [type])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || particles.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed

        // Draw particle
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.fillStyle = particle.color

        if (particle.shape === 'star') {
          // Draw star
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5
            const x = Math.cos(angle) * particle.size
            const y = Math.sin(angle) * particle.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.fill()
        } else if (particle.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, 2 * Math.PI)
          ctx.fill()
        } else {
          ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2)
        }

        ctx.restore()

        // Remove particles that are off screen
        if (particle.y > canvas.height + 10) {
          particles.splice(index, 1)
        }
      })

      if (particles.length > 0) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [particles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ zIndex: 40 }}
    />
  )
}

export function QuizAnimation({ 
  isSuccess, 
  score, 
  totalQuestions, 
  onAnimationComplete 
}: QuizAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [progressValue, setProgressValue] = useState(0)

  const percentage = Math.round((score / totalQuestions) * 100)
  const isExcellent = percentage >= 90
  const isGood = percentage >= 70
  const isPassing = percentage >= 60

  // Determine animation type
  const getAnimationType = () => {
    if (isSuccess) {
      if (isExcellent) return 'success'
      if (isGood) return 'good'
      if (isPassing) return 'average'
      return 'good'
    }
    return 'fail'
  }

  useEffect(() => {
    // Start animation sequence
    setShowAnimation(true)
    
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= percentage) {
          clearInterval(progressInterval)
          return percentage
        }
        return prev + 2
      })
    }, 50)
    
    setTimeout(() => {
      setShowScore(true)
    }, 1000)
    
    setTimeout(() => {
      setShowMessage(true)
    }, 2000)
    
    setTimeout(() => {
      onAnimationComplete?.()
    }, 4000)

    return () => clearInterval(progressInterval)
  }, [onAnimationComplete, percentage])

  const getMessage = () => {
    if (isSuccess) {
      if (isExcellent) return "Excellent! You're a master!"
      if (isGood) return "Great job! Well done!"
      if (isPassing) return "Good work! Keep it up!"
      return "You passed! Nice work!"
    } else {
      return "Don't worry! Practice makes perfect!"
    }
  }

  const getIcon = () => {
    if (isSuccess) {
      if (isExcellent) return <Trophy className="w-16 h-16 text-yellow-400" />
      return <CheckCircle className="w-16 h-16 text-green-400" />
    }
    return <XCircle className="w-16 h-16 text-red-400" />
  }

  return (
    <>
      {/* Confetti Animation */}
      <Confetti type={getAnimationType()} />
      
      {/* Main Animation Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={cn(
          "relative p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700",
          "transform transition-all duration-700 ease-out",
          showAnimation ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}>
          {/* Background glow */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-1000",
            isSuccess 
              ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
              : "bg-gradient-to-br from-red-500/20 to-pink-500/20"
          )} />
          
          <div className="relative z-10 text-center">
            {/* Custom Progress Circle */}
            <div className="mx-auto mb-6 w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-zinc-200 dark:text-zinc-700"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    isSuccess 
                      ? isExcellent ? "text-yellow-400" : isGood ? "text-green-400" : "text-blue-400"
                      : "text-red-400"
                  )}
                  style={{
                    strokeDasharray: `${2 * Math.PI * 60}`,
                    strokeDashoffset: `${2 * Math.PI * 60 * (1 - progressValue / 100)}`,
                  }}
                />
              </svg>
             
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  "transition-all duration-700 delay-300",
                  showScore ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {progressValue}%
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {score}/{totalQuestions}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Icon */}
            <div className={cn(
              "mx-auto mb-4 transform transition-all duration-700",
              showAnimation ? "scale-100 rotate-0" : "scale-0 rotate-180"
            )}>
              {getIcon()}
            </div>
            
            {/* Message */}
            <div className={cn(
              "transition-all duration-700 delay-500",
              showMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <p className="text-lg text-zinc-700 dark:text-zinc-300">
                {getMessage()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Question feedback animation
interface QuestionFeedbackProps {
  isCorrect: boolean
  onComplete?: () => void
}

export function QuestionFeedback({ isCorrect, onComplete }: QuestionFeedbackProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(() => onComplete?.(), 300)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={cn(
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
      "transition-all duration-300",
      show ? "opacity-100 scale-100" : "opacity-0 scale-75"
    )}>
      <div className={cn(
        "p-4 rounded-full shadow-lg border-2",
        isCorrect 
          ? "bg-green-500/90 border-green-400 text-white" 
          : "bg-red-500/90 border-red-400 text-white"
      )}>
        {isCorrect ? (
          <CheckCircle className="w-8 h-8" />
        ) : (
          <XCircle className="w-8 h-8" />
        )}
      </div>
    </div>
  )
}

// Progress indicator
interface ProgressIndicatorProps {
  current: number
  total: number
  className?: string
}

export function ProgressIndicator({ current, total, className }: ProgressIndicatorProps) {
  const percentage = (current / total) * 100

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
        <span>Question {current} of {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
