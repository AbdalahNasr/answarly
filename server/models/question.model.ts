// server/models/question.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./category.model";

export interface IQuestion extends Document {
  text: string;
  options: string[]; // Multiple choice answers
  correctAnswer: string; // Can be an option or a key
  category: ICategory["_id"]; // Reference to any level category
  reason?: string;
  difficulty?: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    reason: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
