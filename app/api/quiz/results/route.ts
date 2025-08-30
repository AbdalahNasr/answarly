import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { saveQuizResult } from '@/server/services/quiz-session.service';
import { evaluateOpenEndedAnswer } from '@/lib/answer-evaluator';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get current user from JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!user?.id && !user?.userId && !user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id || user.userId || user._id;
    console.log('User ID from token:', userId);
    console.log('User object from token:', user);
    
    const body = await request.json();
    const { 
      category, 
      categoryName, 
      questionType, 
      difficulty, 
      totalQuestions, 
      correctAnswers, 
      answers, 
      timeSpent 
    } = body;

    // Validate required fields
    if (!category || !categoryName || !questionType || !difficulty || 
        totalQuestions === undefined || correctAnswers === undefined || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate score and correct answers on backend
    let calculatedCorrectAnswers = 0;
    const processedAnswers = [];
    
    // Get the actual questions to check answers
    const mongoose = await import('mongoose');
    const Question = (await import('@/server/models/question.model')).default;
    
    for (const answer of answers) {
      console.log('Processing answer:', {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        questionText: answer.questionText
      });
      
      const question = await Question.findById(answer.questionId).lean();
      console.log('Found question:', question ? {
        _id: question._id,
        text: question.text,
        correctAnswer: question.correctAnswer,
        type: question.type
      } : 'Question not found');
      
      if (question) {
        let isCorrect = false;
        let correctAnswer = question.correctAnswer || "Unknown";
        
        // Handle different question types
        if (question.type === 'open_ended' && question.correctAnswer) {
          // Use sophisticated evaluation for open-ended questions
          const evaluation = evaluateOpenEndedAnswer({
            userAnswer: answer.selectedAnswer,
            correctAnswer: question.correctAnswer,
            keywords: question.keywords || [],
            minSimilarity: 0.7,
            requireAllKeywords: false // Allow partial credit
          });
          
          isCorrect = evaluation.isCorrect;
          // For open-ended questions, we consider it correct if score >= 70
          if (evaluation.score >= 70) {
            isCorrect = true;
            calculatedCorrectAnswers++;
          }
          
          // Add evaluation details to the answer
          processedAnswers.push({
            ...answer,
            correctAnswer,
            isCorrect,
            evaluation: {
              score: evaluation.score,
              feedback: evaluation.feedback,
              similarity: evaluation.similarity,
              matchedKeywords: evaluation.matchedKeywords,
              missingKeywords: evaluation.missingKeywords
            }
          });
        } else {
          // Standard exact matching for other question types
          isCorrect = answer.selectedAnswer === question.correctAnswer;
          if (isCorrect) calculatedCorrectAnswers++;
          
          processedAnswers.push({
            ...answer,
            correctAnswer,
            isCorrect
          });
        }
      } else {
        // If question not found, provide default values
        processedAnswers.push({
          ...answer,
          correctAnswer: "Question not found",
          isCorrect: false
        });
      }
    }
    
    const score = totalQuestions > 0 ? (calculatedCorrectAnswers / totalQuestions) * 100 : 0;

    const quizResult = {
      userId,
      category,
      categoryName,
      questionType,
      difficulty,
      totalQuestions,
      correctAnswers: calculatedCorrectAnswers,
      score,
      answers: processedAnswers,
      timeSpent: timeSpent || 0
    };

    const savedResult = await saveQuizResult(quizResult);

    return NextResponse.json({
      message: 'Quiz result saved successfully',
      result: savedResult
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving quiz result:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to save quiz result' },
      { status: 500 }
    );
  }
}
