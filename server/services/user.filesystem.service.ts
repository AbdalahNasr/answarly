// server/services/user.filesystem.service.ts
import fs from 'fs/promises';
import path from 'path';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS: number = 10;

// Define the data directory
const DATA_DIR: string = path.join(process.cwd(), 'data');
const USERS_FILE: string = path.join(DATA_DIR, 'users.json');
const PASSWORD_RESETS_FILE: string = path.join(DATA_DIR, 'password-resets.json');

// TypeScript interfaces
export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface IUserWithoutPassword {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface IPasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };
}

export interface PasswordResetResult {
  message: string;
}

// Custom error classes for better TypeScript error handling
export class FileSystemUserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FileSystemUserError';
  }
}

export class UserNotFoundError extends FileSystemUserError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`, 'USER_NOT_FOUND');
  }
}

export class EmailAlreadyExistsError extends FileSystemUserError {
  constructor(email: string) {
    super(`Email already exists: ${email}`, 'EMAIL_EXISTS');
  }
}

export class InvalidCredentialsError extends FileSystemUserError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class TokenExpiredError extends FileSystemUserError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

// Utility functions for file operations
const ensureDataDirectory = async (): Promise<void> => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

const readUsersFile = async (): Promise<IUser[]> => {
  try {
    await ensureDataDirectory();
    const data: string = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data) as IUser[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new FileSystemUserError(`Failed to read users file: ${error.message}`);
  }
};

const writeUsersFile = async (users: IUser[]): Promise<void> => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to write users file: ${error.message}`);
  }
};

const readPasswordResetsFile = async (): Promise<IPasswordReset[]> => {
  try {
    await ensureDataDirectory();
    const data: string = await fs.readFile(PASSWORD_RESETS_FILE, 'utf-8');
    return JSON.parse(data) as IPasswordReset[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw new FileSystemUserError(`Failed to read password resets file: ${error.message}`);
  }
};

const writePasswordResetsFile = async (resets: IPasswordReset[]): Promise<void> => {
  try {
    await ensureDataDirectory();
    await fs.writeFile(PASSWORD_RESETS_FILE, JSON.stringify(resets, null, 2));
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to write password resets file: ${error.message}`);
  }
};

// User service functions with proper TypeScript types
export const registerUser = async (
  username: string, 
  email: string, 
  password: string
): Promise<IUserWithoutPassword> => {
  try {
    // Input validation
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      throw new FileSystemUserError('All fields are required');
    }

    const users: IUser[] = await readUsersFile();
    
    // Check if user already exists
    const existingUser: IUser | undefined = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      throw new EmailAlreadyExistsError(email);
    }

    // Create new user
    const hashedPassword: string = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser: IUser = {
      id: uuidv4(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsersFile(users);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Registration failed: ${error.message}`);
  }
};

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  try {
    // Input validation
    if (!email?.trim() || !password?.trim()) {
      throw new InvalidCredentialsError();
    }

    const users: IUser[] = await readUsersFile();
    const user: IUser | undefined = users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    const token: string = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    return { 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    };
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Login failed: ${error.message}`);
  }
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    if (!email?.trim()) {
      return null;
    }

    const users: IUser[] = await readUsersFile();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to find user by email: ${error.message}`);
  }
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  try {
    if (!id?.trim()) {
      return null;
    }

    const users: IUser[] = await readUsersFile();
    return users.find(user => user.id === id) || null;
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to find user by ID: ${error.message}`);
  }
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  try {
    if (!userId?.trim() || !newPassword?.trim()) {
      throw new FileSystemUserError('User ID and new password are required');
    }

    const users: IUser[] = await readUsersFile();
    const userIndex: number = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new UserNotFoundError(userId);
    }

    const hashedPassword: string = await bcrypt.hash(newPassword, SALT_ROUNDS);
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    await writeUsersFile(users);
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Failed to update password: ${error.message}`);
  }
};

