export async function fetchCategories(): Promise<{ name: string; _id?: string }[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  // support both { categories: [...] } and direct array responses
  const data = json?.categories ?? json;
  return Array.isArray(data) ? data : [];
}

export async function createCategoryApi(data: { name: string; description?: string }) {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}
