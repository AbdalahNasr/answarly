// lib/categories.ts
export type Category = { 
  _id?: string; 
  name: string; 
  description?: string;
  parent?: string;
  level: number;
  path: string[];
  children?: Category[];
  isActive: boolean;
}

// Fetch categories from database API
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories')
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch (e) {
    console.error('Failed to fetch categories:', e)
    return []
  }
}

// Fetch categories by parent
export async function fetchCategoriesByParent(parentId?: string): Promise<Category[]> {
  try {
    const url = parentId ? `/api/categories?parentId=${parentId}` : '/api/categories'
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch (e) {
    console.error('Failed to fetch categories by parent:', e)
    return []
  }
}

// Fetch categories by level
export async function fetchCategoriesByLevel(level: number): Promise<Category[]> {
  try {
    const res = await fetch(`/api/categories?level=${level}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch (e) {
    console.error('Failed to fetch categories by level:', e)
    return []
  }
}

// Fetch full category tree
export async function fetchCategoryTree(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories?tree=true')
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch (e) {
    console.error('Failed to fetch category tree:', e)
    return []
  }
}

// Get category names for backward compatibility
export async function getCategoryNames(): Promise<string[]> {
  const categories = await fetchCategories()
  return categories.map((c) => c.name)
}

// Ensure category exists (create if not)
export async function ensureCategory(name: string, parentId?: string): Promise<Category> {
  const trimmed = (name || '').trim()
  if (!trimmed) return { name: 'uncategorized', level: 0, path: ['uncategorized'], isActive: true }

  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, parentId }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.category
    }
  } catch (e) {
    console.error('Failed to create category:', e)
  }
  return { name: trimmed, level: 0, path: [trimmed], isActive: true }
}

// Create a new category
export async function createCategory(name: string, description?: string, parentId?: string): Promise<Category | null> {
  try {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, parentId }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.category
    }
  } catch (e) {
    console.error('Failed to create category:', e)
  }
  return null
}

// Update a category
export async function updateCategory(categoryId: string, name?: string, description?: string): Promise<Category | null> {
  try {
    const res = await fetch(`/api/categories?id=${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.category
    }
  } catch (e) {
    console.error('Failed to update category:', e)
  }
  return null
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/categories?id=${categoryId}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch (e) {
    console.error('Failed to delete category:', e)
    return false
  }
}

export default {
  fetchCategories,
  fetchCategoriesByParent,
  fetchCategoriesByLevel,
  fetchCategoryTree,
  getCategoryNames,
  ensureCategory,
  createCategory,
  updateCategory,
  deleteCategory,
}

