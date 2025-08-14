# File System Storage Strategy

This document explains how to use the file system storage strategy for user management in the Answarly application.

## Overview

The application now supports two storage strategies:
1. **Database Strategy** - Uses MongoDB for data persistence (original implementation)
2. **File System Strategy** - Uses JSON files for data persistence (new implementation)

## Configuration

### Environment Variables

Set the `STORAGE_STRATEGY` environment variable to choose your storage method:

```bash
# Use file system storage
STORAGE_STRATEGY=filesystem

# Use database storage (default)
STORAGE_STRATEGY=database
```

### Setting up File System Storage

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Set the storage strategy in your `.env.local` file:
   ```
   STORAGE_STRATEGY=filesystem
   ```

3. The application will automatically create a `data` directory in your project root with the following structure:
   ```
   data/
   ├── users.json
   └── password-resets.json
   ```

## Features

### File System Strategy Features

- **User Registration**: Creates new users and stores them in `users.json`
- **User Authentication**: Validates credentials against stored user data
- **Password Reset**: Manages password reset tokens in `password-resets.json`
- **User Management**: CRUD operations for user data
- **Automatic Cleanup**: Removes expired password reset tokens

### Data Structure

#### users.json
```json
[
  {
    "id": "uuid-v4-string",
    "username": "john_doe",
    "email": "john@example.com",
    "password": "hashed-password",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### password-resets.json
```json
[
  {
    "id": "uuid-v4-string",
    "userId": "user-uuid",
    "token": "reset-token-uuid",
    "expiresAt": "2024-01-01T01:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## API Usage

The API endpoints remain the same regardless of the storage strategy:

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Request Password Reset
```bash
POST /api/auth/forgot
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```bash
POST /api/auth/reset
Content-Type: application/json

{
  "token": "reset-token-uuid",
  "newPassword": "newsecurepassword"
}
```

## Additional File System Functions

When using the file system strategy, additional functions are available:

```typescript
import { 
  findUserByEmail, 
  findUserById, 
  getAllUsers, 
  deleteUser, 
  updateUser,
  cleanupExpiredResets 
} from '../server/services/user.service';

// Find user by email
const user = await findUserByEmail('john@example.com');

// Find user by ID
const user = await findUserById('user-uuid');

// Get all users (without passwords)
const users = await getAllUsers();

// Delete a user
await deleteUser('user-uuid');

// Update user information
const updatedUser = await updateUser('user-uuid', {
  username: 'new_username',
  email: 'new@example.com',
  role: 'admin'
});

// Clean up expired password reset tokens
await cleanupExpiredResets();
```

## Advantages of File System Strategy

1. **No Database Required**: Perfect for development, testing, or small applications
2. **Simple Setup**: No need to configure MongoDB or other databases
3. **Portable**: Data files can be easily backed up, moved, or version controlled
4. **Transparent**: Data is stored in human-readable JSON format
5. **Fast Development**: Quick to set up and start developing

## Limitations

1. **Concurrency**: Not suitable for high-concurrency applications
2. **Scalability**: Limited by file system performance
3. **Transactions**: No atomic operations across multiple files
4. **Querying**: Limited query capabilities compared to databases
5. **Memory Usage**: Entire datasets are loaded into memory

## Best Practices

1. **Backup**: Regularly backup your `data` directory
2. **Permissions**: Ensure proper file permissions for the `data` directory
3. **Monitoring**: Monitor file sizes and implement rotation if needed
4. **Validation**: Always validate data before writing to files
5. **Error Handling**: Implement proper error handling for file operations

## Migration

### From Database to File System

1. Export your existing user data from MongoDB
2. Convert the data to the file system format
3. Place the JSON files in the `data` directory
4. Update your environment variable

### From File System to Database

1. Set up your MongoDB connection
2. Import the JSON data into MongoDB collections
3. Update your environment variable to use database strategy

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the application has write permissions to the project directory
2. **File Not Found**: The application will create missing files automatically
3. **Invalid JSON**: Check for syntax errors in manually edited JSON files
4. **Memory Issues**: Consider database strategy for large datasets

### Debugging

Enable debug logging by setting:
```bash
DEBUG=filesystem:*
```

This will log all file system operations for troubleshooting.