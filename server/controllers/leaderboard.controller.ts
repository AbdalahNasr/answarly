import { NextRequest, NextResponse } from 'next/server'
import LeaderboardService from '../services/leaderboard.service'

export async function getLeaderboard(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const categoryId = url.searchParams.get('category')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    const rows = await LeaderboardService.getLeaderboardByCategory(categoryId, limit)
    return NextResponse.json({ leaderboard: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

export default { getLeaderboard }
