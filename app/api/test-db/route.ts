import { connectToDatabase } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    return Response.json({ 
      success: true, 
      message: "Database connected successfully!" 
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    return Response.json({ 
      success: false, 
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}