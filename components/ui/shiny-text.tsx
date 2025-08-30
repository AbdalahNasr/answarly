"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ShinyTextProps {
  children: ReactNode
  className?: string
  variant?: 'gradient' | 'metallic' | 'holographic'
}

export function ShinyText({ 
  children, 
  className = "", 
  variant = 'gradient' 
}: ShinyTextProps) {
  const variantClasses = {
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent",
    metallic: "bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 bg-clip-text text-transparent drop-shadow-lg",
    holographic: "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse"
  }

  return (
    <span className={cn(variantClasses[variant], className)}>
      {children}
    </span>
  )
}
