import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest } from "next/server";

// GET - Retrieve all users
export async function GET() {
  try {
    await connectToDatabase();
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return Response.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return Response.json({
        success: false,
        message: "Name and email are required"
      }, { status: 400 });
    }

    // Create new user
    const user = await User.create({
      name,
      email
    });

    return Response.json({
      success: true,
      message: "User created successfully",
      data: user
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return Response.json({
        success: false,
        message: "Email already exists"
      }, { status: 400 });
    }

    return Response.json({
      success: false,
      message: "Failed to create user",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}