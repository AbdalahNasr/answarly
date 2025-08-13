import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PasswordResetToken } from '../models/PasswordResetToken'; // You’ll need to create this
import crypto from 'crypto';

export class AuthService {
  async register(userData: { email: string; password: string; name: string }) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({ ...userData, password: hashedPassword });

    return user;
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    return { token, user };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await PasswordResetToken.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Send resetToken via email (not hashed!)
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({ token: hashedToken });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new Error('Token is invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(resetRecord.userId, { password: hashedPassword });

    await PasswordResetToken.deleteOne({ token: hashedToken });
    return true;
  }
}
