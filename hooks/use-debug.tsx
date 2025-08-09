"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"

const KEY = "answerly-debug"

export function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    const byStorage = window.localStorage.getItem(KEY) === "1"
    const byQuery = typeof window !== "undefined" && window.location.search.includes("debug=1")
    return byStorage || byQuery
  } catch {
    return false
  }
}
export function setDebugEnabled(v: boolean) {
  try {
    window.localStorage.setItem(KEY, v ? "1" : "0")
  } catch {}
}

function getStyle(el: Element | null) {
  if (!el || typeof window === "undefined") return null
  try {
    return window.getComputedStyle(el)
  } catch {
    return null
  }
}
function toClassName(el: any) {
  try {
    if (!el) return ""
    // SVG className can be an object with baseVal
    if (typeof el.className === "object" && "baseVal" in el.className) return String(el.className.baseVal || "")
    return String(el.className || "")
  } catch {
    return ""
  }
}
function pickInfoFor(el: Element | null) {
  if (!el) return null
  const st = getStyle(el)
  const rect = (el as HTMLElement).getBoundingClientRect?.()
  const attrs: Record<string, string | boolean> = {}
  try {
    if ((el as HTMLElement).hasAttribute?.("disabled")) attrs["disabled"] = true
    if ((el as HTMLElement).hasAttribute?.("readonly")) attrs["readonly"] = true
    if ((el as HTMLElement).getAttribute) {
      const role = (el as HTMLElement).getAttribute("role")
      if (role) attrs["role"] = role
    }
  } catch {}
  return {
    tag: el.tagName.toLowerCase(),
    id: (el as HTMLElement).id || undefined,
    cls: toClassName(el),
    zIndex: st?.zIndex ?? undefined,
    pointerEvents: st?.pointerEvents ?? undefined,
    opacity: st?.opacity ?? undefined,
    display: st?.display ?? undefined,
    visibility: st?.visibility ?? undefined,
    position: st?.position ?? undefined,
    attrs,
    rect: rect
      ? { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
      : undefined,
  }
}

function inspectTopElementsAtPoint(x: number, y: number) {
  if (typeof document === "undefined") return []
  return document
    .elementsFromPoint(x, y)
    .slice(0, 10)
    .map((e) => pickInfoFor(e))
}

function inspectTopElementsAtCenter(el: HTMLElement | null) {
  if (!el) return []
  const r = el.getBoundingClientRect()
  const cx = Math.floor(r.left + r.width / 2)
  const cy = Math.floor(r.top + Math.min(r.height / 2, 14))
  return inspectTopElementsAtPoint(cx, cy)
}

function getAncestorChain(el: Element | null) {
  const chain: ReturnType<typeof pickInfoFor>[] = []
  let cur: Element | null = el
  for (let i = 0; i < 12 && cur; i++) {
    chain.push(pickInfoFor(cur))
    cur = cur.parentElement
  }
  return chain
}

function isInteractable(el: HTMLElement | null) {
  if (!el) return false
  const st = getStyle(el)
  if (!st) return false
  if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") return false
  if (st.pointerEvents === "none") return false
  return true
}

declare global {
  interface Window {
    AnswerlyDebug?: {
      enabled: () => boolean
      toggle: () => void
      report: () => void
    }
  }
}

export function useInputDebug(label: string) {
  const enabled = isDebugEnabled()
  const ref = useRef<HTMLElement | null>(null)

  const log = useCallback(
    (phase: string, payload?: any) => {
      if (!enabled) return
      // eslint-disable-next-line no-console
      console.log(`[DEBUG][${label}] ${phase}`, payload ?? "")
    },
    [enabled, label],
  )

  const onFocus = useCallback(
    (e: React.FocusEvent<any>) => {
      const self = e.currentTarget as HTMLElement
      log("focus", {
        defaultPrevented: (e as any).defaultPrevented,
        activeEl: pickInfoFor(document.activeElement as Element),
        self: pickInfoFor(self),
        selfInteractable: isInteractable(self),
        topAtCenter: inspectTopElementsAtCenter(ref.current as HTMLElement),
      })
    },
    [log],
  )
  const onBlur = useCallback(
    (e: React.FocusEvent<any>) => {
      log("blur", { nextActiveEl: pickInfoFor(document.activeElement as Element) })
    },
    [log],
  )
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<any>) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement
      log("keydown", {
        key: e.key,
        code: e.code,
        defaultPrevented: e.defaultPrevented,
        targetDisabled: t?.disabled ?? false,
        targetReadOnly: (t as any)?.readOnly ?? false,
        valueLen: (t?.value || "").length,
      })
    },
    [log],
  )
  const onInput = useCallback(
    (e: React.FormEvent<any>) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement
      log("input", { valueLen: (t?.value || "").length })
    },
    [log],
  )
  const onClick = useCallback(
    (e: React.MouseEvent<any>) => {
      log("click", {
        defaultPrevented: e.defaultPrevented,
        topAtCenter: inspectTopElementsAtCenter(ref.current as HTMLElement),
      })
    },
    [log],
  )

  useEffect(() => {
    if (!enabled) return
    log("mounted", { self: pickInfoFor(ref.current as Element) })
  }, [enabled, log])

  return {
    ref,
    bind: { onFocus, onBlur, onKeyDown, onInput, onClick },
    enabled,
    log,
  }
}

