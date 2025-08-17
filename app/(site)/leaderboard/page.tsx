import React from 'react'
import Leaderboard from '@/components/leaderboard'
import LeaderboardService from '../../../server/services/leaderboard.service'

export default async function LeaderboardPage() {
  // Server-side: fetch leaderboard directly from the service to avoid client hooks
  const items = await LeaderboardService.getLeaderboardByCategory(null, 20)

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        {(!items || items.length === 0) ? (
          <div className="rounded-md p-6 bg-yellow-50 border border-yellow-200 text-yellow-800">
            No leaderboard data yet — be the first to take a quiz and show up here!
          </div>
        ) : (
          <Leaderboard items={items} />
        )}
      </div>
    </main>
  )
}
