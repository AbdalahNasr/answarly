"use client"

import { useEffect } from "react"

export default function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = "smooth"
    return () => {
      root.style.scrollBehavior = prev
    }
  }, [])
  return null
}
