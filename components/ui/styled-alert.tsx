"use client"

import * as React from "react"
import { X, AlertCircle, CheckCircle, Clock, Info, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StyledAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error" | "time"
  showCloseButton?: boolean
  autoClose?: boolean
  autoCloseDelay?: number
  className?: string
}

const alertIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
  time: Clock,
}

const alertStyles = {
  info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  success: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  error: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  time: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

// Full Screen Star Animation Component
const FullScreenStarAnimation = ({ type }: { type: string }) => {
  const [stars, setStars] = React.useState<Array<{ id: number; x: number; y: number; delay: number; scale: number; animation: string }>>([])

  React.useEffect(() => {
    // Create stars scattered across the entire screen
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random position across screen width
      y: Math.random() * 100, // Random position across screen height
      delay: Math.random() * 3, // Random delay up to 3 seconds
      scale: 0.3 + Math.random() * 0.7, // Random scale between 0.3 and 1.0
      animation: Math.random() > 0.5 ? 'animate-ping' : 'animate-pulse' // Random animation type
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] w-screen h-screen">
      {stars.map((star) => (
        <div
          key={star.id}
          className={cn(
            "absolute w-2 h-2",
            star.animation,
            type === 'success' ? 'text-yellow-300/40' : 
            type === 'warning' ? 'text-orange-300/40' : 
            type === 'error' ? 'text-red-300/40' : 
            type === 'time' ? 'text-blue-300/40' : 'text-indigo-300/40'
          )}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `translate(-50%, -50%) scale(${star.scale})`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          <Star className="w-full h-full fill-current" />
        </div>
      ))}
    </div>
  )
}

// Icon Star Animation Component
const IconStarAnimation = ({ type }: { type: string }) => {
  const [stars, setStars] = React.useState<Array<{ id: number; x: number; y: number; delay: number; scale: number }>>([])

  React.useEffect(() => {
    // Create 8 stars around the icon
    const newStars = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.cos((i * Math.PI * 2) / 8) * 30,
      y: Math.sin((i * Math.PI * 2) / 8) * 30,
      delay: i * 0.1,
      scale: 0.5 + Math.random() * 0.5
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className={cn(
            "absolute w-3 h-3 animate-ping",
            type === 'success' ? 'text-yellow-400' : 
            type === 'warning' ? 'text-orange-400' : 
            type === 'error' ? 'text-red-400' : 
            type === 'time' ? 'text-blue-400' : 'text-indigo-400'
          )}
          style={{
            left: `calc(50% + ${star.x}px)`,
            top: `calc(50% + ${star.y}px)`,
            transform: `translate(-50%, -50%) scale(${star.scale})`,
            animationDelay: `${star.delay}s`,
            animationDuration: '2s'
          }}
        >
          <Star className="w-full h-full fill-current" />
        </div>
      ))}
    </div>
  )
}

export function StyledAlert({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 5000,
  className,
}: StyledAlertProps) {
  const IconComponent = alertIcons[type]
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    if (autoClose && isOpen) {
      const startTime = Date.now()
      const endTime = startTime + autoCloseDelay
      
      const progressTimer = setInterval(() => {
        const remaining = endTime - Date.now()
        const newProgress = Math.max(0, (remaining / autoCloseDelay) * 100)
        setProgress(newProgress)
        
        if (remaining <= 0) {
          clearInterval(progressTimer)
          onClose()
        }
      }, 50)
      
      return () => clearInterval(progressTimer)
    }
  }, [autoClose, isOpen, autoCloseDelay, onClose])

  React.useEffect(() => {
    if (isOpen) {
      setProgress(100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Full Screen Star Animation Layer - Higher z-index to be above everything */}
      <FullScreenStarAnimation type={type} />
      
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={onClose}
        />
        
        {/* Alert Content */}
        <div className={cn(
          "relative w-full max-w-md transform animate-in slide-in-from-top-2 fade-in-0 duration-300 hover:scale-105 transition-transform",
          className
        )}>
          <div className={cn(
            "relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20",
            "bg-white/95 dark:bg-zinc-900/95 shadow-2xl",
            "p-6 space-y-4",
            "ring-1 ring-black/5 dark:ring-white/5"
          )}>
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn(
                "relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                alertStyles[type]
              )}>
                <IconComponent className="w-5 h-5" />
                {/* Icon Star Animation */}
                <IconStarAnimation type={type} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {message}
                </p>
              </div>
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white"
                size="sm"
              >
                Got it
              </Button>
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 animate-pulse pointer-events-none" />
            
            {/* Floating Stars Around Alert */}
            <div className="absolute -inset-4 pointer-events-none">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-2 h-2 animate-bounce",
                    type === 'success' ? 'text-green-400' : 
                    type === 'warning' ? 'text-yellow-400' : 
                    type === 'error' ? 'text-red-400' : 
                    type === 'time' ? 'text-blue-400' : 'text-indigo-400'
                  )}
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${10 + (i % 2 * 80)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '3s'
                  }}
                >
                  <Star className="w-full h-full fill-current opacity-60" />
                </div>
              ))}
            </div>
            
            {/* Progress bar for auto-close */}
            {autoClose && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-b-2xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Hook for easy usage
export function useStyledAlert() {
  const [alertState, setAlertState] = React.useState<{
    isOpen: boolean
    title: string
    message: string
    type: "info" | "success" | "warning" | "error" | "time"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  const showAlert = React.useCallback((
    title: string, 
    message: string, 
    type: "info" | "success" | "warning" | "error" | "time" = "info"
  ) => {
    setAlertState({ isOpen: true, title, message, type })
  }, [])

  const hideAlert = React.useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    alertState,
    showAlert,
    hideAlert,
  }
}
