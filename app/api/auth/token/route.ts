// Generate JWT token from NextAuth session
import { getServerSession } from "next-auth/next";
import jwt from "jsonwebtoken";
import { authOptions } from "../[...nextauth]/route";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    const user = session.user as any;

    // Generate JWT token matching the format used for email/password auth
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return Response.json({ token });
  } catch (error) {
    console.error("[auth/token] Error generating token:", error);
    return Response.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
