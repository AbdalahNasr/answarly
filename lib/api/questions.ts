export type CreateQuestionPayload = {
  text: string
  options?: string[]
  correctAnswer?: string
  category: string
  subCategory?: string
  reason?: string
  difficulty?: "easy" | "medium" | "hard"
}

export async function createQuestionApi(payload: CreateQuestionPayload) {
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create question')
  return res.json()
}

export default { createQuestionApi }


