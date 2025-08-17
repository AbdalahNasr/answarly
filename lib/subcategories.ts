// lib/subcategories.ts
export type Subcategory = { _id?: string; name: string; category?: string }

const local: Subcategory[] = []

export function getAllSubcategories() {
	return local
}

export function addSubcategory(s: Subcategory) {
	local.push({ ...s, _id: String(Date.now()) })
}

export default { getAllSubcategories, addSubcategory }
