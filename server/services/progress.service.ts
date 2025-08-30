import { connectToDatabase } from '@/lib/db';
import QuizSession from '../models/quiz-session.model';
import User from '../models/user.model';

export interface UserProgress {
  userId: string;
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrectAnswers: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  categoriesProgress: {
    [categoryName: string]: {
      quizzesTaken: number;
      averageScore: number;
      totalQuestions: number;
      correctAnswers: number;
    };
  };
  achievements: string[];
  lastActiveDate: Date;
  totalStudyTime: number; // in seconds
  skillLevel: string;
  recentActivity: {
    date: string;
    quizzesTaken: number;
    averageScore: number;
  }[];
}

export const calculateUserProgress = async (userId: string): Promise<UserProgress> => {
  await connectToDatabase();
  
  // Get all quiz sessions for the user
  const quizSessions = await QuizSession.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  
  if (quizSessions.length === 0) {
    return {
      userId,
      totalQuizzes: 0,
      totalQuestions: 0,
      totalCorrectAnswers: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      categoriesProgress: {},
      achievements: [],
      lastActiveDate: new Date(),
      totalStudyTime: 0,
      skillLevel: 'Beginner',
      recentActivity: []
    };
  }
  
  // Calculate basic stats
  const totalQuizzes = quizSessions.length;
  const totalQuestions = quizSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
  const totalCorrectAnswers = quizSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  const averageScore = totalQuizzes > 0 ? 
    quizSessions.reduce((sum, session) => sum + session.score, 0) / totalQuizzes : 0;
  
  // Calculate total study time
  const totalStudyTime = quizSessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0);
  
  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(quizSessions);
  
  // Calculate category progress
  const categoriesProgress = calculateCategoryProgress(quizSessions);
  
  // Calculate achievements
  const achievements = calculateAchievements(quizSessions, totalQuizzes, averageScore, currentStreak);
  
  // Calculate skill level
  const skillLevel = calculateSkillLevel(averageScore, totalQuizzes);
  
  // Calculate recent activity (last 7 days)
  const recentActivity = calculateRecentActivity(quizSessions);
  
  // Get last active date
  const lastActiveDate = quizSessions[0]?.createdAt || new Date();
  
  return {
    userId,
    totalQuizzes,
    totalQuestions,
    totalCorrectAnswers,
    averageScore: Math.round(averageScore * 100) / 100,
    currentStreak,
    longestStreak,
    categoriesProgress,
    achievements,
    lastActiveDate,
    totalStudyTime,
    skillLevel,
    recentActivity
  };
};

const calculateStreaks = (quizSessions: any[]) => {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Group by date and check consecutive days
  const dates = [...new Set(quizSessions.map(s => 
    new Date(s.createdAt).toDateString()
  ))].sort().reverse();
  
  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const nextDate = i < dates.length - 1 ? new Date(dates[i + 1]) : null;
    
    if (nextDate) {
      const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    } else {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }
  }
  
  return { currentStreak, longestStreak };
};

const calculateCategoryProgress = (quizSessions: any[]) => {
  const categories: { [key: string]: any } = {};
  
  quizSessions.forEach(session => {
    const categoryName = session.categoryName || 'Unknown';
    
    if (!categories[categoryName]) {
      categories[categoryName] = {
        quizzesTaken: 0,
        totalScore: 0,
        totalQuestions: 0,
        correctAnswers: 0
      };
    }
    
    categories[categoryName].quizzesTaken++;
    categories[categoryName].totalScore += session.score;
    categories[categoryName].totalQuestions += session.totalQuestions;
    categories[categoryName].correctAnswers += session.correctAnswers;
  });
  
  // Calculate averages
  Object.keys(categories).forEach(category => {
    const cat = categories[category];
    cat.averageScore = Math.round((cat.totalScore / cat.quizzesTaken) * 100) / 100;
  });
  
  return categories;
};

const calculateAchievements = (quizSessions: any[], totalQuizzes: number, averageScore: number, currentStreak: number) => {
  const achievements = [];
  
  if (totalQuizzes >= 1) achievements.push('First Quiz');
  if (totalQuizzes >= 5) achievements.push('Quiz Enthusiast');
  if (totalQuizzes >= 10) achievements.push('Quiz Master');
  if (totalQuizzes >= 25) achievements.push('Quiz Champion');
  
  if (averageScore >= 90) achievements.push('High Achiever');
  if (averageScore >= 95) achievements.push('Perfect Score');
  
  if (currentStreak >= 3) achievements.push('3-Day Streak');
  if (currentStreak >= 7) achievements.push('Week Warrior');
  if (currentStreak >= 14) achievements.push('Fortnight Fighter');
  if (currentStreak >= 30) achievements.push('Monthly Master');
  
  // Check for perfect scores
  const perfectScores = quizSessions.filter(s => s.score === 100).length;
  if (perfectScores >= 1) achievements.push('Perfect Score');
  if (perfectScores >= 5) achievements.push('Perfectionist');
  
  return achievements;
};

const calculateSkillLevel = (averageScore: number, totalQuizzes: number): string => {
  if (totalQuizzes < 3) return 'Beginner';
  if (averageScore < 50) return 'Novice';
  if (averageScore < 70) return 'Intermediate';
  if (averageScore < 85) return 'Advanced';
  if (averageScore < 95) return 'Expert';
  return 'Master';
};

const calculateRecentActivity = (quizSessions: any[]) => {
  const recentActivity = [];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  });
  
  last7Days.forEach(dateStr => {
    const daySessions = quizSessions.filter(s => 
      new Date(s.createdAt).toDateString() === dateStr
    );
    
    const averageScore = daySessions.length > 0 ? 
      daySessions.reduce((sum, s) => sum + s.score, 0) / daySessions.length : 0;
    
    recentActivity.push({
      date: dateStr,
      quizzesTaken: daySessions.length,
      averageScore: Math.round(averageScore * 100) / 100
    });
  });
  
  return recentActivity.reverse();
};

export default {
  calculateUserProgress
};
