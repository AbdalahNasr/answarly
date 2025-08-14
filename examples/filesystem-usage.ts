// examples/filesystem-usage.ts
// TypeScript example showing how to use the file system user strategy

import { 
  userService,
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  findUserByEmail,
  findUserById,
  getAllUsers,
  deleteUser,
  updateUser,
  cleanupExpiredResets
} from '../server/services/user.service';

// Set environment for file system strategy
process.env.STORAGE_STRATEGY = 'filesystem';
process.env.JWT_SECRET = 'your-secret-key';

interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
}

interface UserLoginData {
  email: string;
  password: string;
}

interface UserUpdateData {
  username?: string;
  email?: string;
  role?: 'user' | 'admin';
}

async function demonstrateFileSystemUsage(): Promise<void> {
  console.log('🚀 TypeScript File System User Strategy Demo\n');

  try {
    // 1. User Registration
    console.log('1. User Registration');
    const newUserData: UserRegistrationData = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const registeredUser = await registerUser(
      newUserData.username,
      newUserData.email,
      newUserData.password
    );
    console.log('✅ User registered:', registeredUser);

    // 2. User Login
    console.log('\n2. User Login');
    const loginData: UserLoginData = {
      email: 'john@example.com',
      password: 'securePassword123'
    };

    const loginResult = await loginUser(loginData.email, loginData.password);
    console.log('✅ User logged in:', {
      token: loginResult.token.substring(0, 20) + '...',
      user: loginResult.user
    });

    // 3. Find User by Email
    console.log('\n3. Find User by Email');
    const foundUser = await findUserByEmail('john@example.com');
    if (foundUser) {
      console.log('✅ User found:', {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role
      });
    }

    // 4. Find User by ID
    console.log('\n4. Find User by ID');
    if (foundUser) {
      const userById = await findUserById(foundUser.id);
      console.log('✅ User found by ID:', userById ? 'Yes' : 'No');
    }

    // 5. Get All Users
    console.log('\n5. Get All Users');
    const allUsers = await getAllUsers();
    console.log('✅ Total users:', allUsers.length);
    console.log('Users:', allUsers.map(u => ({ id: u.id, username: u.username, email: u.email })));

    // 6. Update User
    console.log('\n6. Update User');
    if (foundUser) {
      const updateData: UserUpdateData = {
        username: 'johnsmith',
        role: 'admin'
      };

      const updatedUser = await updateUser(foundUser.id, updateData);
      console.log('✅ User updated:', updatedUser);
    }

    // 7. Password Reset Request
    console.log('\n7. Password Reset Request');
    const resetResult = await requestPasswordReset('john@example.com');
    console.log('✅ Password reset requested:', resetResult);

    // 8. Cleanup Expired Resets
    console.log('\n8. Cleanup Expired Resets');
    await cleanupExpiredResets();
    console.log('✅ Expired resets cleaned up');

    // 9. Using the Service Class Directly
    console.log('\n9. Using Service Class');
    const serviceResult = await userService.loginUser('john@example.com', 'securePassword123');
    console.log('✅ Service class login:', {
      hasToken: !!serviceResult.token,
      user: serviceResult.user
    });

    console.log('\n🎉 Demo completed successfully!');

  } catch (error: any) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Type-safe API endpoint example
interface ApiRequest {
  json(): Promise<any>;
}

interface ApiResponse {
  json(data: any, options?: { status: number }): any;
}

// Example API endpoint using TypeScript
export async function handleUserRegistration(req: ApiRequest): Promise<ApiResponse> {
  try {
    const { username, email, password }: UserRegistrationData = await req.json();
    
    // Type validation
    if (!username || !email || !password) {
      throw new Error('Missing required fields');
    }

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid field types');
    }

    const user = await registerUser(username, email, password);
    
    return {
      json: (data: any, options?: { status: number }) => ({
        message: "User registered successfully",
        user: data,
        status: options?.status || 201
      })
    } as ApiResponse;

  } catch (error: any) {
    return {
      json: (data: any, options?: { status: number }) => ({
        error: error.message,
        status: options?.status || 400
      })
    } as ApiResponse;
  }
}

// Export types for use in other files
export type {
  UserRegistrationData,
  UserLoginData,
  UserUpdateData
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateFileSystemUsage().catch(console.error);
}