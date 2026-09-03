// server/models/passwordReset.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface PasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetSchema = new Schema<PasswordReset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Automatically remove expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Force re-register the model to pick up schema changes during dev hot reload
if (mongoose.models.PasswordReset) {
  delete mongoose.models.PasswordReset;
}

export default mongoose.model<PasswordReset>("PasswordReset", PasswordResetSchema);