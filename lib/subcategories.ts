// lib/subcategories.ts
export type Subcategory = { _id?: string; name: string; category?: string }

// Fetch all subcategories from database API
export async function fetchSubcategories(): Promise<Subcategory[]> {
  try {
    const res = await fetch('/api/subcategories')
    if (!res.ok) return []
    const data = await res.json()
    return data.subcategories || []
  } catch (e) {
    console.error('Failed to fetch subcategories:', e)
    return []
  }
}

// Fetch subcategories by category
export async function fetchSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  try {
    const res = await fetch(`/api/subcategories?categoryId=${categoryId}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.subcategories || []
  } catch (e) {
    console.error('Failed to fetch subcategories by category:', e)
    return []
  }
}

// Get subcategory names for backward compatibility
export async function getSubcategoryNames(): Promise<string[]> {
  const subcategories = await fetchSubcategories()
  return subcategories.map((s) => s.name)
}

// Add subcategory to database
export async function addSubcategory(subcategory: Omit<Subcategory, '_id'>): Promise<Subcategory | null> {
  try {
    const res = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subcategory),
    })
    if (res.ok) {
      const data = await res.json()
      return data.subcategory
    }
  } catch (e) {
    console.error('Failed to create subcategory:', e)
  }
  return null
}

// Ensure subcategory exists (for backward compatibility)
export function ensureSubcategory(name: string, categoryId?: string): Subcategory {
  const trimmed = (name || '').trim()
  if (!trimmed) return { name: 'uncategorized' }
  
  return { 
    _id: String(Date.now()), 
    name: trimmed, 
    category: categoryId 
  }
}

export default { 
  fetchSubcategories, 
  fetchSubcategoriesByCategory,
  getSubcategoryNames,
  addSubcategory,
  ensureSubcategory
}