export function DebugPageListeners({ page }: { page: string }) {
  const [enabled, setEnabled] = useState(isDebugEnabled())

  useEffect(() => {
    const onToggle = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "d" || e.key === "D")) {
        const next = !isDebugEnabled()
        setDebugEnabled(next)
        setEnabled(next)
        // eslint-disable-next-line no-console
        console.log(`[DEBUG][${page}] toggled ${next ? "ON" : "OFF"} via Alt+D`)
      }
    }

    const onKD = (e: KeyboardEvent) => {
      if (!isDebugEnabled()) return
      // eslint-disable-next-line no-console
      console.log(`[DEBUG][${page}] keydown(capture)`, {
        key: e.key,
        code: e.code,
        defaultPrevented: e.defaultPrevented,
        activeEl: pickInfoFor(document.activeElement as Element),
      })
    }
    const onPD = (e: PointerEvent) => {
      if (!isDebugEnabled()) return
      // eslint-disable-next-line no-console
      console.log(`[DEBUG][${page}] pointerdown(capture)`, {
        at: { x: e.clientX, y: e.clientY },
        top: inspectTopElementsAtPoint(e.clientX, e.clientY),
      })
    }
    const onErr = (msg: any, src: any, line: any, col: any, err: any) => {
      if (!isDebugEnabled()) return
      // eslint-disable-next-line no-console
      console.error("[DEBUG][window.onerror]", { msg, src, line, col, err })
      return false
    }
    const onRej = (e: PromiseRejectionEvent) => {
      if (!isDebugEnabled()) return
      // eslint-disable-next-line no-console
      console.error("[DEBUG][unhandledrejection]", { reason: e.reason })
    }

    window.addEventListener("keydown", onToggle)
    window.addEventListener("keydown", onKD, true)
    window.addEventListener("pointerdown", onPD, true)
    window.addEventListener("error", onErr as any)
    window.addEventListener("unhandledrejection", onRej as any)

    // Expose a one-shot report API
    window.AnswerlyDebug = {
      enabled: isDebugEnabled,
      toggle: () => {
        const next = !isDebugEnabled()
        setDebugEnabled(next)
        setEnabled(next)
        // eslint-disable-next-line no-console
        console.log(`[DEBUG][${page}] toggled ${next ? "ON" : "OFF"} via API`)
      },
      report: () => {
        const crit = Array.from(document.querySelectorAll<HTMLElement>("input, textarea, [role='textbox']"))
        // eslint-disable-next-line no-console
        console.groupCollapsed("[DEBUG] Interactive Elements Report")
        crit.forEach((el, i) => {
          const top = inspectTopElementsAtCenter(el)
          const self = pickInfoFor(el)
          const ancestors = getAncestorChain(el)
          // eslint-disable-next-line no-console
          console.log(`- Target #${i + 1}`, {
            self,
            isInteractable: isInteractable(el),
            topAtCenter: top,
            ancestors,
            activeEl: pickInfoFor(document.activeElement as Element),
          })
        })
        // eslint-disable-next-line no-console
        console.groupEnd()
      },
    }

    return () => {
      window.removeEventListener("keydown", onToggle)
      window.removeEventListener("keydown", onKD, true)
      window.removeEventListener("pointerdown", onPD, true)
      window.removeEventListener("error", onErr as any)
      window.removeEventListener("unhandledrejection", onRej as any)
    }
  }, [page])

  return enabled ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-[9999] rounded-full bg-black/70 text-white text-xs px-2 py-1"
    >
      Debug ON
    </div>
  ) : null
}
