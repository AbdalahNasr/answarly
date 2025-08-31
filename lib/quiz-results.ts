export interface QuizAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  category: string;
  categoryName: string;
  questionType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: QuizAnswer[];
  timeSpent: number;
}

export const saveQuizResult = async (result: QuizResult) => {
  const token = localStorage.getItem('answerly-token')
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch('/api/quiz/results', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(result)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save quiz result')
  }

  return response.json()
}











