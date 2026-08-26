// server/services/passwordReset.service.ts
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import PasswordReset from "../models/passwordReset.model";
import { User } from "../models/user.model";
import { sendEmail, buildCodeEmailHtml, buildLinkEmailHtml } from "../lib/mail";
import { connectToDatabase } from "@/lib/db";

const SALT_ROUNDS = 10;

/**
 * Generate a 6-digit numeric verification code.
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const requestPasswordReset = async (email: string, method: "code" | "link" = "code") => {
  await connectToDatabase();

  console.log(`[password-reset] Looking up email: "${email}", method: "${method}"`);
  const user = await User.findOne({ email });

  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return { message: "If that email exists, a reset email has been sent." };
  }

  // Remove any previous reset tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  const token = uuidv4();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

  await PasswordReset.create({ userId: user._id, token, code, expiresAt });

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset?token=${token}`;

  // Log to console for dev/testing
  console.log(`[password-reset] Code: ${code} | Token: ${token.substring(0, 8)}...`);

  // Send the appropriate email based on method
  const isLink = method === "link";
  const html = isLink ? buildLinkEmailHtml(resetLink) : buildCodeEmailHtml(code);
  const subject = isLink ? "Answerly — Reset Your Password" : "Answerly — Your Verification Code";
  const text = isLink
    ? `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
    : `Your Answerly verification code is: ${code}\n\nThis code expires in 1 hour.`;

  try {
    await sendEmail({ to: email, subject, text, html });
    console.log(`[password-reset] ✅ ${isLink ? "Link" : "Code"} email sent to ${email}`);
  } catch (emailErr: any) {
    console.error(`[password-reset] ❌ Email failed:`, emailErr?.message || emailErr);
  }

  return { message: "If that email exists, a reset email has been sent." };
};

export const resetPassword = async (token: string, newPassword: string) => {
  await connectToDatabase();

  const resetRecord = await PasswordReset.findOne({ token });
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updateOne({ _id: resetRecord.userId }, { password: hashedPassword });
  await PasswordReset.deleteOne({ _id: resetRecord._id });

  return { message: "Password reset successful" };
};

/**
 * Verify a 6-digit code and return the associated token for resetting.
 */
export const verifyResetCode = async (email: string, code: string) => {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid code");
  }

  const resetRecord = await PasswordReset.findOne({
    userId: user._id,
    code: code.trim(),
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new Error("Invalid or expired code");
  }

  return { token: resetRecord.token, message: "Code verified" };
};