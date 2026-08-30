"use client"

import { useEffect } from "react"

function formatReason(reason: any) {
  if (!reason) return "Unknown reason"
  if (typeof reason === "string") return reason
  if (reason instanceof Error) return reason.stack || reason.message
  // If a DOM Event was passed (common for some APIs), show its type and target
  if (typeof Event !== "undefined" && reason instanceof Event) {
    try {
      const target = (reason as any).target
      const t = target ? ` target=${target.tagName || target?.constructor?.name}` : ""
      return `Event(${reason.type})${t}`
    } catch {
      return `Event(${reason.type})`
    }
  }
  // Fallback: try JSON serialization
  try {
    return JSON.stringify(reason)
  } catch {
    return String(reason)
  }
}

export default function ErrorListener() {
  useEffect(() => {
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      try {
        const msg = formatReason((ev as any).reason)
        // Log a clearer message so devs don't just see [object Event]
        // eslint-disable-next-line no-console
        console.error("Unhandled promise rejection:", msg, ev)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Unhandled promise rejection (failed to format)", err, ev)
      }
    }

    const onError = (ev: ErrorEvent) => {
      try {
        // eslint-disable-next-line no-console
        console.error("Uncaught error:", ev.error ?? ev.message, ev)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Uncaught error (failed to format)", err, ev)
      }
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection)
    window.addEventListener("error", onError)

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
      window.removeEventListener("error", onError)
    }
  }, [])

  return null
}
