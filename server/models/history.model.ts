import mongoose, { Schema, Document } from "mongoose";

export interface History extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the user who took the quiz
  quizId: mongoose.Types.ObjectId; // Reference to the quiz taken
  score: number;                   // Final score of the attempt
  totalQuestions: number;          // Total number of questions in the quiz
  correctAnswers: number;          // Number of correct answers
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOption: string;
    isCorrect: boolean;
  }[];
  startedAt: Date;                 // When the quiz was started
  completedAt: Date;               // When the quiz was completed
}

const HistorySchema: Schema<History> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<History>("History", HistorySchema);
