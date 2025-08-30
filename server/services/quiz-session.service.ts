import QuizSession from '../models/quiz-session.model';
import User from '../models/user.model';
import { connectToDatabase } from '@/lib/db';

export interface QuizResult {
  userId: string;
  category: string;
  categoryName: string;
  questionType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: {
    questionId: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
  timeSpent: number;
}

export const saveQuizResult = async (result: QuizResult) => {
  await connectToDatabase();
  
  const quizSession = new QuizSession({
    userId: result.userId,
    category: result.category,
    categoryName: result.categoryName,
    questionType: result.questionType,
    difficulty: result.difficulty,
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    score: result.score,
    answers: result.answers,
    completedAt: new Date(),
    timeSpent: result.timeSpent,
  });

  const savedSession = await quizSession.save();
  
  // Progress is now calculated on-demand from quiz sessions
  // No need to store progress separately - it's always up-to-date!
  
  return savedSession;
};

export const getUserQuizHistory = async (userId: string, limit = 20) => {
  await connectToDatabase();
  
  return await QuizSession.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const getLeaderboard = async (limit = 50) => {
  await connectToDatabase();
  
  // Aggregate to get user statistics
  const pipeline: any[] = [
    {
      $group: {
        _id: '$userId',
        totalQuizzes: { $sum: 1 },
        totalScore: { $sum: '$score' },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalQuestions: { $sum: '$totalQuestions' },
        lastQuizDate: { $max: '$createdAt' }
      }
    },
    {
      $sort: { 
        averageScore: -1, 
        totalScore: -1, 
        totalQuizzes: -1 
      }
    },
    { $limit: limit }
  ];

  const results = await QuizSession.aggregate(pipeline);

  // Get user details for each result
  const leaderboard = [];
  for (const result of results) {
    const user = await User.findById(result._id).select('username email').lean() as any;
    if (user) {
      leaderboard.push({
        userId: result._id,
        username: user.username,
        email: user.email,
        totalQuizzes: result.totalQuizzes,
        totalScore: result.totalScore,
        averageScore: Math.round(result.averageScore * 100) / 100,
        bestScore: result.bestScore,
        totalCorrectAnswers: result.totalCorrectAnswers,
        totalQuestions: result.totalQuestions,
        accuracy: result.totalQuestions > 0 ? Math.round((result.totalCorrectAnswers / result.totalQuestions) * 100) : 0,
        lastQuizDate: result.lastQuizDate
      });
    }
  }

  return leaderboard;
};

export const getUserLeaderboardPosition = async (userId: string) => {
  await connectToDatabase();
  
  // Get all users ranked by average score
  const pipeline: any[] = [
    {
      $group: {
        _id: '$userId',
        averageScore: { $avg: '$score' },
        totalScore: { $sum: '$score' },
        totalQuizzes: { $sum: 1 }
      }
    },
    {
      $sort: { 
        averageScore: -1, 
        totalScore: -1, 
        totalQuizzes: -1 
      }
    }
  ];

  const allUsers = await QuizSession.aggregate(pipeline);
  
  // Find user's position
  const userPosition = allUsers.findIndex((user: any) => user._id.toString() === userId);
  
  if (userPosition === -1) {
    return null; // User hasn't taken any quizzes
  }

  const userStats = allUsers[userPosition];
  const user = await User.findById(userId).select('username email').lean();

  return {
    position: userPosition + 1,
    totalUsers: allUsers.length,
    username: user?.username || 'Unknown',
    averageScore: Math.round(userStats.averageScore * 100) / 100,
    totalScore: userStats.totalScore,
    totalQuizzes: userStats.totalQuizzes
  };
};

export const getCategoryLeaderboard = async (categoryId: string, limit = 20) => {
  await connectToDatabase();
  
  const pipeline: any[] = [
    { $match: { category: categoryId } },
    {
      $group: {
        _id: '$userId',
        totalQuizzes: { $sum: 1 },
        totalScore: { $sum: '$score' },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalQuestions: { $sum: '$totalQuestions' }
      }
    },
    {
      $sort: { 
        averageScore: -1, 
        totalScore: -1 
      }
    },
    { $limit: limit }
  ];

  const results = await QuizSession.aggregate(pipeline);

  const leaderboard = [];
  for (const result of results) {
    const user = await User.findById(result._id).select('username email').lean() as any;
    if (user) {
      leaderboard.push({
        userId: result._id,
        username: user.username,
        email: user.email,
        totalQuizzes: result.totalQuizzes,
        totalScore: result.totalScore,
        averageScore: Math.round(result.averageScore * 100) / 100,
        bestScore: result.bestScore,
        totalCorrectAnswers: result.totalCorrectAnswers,
        totalQuestions: result.totalQuestions,
        accuracy: result.totalQuestions > 0 ? Math.round((result.totalCorrectAnswers / result.totalQuestions) * 100) : 0
      });
    }
  }

  return leaderboard;
};

export default {
  saveQuizResult,
  getUserQuizHistory,
  getLeaderboard,
  getUserLeaderboardPosition,
  getCategoryLeaderboard
};
