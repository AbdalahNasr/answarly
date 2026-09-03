// server/models/user.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: "user" | "admin";
  provider: "credentials" | "google" | "github";
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, default: null },
    avatarUrl: { type: String, required: false, default: null, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, enum: ["credentials", "google", "github"], default: "credentials" },
    providerId: { type: String, required: false, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
