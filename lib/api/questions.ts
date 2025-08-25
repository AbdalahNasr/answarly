export type CreateQuestionPayload = {
  text: string
  type: 'multiple_choice' | 'true_false' | 'code_snippet' | 'open_ended'
  options?: string[]
  correctAnswer?: string
  category: string
  subCategory?: string
  reason?: string
  difficulty?: "easy" | "medium" | "hard"
}

export async function createQuestionApi(payload: CreateQuestionPayload) {
  const token = localStorage.getItem('answerly-token')
  
  // Debug: Log what we find in localStorage
  console.log('Debug - localStorage contents:', {
    token: token,
    user: localStorage.getItem('answerly-user'),
    allKeys: Object.keys(localStorage)
  })
  
  if (!token) {
    const user = localStorage.getItem('answerly-user')
    if (user) {
      // Clear the corrupted user data and redirect to login
      localStorage.removeItem('answerly-user')
      localStorage.removeItem('answerly-token')
      throw new Error('Authentication required - Your session appears to be corrupted. Please log in again.')
    } else {
      throw new Error('Authentication required - Please log in to create questions')
    }
  }

  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to create question')
  }
  
  return res.json()
}

// Debug function to check authentication status
export function debugAuth() {
  const token = localStorage.getItem('answerly-token')
  const user = localStorage.getItem('answerly-user')
  
  console.log('=== Authentication Debug ===')
  console.log('Token:', token ? 'Present' : 'Missing')
  console.log('User:', user ? 'Present' : 'Missing')
  console.log('All localStorage keys:', Object.keys(localStorage))
  
  if (token) {
    try {
      // Try to decode the JWT token (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('Token payload:', payload)
      console.log('Token expires:', new Date(payload.exp * 1000))
      console.log('Token is expired:', Date.now() > payload.exp * 1000)
    } catch (e) {
      console.log('Token decode error:', e)
    }
  }
  
  return { token: !!token, user: !!user }
}

// Function to clear authentication data
export function clearAuth() {
  localStorage.removeItem('answerly-user')
  localStorage.removeItem('answerly-token')
  console.log('Authentication data cleared')
}

export default { createQuestionApi, debugAuth, clearAuth }


