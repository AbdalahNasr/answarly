// Answer evaluation utility for open-ended questions
export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number; // 0-100
  feedback?: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  similarity: number; // 0-1
}

export interface OpenEndedAnswer {
  userAnswer: string;
  correctAnswer: string;
  keywords?: string[];
  minSimilarity?: number; // Default 0.7
  requireAllKeywords?: boolean; // Default true
}

/**
 * Evaluates an open-ended answer using keyword matching and fuzzy similarity
 * Similar to Python's difflib.SequenceMatcher but implemented in TypeScript
 */
export function evaluateOpenEndedAnswer({
  userAnswer,
  correctAnswer,
  keywords = [],
  minSimilarity = 0.7,
  requireAllKeywords = true
}: OpenEndedAnswer): AnswerEvaluation {
  const userAnswerLower = userAnswer.toLowerCase().trim();
  const correctAnswerLower = correctAnswer.toLowerCase().trim();
  
  // Calculate similarity using Levenshtein distance
  const similarity = calculateSimilarity(userAnswerLower, correctAnswerLower);
  
  // Keyword evaluation
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  if (keywords.length > 0) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      if (userAnswerLower.includes(keywordLower)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }
  }
  
  // Determine if answer is correct
  let isCorrect = false;
  let score = 0;
  let feedback = '';
  
  if (keywords.length > 0) {
    // Use keyword-based evaluation
    const keywordPass = requireAllKeywords 
      ? missingKeywords.length === 0 
      : matchedKeywords.length > 0;
    
    const similarityPass = similarity >= minSimilarity;
    
    isCorrect = keywordPass && similarityPass;
    
    // Calculate score based on keywords and similarity
    const keywordScore = keywords.length > 0 
      ? (matchedKeywords.length / keywords.length) * 60 
      : 0;
    const similarityScore = similarity * 40;
    score = Math.round(keywordScore + similarityScore);
    
    if (isCorrect) {
      feedback = 'Excellent answer!';
    } else if (keywordPass && !similarityPass) {
      feedback = 'Good keywords but answer could be more detailed.';
    } else if (!keywordPass && similarityPass) {
      feedback = 'Answer is similar but missing key concepts.';
    } else {
      feedback = 'Answer needs improvement. Check the key concepts.';
    }
  } else {
    // Use only similarity-based evaluation
    isCorrect = similarity >= minSimilarity;
    score = Math.round(similarity * 100);
    
    if (isCorrect) {
      feedback = 'Good answer!';
    } else {
      feedback = 'Answer could be more accurate.';
    }
  }
  
  return {
    isCorrect,
    score,
    feedback,
    matchedKeywords,
    missingKeywords,
    similarity
  };
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a value between 0 and 1, where 1 is identical
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0) return 0;
  if (str2.length === 0) return 0;
  
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  
  return 1 - (distance / maxLength);
}

/**
 * Extract keywords from a text (simple implementation)
 * This can be enhanced with NLP libraries if needed
 */
export function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and extract meaningful terms
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !commonWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    )
    .slice(0, 5); // Limit to 5 keywords
}

/**
 * Evaluates a fill-in-the-blank answer
 */
export function evaluateBlankAnswer(userAnswers: string[], correctAnswers: string[]): AnswerEvaluation {
  if (!userAnswers || !correctAnswers || correctAnswers.length === 0) {
    return { isCorrect: false, score: 0, matchedKeywords: [], missingKeywords: [], similarity: 0 };
  }

  let correctCount = 0;
  const length = Math.min(userAnswers.length, correctAnswers.length);
  
  for (let i = 0; i < length; i++) {
    if (userAnswers[i]?.toLowerCase().trim() === correctAnswers[i]?.toLowerCase().trim()) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / correctAnswers.length) * 100);
  return {
    isCorrect: score === 100,
    score,
    matchedKeywords: [],
    missingKeywords: [],
    similarity: score / 100
  };
}

/**
 * Evaluates match pairs answer
 */
export function evaluateMatchPairs(userPairs: Array<{ left: string; right: string }>, correctPairs: Array<{ left: string; right: string }>): AnswerEvaluation {
  if (!userPairs || !correctPairs || correctPairs.length === 0) {
    return { isCorrect: false, score: 0, matchedKeywords: [], missingKeywords: [], similarity: 0 };
  }

  let correctCount = 0;
  
  for (const userPair of userPairs) {
    const matchingCorrect = correctPairs.find(p => p.left === userPair.left);
    if (matchingCorrect && matchingCorrect.right === userPair.right) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / correctPairs.length) * 100);
  return {
    isCorrect: score === 100,
    score,
    matchedKeywords: [],
    missingKeywords: [],
    similarity: score / 100
  };
}

/**
 * Evaluates ordering answer
 */
export function evaluateOrdering(userOrder: string[], correctOrder: string[]): AnswerEvaluation {
  if (!userOrder || !correctOrder || correctOrder.length === 0 || userOrder.length !== correctOrder.length) {
    return { isCorrect: false, score: 0, matchedKeywords: [], missingKeywords: [], similarity: 0 };
  }

  let correctCount = 0;
  for (let i = 0; i < userOrder.length; i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctCount++;
    }
  }

  const score = Math.round((correctCount / correctOrder.length) * 100);
  return {
    isCorrect: score === 100,
    score,
    matchedKeywords: [],
    missingKeywords: [],
    similarity: score / 100
  };
}













