import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getLeaderboard, getUserLeaderboardPosition } from '@/server/services/quiz-session.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeUserPosition = searchParams.get('includeUserPosition') === 'true';
    
    // Get leaderboard
    const leaderboard = await getLeaderboard(limit);
    
    let userPosition = null;
    
    // Get current user position if requested
    if (includeUserPosition) {
      const token = request.headers.get("authorization")?.replace("Bearer ", "");
      if (token) {
        try {
          const user = jwt.verify(token, JWT_SECRET) as any;
          if (user?.id || user?.userId || user?._id) {
            const userId = user.id || user.userId || user._id;
            userPosition = await getUserLeaderboardPosition(userId);
          }
        } catch (error) {
          // Token invalid, continue without user position
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      userPosition,
      total: leaderboard.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

