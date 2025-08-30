"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'shiny' | 'metallic'
  glow?: boolean
}

export function GlassCard({ 
  children, 
  className = "", 
  variant = 'default',
  glow = false 
}: GlassCardProps) {
  const baseClasses = "relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/20"
  
  const variantClasses = {
    default: "bg-white/10 dark:bg-white/5",
    shiny: "bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-white/10 dark:via-white/5 dark:to-white/2",
    metallic: "bg-gradient-to-br from-white/30 via-white/15 to-white/5 dark:from-white/20 dark:via-white/10 dark:to-white/5"
  }

  const glowClasses = glow 
    ? "shadow-[0_0_50px_rgba(79,70,229,0.3)] dark:shadow-[0_0_50px_rgba(124,58,237,0.3)]" 
    : "shadow-lg"

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      glowClasses,
      className
    )}>
      {/* Shiny overlay for metallic variant */}
      {variant === 'metallic' && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />
      )}
      
      {/* Animated border for shiny variant */}
      {variant === 'shiny' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
