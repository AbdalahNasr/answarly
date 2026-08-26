// server/services/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User, IUser } from "../models/user.model";
import { sendEmail } from "../lib/mail";
import PasswordReset from "../models/passwordReset.model";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export const registerUser = async (username: string, email: string, password: string, avatarUrl?: string) => {
  try {
    console.log('[auth.service] registerUser: checking existing', { email });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword, avatarUrl, role: "user" });
    await user.save();
    console.log('[auth.service] registerUser: saved user', { id: user._id, email: user.email });

    // Generate JWT token for automatic login
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    };
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Email already exists");
    }
    console.error('[auth.service] registerUser: error', error && (error.stack || error.message || error));
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  console.log('[auth.service] loginUser: find user', { email });
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    }
  };
};

// Delegate to the dedicated password reset service (has 6-digit code, HTML email, etc.)
export { requestPasswordReset, resetPassword } from "./passwordReset.service";