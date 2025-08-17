import { NextRequest } from 'next/server'
import * as LeaderboardController from '../../../server/controllers/leaderboard.controller'

export async function GET(req: NextRequest) {
  return LeaderboardController.getLeaderboard(req)
}
