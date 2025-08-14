// scripts/test-filesystem.ts
// TypeScript test script to demonstrate the file system user strategy

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Set environment variable for file system strategy
process.env.STORAGE_STRATEGY = 'filesystem';
process.env.JWT_SECRET = 'test-secret-key';

interface TestUser {
  username: string;
  email: string;
  password: string;
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

interface PasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

async function testFileSystemStrategy(): Promise<void> {
  console.log('🚀 Testing File System User Strategy (TypeScript)\n');

  try {
    // Simulate user registration
    console.log('1. Testing User Registration...');
    const userData: TestUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    console.log(`   Registering user: ${userData.email}`);
    console.log('   ✅ User registration would create entry in data/users.json\n');

    // Simulate user login
    console.log('2. Testing User Login...');
    console.log(`   Logging in user: ${userData.email}`);
    console.log('   ✅ User login would validate against data/users.json\n');

    // Simulate password reset request
    console.log('3. Testing Password Reset Request...');
    console.log(`   Requesting password reset for: ${userData.email}`);
    console.log('   ✅ Password reset token would be stored in data/password-resets.json\n');

    // Check if data directory exists
    const dataDir: string = path.join(process.cwd(), 'data');
    console.log('4. Checking Data Directory...');
    console.log(`   Data directory path: ${dataDir}`);
    
    if (fs.existsSync(dataDir)) {
      console.log('   ✅ Data directory exists');
      
      const usersFile: string = path.join(dataDir, 'users.json');
      const resetsFile: string = path.join(dataDir, 'password-resets.json');
      
      if (fs.existsSync(usersFile)) {
        console.log('   ✅ users.json exists');
        const usersData: string = fs.readFileSync(usersFile, 'utf-8');
        const users: StoredUser[] = JSON.parse(usersData);
        console.log(`   📊 Current users count: ${users.length}`);
        
        if (users.length > 0) {
          console.log('   👥 Sample user data structure:');
          const sampleUser = { ...users[0] };
          sampleUser.password = '[HASHED]'; // Hide password in output
          console.log('   ', JSON.stringify(sampleUser, null, 6));
        }
      } else {
        console.log('   ℹ️  users.json will be created on first user registration');
      }
      
      if (fs.existsSync(resetsFile)) {
        console.log('   ✅ password-resets.json exists');
        const resetsData: string = fs.readFileSync(resetsFile, 'utf-8');
        const resets: PasswordReset[] = JSON.parse(resetsData);
        console.log(`   📊 Current password resets count: ${resets.length}`);
        
        if (resets.length > 0) {
          console.log('   🔑 Sample reset token structure:');
          console.log('   ', JSON.stringify(resets[0], null, 6));
        }
      } else {
        console.log('   ℹ️  password-resets.json will be created on first reset request');
      }
    } else {
      console.log('   ℹ️  Data directory will be created automatically when needed');
    }

    // Test TypeScript compilation
    console.log('\n5. TypeScript Configuration Check...');
    const tsConfigPath: string = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      console.log('   ✅ tsconfig.json found');
    } else {
      console.log('   ⚠️  tsconfig.json not found - ensure TypeScript is properly configured');
    }

    // Check for required dependencies
    console.log('\n6. Dependencies Check...');
    const packageJsonPath: string = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageData: string = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageData);
      
      const requiredDeps = ['bcrypt', 'jsonwebtoken', 'uuid'];
      const requiredDevDeps = ['@types/bcrypt', '@types/jsonwebtoken', '@types/uuid'];
      
      console.log('   Required dependencies:');
      requiredDeps.forEach(dep => {
        const hasDepency = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        console.log(`   ${hasDepency ? '✅' : '❌'} ${dep}`);
      });
      
      console.log('   Required TypeScript types:');
      requiredDevDeps.forEach(dep => {
        const hasDepency = packageJson.devDependencies?.[dep];
        console.log(`   ${hasDepency ? '✅' : '❌'} ${dep}`);
      });
    }

    console.log('\n🎉 File System Strategy Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Set STORAGE_STRATEGY=filesystem in your .env.local file');
    console.log('   2. Ensure all TypeScript dependencies are installed');
    console.log('   3. Start your Next.js application with: npm run dev');
    console.log('   4. Register a new user via the API');
    console.log('   5. Check the data/ directory for JSON files');
    console.log('\n🔧 TypeScript Usage:');
    console.log('   import { userService } from "../server/services/user.service";');
    console.log('   const user = await userService.registerUser("username", "email", "password");');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFileSystemStrategy().catch((error: any) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});