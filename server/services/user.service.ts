// server/services/user.service.ts
import { getStorageStrategy } from '../config/storage.config';

// Import both strategies
import * as DatabaseUserService from './auth.service';
import * as FileSystemUserService from './user.filesystem.service';

// Define common interface
export interface UserServiceInterface {
  registerUser: (username: string, email: string, password: string, avatarUrl?: string) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
}

// Strategy pattern implementation
class UserService implements UserServiceInterface {
  private strategy: UserServiceInterface;

  constructor() {
    const storageStrategy = getStorageStrategy();
    
    if (storageStrategy === 'filesystem') {
      this.strategy = {
        registerUser: FileSystemUserService.registerUser,
        loginUser: FileSystemUserService.loginUser,
        requestPasswordReset: FileSystemUserService.requestPasswordReset,
        resetPassword: FileSystemUserService.resetPassword,
      };
    } else {
      this.strategy = {
        registerUser: DatabaseUserService.registerUser,
        loginUser: DatabaseUserService.loginUser,
        requestPasswordReset: DatabaseUserService.requestPasswordReset,
        resetPassword: DatabaseUserService.resetPassword,
      };
    }
  }

  async registerUser(username: string, email: string, password: string, avatarUrl?: string) {
    return this.strategy.registerUser(username, email, password, avatarUrl);
  }

  async loginUser(email: string, password: string) {
    return this.strategy.loginUser(email, password);
  }

  async requestPasswordReset(email: string) {
    return this.strategy.requestPasswordReset(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return this.strategy.resetPassword(token, newPassword);
  }
}

// Export singleton instance
export const userService = new UserService();

// Export individual functions for backward compatibility
export const registerUser = (username: string, email: string, password: string, avatarUrl?: string) => 
  userService.registerUser(username, email, password, avatarUrl);

export const loginUser = (email: string, password: string) => 
  userService.loginUser(email, password);

export const requestPasswordReset = (email: string) => 
  userService.requestPasswordReset(email);

export const resetPassword = (token: string, newPassword: string) => 
  userService.resetPassword(token, newPassword);

// Additional file system specific functions (only available when using filesystem strategy)
export const findUserByEmail = (email: string) => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.findUserByEmail(email);
  }
  throw new Error('findUserByEmail is only available with filesystem strategy');
};

export const findUserById = (id: string) => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.findUserById(id);
  }
  throw new Error('findUserById is only available with filesystem strategy');
};

export const getAllUsers = () => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.getAllUsers();
  }
  throw new Error('getAllUsers is only available with filesystem strategy');
};

export const deleteUser = (userId: string) => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.deleteUser(userId);
  }
  throw new Error('deleteUser is only available with filesystem strategy');
};

export const updateUser = (userId: string, updates: any) => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.updateUser(userId, updates);
  }
  throw new Error('updateUser is only available with filesystem strategy');
};

export const cleanupExpiredResets = () => {
  if (getStorageStrategy() === 'filesystem') {
    return FileSystemUserService.cleanupExpiredResets();
  }
  throw new Error('cleanupExpiredResets is only available with filesystem strategy');
};