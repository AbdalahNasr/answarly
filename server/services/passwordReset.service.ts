// server/services/passwordReset.service.ts
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import PasswordReset from "../models/passwordReset.model";
import { User } from "../models/user.model";
import { sendEmail } from "../lib/mail";

const SALT_ROUNDS = 10;

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry
  await PasswordReset.create({ userId: user._id, token, expiresAt });

  const resetLink = `${process.env.APP_URL}/reset?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    text: `Click this link to reset your password: ${resetLink}`,
  });

  return { message: "Password reset link sent" };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const resetRecord = await PasswordReset.findOne({ token });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updateOne({ _id: resetRecord.userId }, { password: hashedPassword });
  await PasswordReset.deleteOne({ token });

  return { message: "Password reset successful" };
};