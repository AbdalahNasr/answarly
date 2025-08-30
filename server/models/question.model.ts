// server/models/question.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./category.model";

export interface IQuestion extends Document {
  text: string;
  options?: string[]; // Multiple choice answers
  correctAnswer?: string; // Can be an option or a key
  keywords?: string[]; // Keywords for open-ended question evaluation
  category: ICategory["_id"]; // Reference to any level category
  reason?: string;
  difficulty?: "easy" | "medium" | "hard";
  type?: "multiple_choice" | "true_false" | "code_snippet" | "open_ended";
  createdBy?: string; // Reference to user who created the question
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    options: { type: [String] }, // Made optional for different question types
    correctAnswer: { type: String }, // Made optional for different question types
    keywords: { type: [String] }, // Keywords for open-ended question evaluation
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    reason: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "code_snippet", "open_ended"],
      default: "multiple_choice",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Reference to user
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
