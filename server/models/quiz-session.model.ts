import mongoose, { Schema, Document } from "mongoose";

export interface IQuizSession extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user who took the quiz
  category: mongoose.Types.ObjectId; // Reference to the category
  categoryName: string; // Store category name for easy access
  questionType: string; // Type of questions (multiple_choice, true_false, etc.)
  difficulty: string; // Difficulty level
  totalQuestions: number; // Total number of questions in the quiz
  correctAnswers: number; // Number of correct answers
  score: number; // Percentage score (correctAnswers / totalQuestions * 100)
  answers: {
    questionId: string; // Changed to string to match frontend data
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    evaluation?: {
      score: number;
      feedback: string;
      similarity: number;
      matchedKeywords: string[];
      missingKeywords: string[];
    };
  }[];
  startedAt: Date; // When the quiz was started
  completedAt: Date; // When the quiz was completed
  timeSpent: number; // Time spent in seconds
}

const QuizSessionSchema = new Schema<IQuizSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    questionType: { type: String, required: true },
    difficulty: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    score: { type: Number, required: true },
    answers: [
      {
        questionId: { type: String, required: true }, // Changed to String to match frontend data
        questionText: { type: String, required: true },
        selectedAnswer: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        evaluation: {
          score: { type: Number },
          feedback: { type: String },
          similarity: { type: Number },
          matchedKeywords: [{ type: String }],
          missingKeywords: [{ type: String }],
        },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    timeSpent: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

// Index for efficient querying
QuizSessionSchema.index({ userId: 1, createdAt: -1 });
QuizSessionSchema.index({ category: 1, score: -1 });
QuizSessionSchema.index({ score: -1, createdAt: -1 });

export default mongoose.models.QuizSession || mongoose.model<IQuizSession>("QuizSession", QuizSessionSchema);
