// models/quiz.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  questionText: string;
  answer: string;
  options?: string[]; // optional if you want multiple choice
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  questions: IQuestion[];
  createdBy?: mongoose.Types.ObjectId; // user who created the quiz
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  answer: { type: String, required: true },
  options: { type: [String], default: [] },
});

const QuizSchema: Schema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    questions: { type: [QuestionSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
