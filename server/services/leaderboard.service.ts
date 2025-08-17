import History from '../models/history.model'
import User from '../models/user.model'

/**
 * Compute leaderboard for a category.
 * Returns top N users by average score.
 */
export async function getLeaderboardByCategory(categoryId: string | null = null, limit = 20) {
  // NOTE: This implementation aggregates across all history entries.
  // If your Quiz model stores category information, add a $lookup/$match stage
  // to filter histories by quiz.category === categoryId.
  const pipeline: any[] = []

  // TODO: filter by categoryId if quizzes reference category
  // Example (if histories include quizCategory): pipeline.push({ $match: { quizCategory: categoryId } })

  pipeline.push(
    { $group: { _id: '$userId', avgScore: { $avg: '$score' }, totalScore: { $sum: '$score' }, attempts: { $sum: 1 } } },
    { $sort: { avgScore: -1, totalScore: -1 } },
    { $limit: limit }
  )

  const rows = await History.aggregate(pipeline)

  const results: Array<any> = []
  for (const r of rows) {
    const user = await User.findById(r._id).lean()
    results.push({
      userId: r._id,
      username: user?.username ?? 'Unknown',
      avgScore: r.avgScore,
      totalScore: r.totalScore,
      attempts: r.attempts,
    })
  }

  return results
}

export default { getLeaderboardByCategory }
