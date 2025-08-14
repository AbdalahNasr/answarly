// types/filesystem.d.ts
// TypeScript type definitions for the file system user strategy

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

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  role?: "user" | "admin";
}

export interface UserServiceInterface {
  registerUser(username: string, email: string, password: string): Promise<IUserWithoutPassword>;
  loginUser(email: string, password: string): Promise<LoginResult>;
  requestPasswordReset(email: string): Promise<PasswordResetResult>;
  resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
}

export type StorageStrategy = 'database' | 'filesystem';

// File system specific function types
export interface FileSystemUserService {
  registerUser(username: string, email: string, password: string): Promise<IUserWithoutPassword>;
  loginUser(email: string, password: string): Promise<LoginResult>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string): Promise<PasswordResetResult>;
  resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
  getAllUsers(): Promise<IUserWithoutPassword[]>;
  deleteUser(userId: string): Promise<void>;
  updateUser(userId: string, updates: Partial<Pick<IUser, 'username' | 'email' | 'role'>>): Promise<IUserWithoutPassword>;
  cleanupExpiredResets(): Promise<void>;
}

// Configuration types
export interface StorageConfig {
  strategy: StorageStrategy;
  dataDirectory?: string;
  usersFile?: string;
  passwordResetsFile?: string;
}

// Error types
export class FileSystemError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class UserNotFoundError extends FileSystemError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.code = 'USER_NOT_FOUND';
  }
}

export class EmailAlreadyExistsError extends FileSystemError {
  constructor(email: string) {
    super(`Email already exists: ${email}`);
    this.code = 'EMAIL_EXISTS';
  }
}

export class InvalidCredentialsError extends FileSystemError {
  constructor() {
    super('Invalid email or password');
    this.code = 'INVALID_CREDENTIALS';
  }
}

export class TokenExpiredError extends FileSystemError {
  constructor() {
    super('Token has expired');
    this.code = 'TOKEN_EXPIRED';
  }
}

// Utility types
export type RequiredUserFields = Pick<IUser, 'username' | 'email' | 'password'>;
export type OptionalUserFields = Partial<Pick<IUser, 'role'>>;
export type UserCreationData = RequiredUserFields & OptionalUserFields;

// API Response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;