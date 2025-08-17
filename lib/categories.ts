// lib/categories.ts
export type Category = { _id?: string; name: string; description?: string }

const localCategories: Category[] = []

export function ensureCategory(name: string) {
	const trimmed = (name || '').trim()
	if (!trimmed) return { name: 'uncategorized' }
	let found = localCategories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())
	if (!found) {
		found = { _id: String(Date.now()), name: trimmed }
		localCategories.push(found)
		// Fire-and-forget: try to create on server
		if (typeof window !== 'undefined') {
			fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: trimmed }),
			}).catch(() => {})
		}
	}
	return found
}

export function getCategoryNames() {
	return localCategories.map((c) => c.name)
}

export default {
	ensureCategory,
	getCategoryNames,
}

