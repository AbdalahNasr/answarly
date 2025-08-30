"use client"

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MetallicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export function MetallicButton({ 
  children, 
  className = "", 
  variant = 'primary',
  size = 'md',
  ...props 
}: MetallicButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-full font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/25",
    secondary: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-gray-800 border border-gray-300 shadow-lg hover:shadow-xl",
    glow: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)]"
  }

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Shiny overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      <span className="relative z-10">
        {children}
      </span>
    </button>
  )
}
