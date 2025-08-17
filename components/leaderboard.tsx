import React from 'react'

export default function Leaderboard({ items }: { items: Array<any> }) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <ol className="space-y-2">
        {items.map((it, idx) => (
          <li key={String(it.userId)} className="flex items-center justify-between p-3 rounded-md hover:bg-zinc-50">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">{String(idx+1)}</div>
              <div>
                <div className="font-medium">{it.username}</div>
                <div className="text-sm text-zinc-500">Attempts: {it.attempts}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{Math.round(it.avgScore)}%</div>
              <div className="text-sm text-zinc-500">Total: {it.totalScore}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
