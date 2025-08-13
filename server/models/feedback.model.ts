import mongoose, { Schema, Document } from "mongoose";

export interface Feedback extends Document {
  userId: mongoose.Types.ObjectId; // The user giving feedback
  quizId: mongoose.Types.ObjectId; // The quiz the feedback is about
  rating: number;                   // Rating (e.g., 1-5 stars)
  comment?: string;                  // Optional feedback text
  createdAt: Date;                   // When the feedback was given
}

const FeedbackSchema: Schema<Feedback> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<Feedback>("Feedback", FeedbackSchema);
