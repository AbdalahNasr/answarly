
// lib/db.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`Connecting to MongoDB at ${MONGODB_URI}`);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Reuse the connection in development to prevent multiple connections
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI as string, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 15000, // 15 seconds
      maxPoolSize: 10,
      minPoolSize: 1,
    })
      .then((mongooseInstance) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ MongoDB connected at ${new Date().toLocaleTimeString()}`);
        }
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        // Reset the promise so we can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
