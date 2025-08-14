// scripts/test-filesystem.js
// Simple test script to demonstrate the file system user strategy

const path = require('path');
const fs = require('fs');

// Set environment variable for file system strategy
process.env.STORAGE_STRATEGY = 'filesystem';
process.env.JWT_SECRET = 'test-secret-key';

// Import the user service (this would normally be TypeScript)
// For this demo, we'll simulate the functionality

async function testFileSystemStrategy() {
  console.log('🚀 Testing File System User Strategy\n');

  try {
    // Simulate user registration
    console.log('1. Testing User Registration...');
    const userData = {
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
    const dataDir = path.join(process.cwd(), 'data');
    console.log('4. Checking Data Directory...');
    console.log(`   Data directory path: ${dataDir}`);
    
    if (fs.existsSync(dataDir)) {
      console.log('   ✅ Data directory exists');
      
      const usersFile = path.join(dataDir, 'users.json');
      const resetsFile = path.join(dataDir, 'password-resets.json');
      
      if (fs.existsSync(usersFile)) {
        console.log('   ✅ users.json exists');
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
        console.log(`   📊 Current users count: ${users.length}`);
      } else {
        console.log('   ℹ️  users.json will be created on first user registration');
      }
      
      if (fs.existsSync(resetsFile)) {
        console.log('   ✅ password-resets.json exists');
        const resets = JSON.parse(fs.readFileSync(resetsFile, 'utf-8'));
        console.log(`   📊 Current password resets count: ${resets.length}`);
      } else {
        console.log('   ℹ️  password-resets.json will be created on first reset request');
      }
    } else {
      console.log('   ℹ️  Data directory will be created automatically when needed');
    }

    console.log('\n🎉 File System Strategy Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Set STORAGE_STRATEGY=filesystem in your .env.local file');
    console.log('   2. Start your Next.js application');
    console.log('   3. Register a new user via the API');
    console.log('   4. Check the data/ directory for JSON files');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFileSystemStrategy();