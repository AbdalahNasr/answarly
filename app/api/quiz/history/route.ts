import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getUserQuizHistory } from '@/server/services/quiz-session.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get current user from JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!user?.id && !user?.userId && !user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id || user.userId || user._id;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const history = await getUserQuizHistory(userId, limit);

    return NextResponse.json({
      history,
      total: history.length
    });

  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    );
  }
}