export const requestPasswordReset = async (email: string): Promise<PasswordResetResult> => {
  try {
    if (!email?.trim()) {
      throw new FileSystemUserError('Email is required');
    }

    const user: IUser | null = await findUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError(email);
    }

    const resets: IPasswordReset[] = await readPasswordResetsFile();
    const token: string = uuidv4();
    const expiresAt: string = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry
    
    const newReset: IPasswordReset = {
      id: uuidv4(),
      userId: user.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    // Remove any existing resets for this user
    const filteredResets: IPasswordReset[] = resets.filter(reset => reset.userId !== user.id);
    filteredResets.push(newReset);
    
    await writePasswordResetsFile(filteredResets);

    // In a real application, you would send an email here
    const resetLink: string = `${process.env.APP_URL || 'http://localhost:3000'}/reset?token=${token}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return { message: "Password reset link sent" };
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Failed to request password reset: ${error.message}`);
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<PasswordResetResult> => {
  try {
    if (!token?.trim() || !newPassword?.trim()) {
      throw new FileSystemUserError('Token and new password are required');
    }

    const resets: IPasswordReset[] = await readPasswordResetsFile();
    const resetRecord: IPasswordReset | undefined = resets.find(reset => reset.token === token);
    
    if (!resetRecord || new Date(resetRecord.expiresAt) < new Date()) {
      throw new TokenExpiredError();
    }

    await updateUserPassword(resetRecord.userId, newPassword);
    
    // Remove the used reset token
    const filteredResets: IPasswordReset[] = resets.filter(reset => reset.token !== token);
    await writePasswordResetsFile(filteredResets);

    return { message: "Password reset successful" };
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Failed to reset password: ${error.message}`);
  }
};

export const getAllUsers = async (): Promise<IUserWithoutPassword[]> => {
  try {
    const users: IUser[] = await readUsersFile();
    return users.map(({ password, ...user }) => user);
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to get all users: ${error.message}`);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    if (!userId?.trim()) {
      throw new FileSystemUserError('User ID is required');
    }

    const users: IUser[] = await readUsersFile();
    const filteredUsers: IUser[] = users.filter(user => user.id !== userId);
    
    if (users.length === filteredUsers.length) {
      throw new UserNotFoundError(userId);
    }
    
    await writeUsersFile(filteredUsers);
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Failed to delete user: ${error.message}`);
  }
};

export const updateUser = async (
  userId: string, 
  updates: Partial<Pick<IUser, 'username' | 'email' | 'role'>>
): Promise<IUserWithoutPassword> => {
  try {
    if (!userId?.trim()) {
      throw new FileSystemUserError('User ID is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new FileSystemUserError('Updates are required');
    }

    const users: IUser[] = await readUsersFile();
    const userIndex: number = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new UserNotFoundError(userId);
    }

    // Check if email is being updated and if it already exists
    if (updates.email) {
      const emailExists: boolean = users.some(user => 
        user.email.toLowerCase() === updates.email!.toLowerCase() && user.id !== userId
      );
      if (emailExists) {
        throw new EmailAlreadyExistsError(updates.email);
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      email: updates.email ? updates.email.toLowerCase().trim() : users[userIndex].email,
      username: updates.username ? updates.username.trim() : users[userIndex].username,
      updatedAt: new Date().toISOString()
    };

    await writeUsersFile(users);

    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  } catch (error: any) {
    if (error instanceof FileSystemUserError) {
      throw error;
    }
    throw new FileSystemUserError(`Failed to update user: ${error.message}`);
  }
};

// Cleanup expired password reset tokens
export const cleanupExpiredResets = async (): Promise<void> => {
  try {
    const resets: IPasswordReset[] = await readPasswordResetsFile();
    const now: Date = new Date();
    const validResets: IPasswordReset[] = resets.filter(reset => new Date(reset.expiresAt) > now);
    
    if (validResets.length !== resets.length) {
      await writePasswordResetsFile(validResets);
      console.log(`Cleaned up ${resets.length - validResets.length} expired password reset tokens`);
    }
  } catch (error: any) {
    throw new FileSystemUserError(`Failed to cleanup expired resets: ${error.message}`);
  }
};

// Export types for external use
export type { IUser, IUserWithoutPassword, IPasswordReset, LoginResult, PasswordResetResult };