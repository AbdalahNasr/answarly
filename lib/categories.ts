export type Category = {
  id: string
  name: string
  slug: string
  createdAt: number
}

const KEY = "answerly-categories"

export function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

function safeGet(): Category[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Category[]) : []
  } catch {
    return []
  }
}

function safeSet(items: Category[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(items))
}

export function getCategories(): Category[] {
  return safeGet().sort((a, b) => a.name.localeCompare(b.name))
}

export function getCategoryNames(): string[] {
  return getCategories().map((c) => c.name)
}

export function categoryExists(name: string): boolean {
  const s = slugify(name)
  return getCategories().some((c) => c.slug === s)
}

export function ensureCategory(name: string): Category {
  const n = name.trim()
  if (!n) {
    return { id: "uncategorized", name: "Uncategorized", slug: "uncategorized", createdAt: Date.now() }
  }
  const s = slugify(n)
  const existing = getCategories().find((c) => c.slug === s)
  if (existing) return existing

  const created: Category = {
    id: Math.random().toString(36).slice(2),
    name: n,
    slug: s,
    createdAt: Date.now(),
  }
  const all = getCategories()
  safeSet([...all, created])
  return created
}

export function suggestCategories(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase()
  const names = getCategoryNames()
  if (!q) return names.slice(0, limit)
  const starts = names.filter((n) => n.toLowerCase().startsWith(q))
  const contains = names.filter((n) => !starts.includes(n) && n.toLowerCase().includes(q))
  return [...starts, ...contains].slice(0, limit)
}
