export type ApiSubcategory = { _id?: string; name: string; description?: string; category?: string }

export async function fetchSubcategoriesByCategory(categoryId: string): Promise<ApiSubcategory[]> {
	if (!categoryId) return []
	const res = await fetch(`/api/subcategories?categoryId=${encodeURIComponent(categoryId)}`)
	if (!res.ok) return []
	const json = await res.json()
	const data = json?.subcategories ?? json
	return Array.isArray(data) ? data : []
}

export async function createSubcategoryApi(data: { name: string; category: string; description?: string }) {
	const res = await fetch('/api/subcategories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error('Failed to create subcategory')
	return res.json()
}

export default { fetchSubcategoriesByCategory, createSubcategoryApi }


