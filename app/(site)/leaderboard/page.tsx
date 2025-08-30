"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Target, ArrowUpDown } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import GradientLoader from "@/components/gradient-loader"
import { Button } from "@/components/ui/button"

interface LeaderboardItem {
  userId: string
  username: string
  attempts: number
  avgScore: number
  totalScore: number
  rank?: number
}

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/quiz/leaderboard')
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard')
      }

      const data = await response.json()
      // Add rank to each item
      const itemsWithRank = data.leaderboard.map((item: LeaderboardItem, index: number) => ({
        ...item,
        rank: index + 1
      }))
      setItems(itemsWithRank)
    } catch (err: any) {
      console.error('Error loading leaderboard:', err)
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    if (rank === 2) return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    if (rank === 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }

  const columns: ColumnDef<LeaderboardItem>[] = [
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => {
        const rank = row.getValue("rank") as number
        return (
          <div className="flex items-center gap-2">
            {getRankIcon(rank)}
            <Badge className={getRankColor(rank)}>
              #{rank}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Username
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
    },
    {
      accessorKey: "avgScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Average Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const score = row.getValue("avgScore") as number
        return (
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Badge className={getScoreColor(score)}>
              {Math.round(score)}%
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "attempts",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Attempts
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const attempts = row.getValue("attempts") as number
        return (
          <div className="text-center">
            <div className="font-medium">{attempts}</div>
            <div className="text-xs text-muted-foreground">
              {attempts === 1 ? 'quiz' : 'quizzes'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "totalScore",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Total Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const totalScore = row.getValue("totalScore") as number
        return (
          <div className="text-right">
            <div className="font-semibold">{Math.round(totalScore)}</div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <GradientLoader size={24} />
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading leaderboard...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-full bg-transparent" 
                onClick={loadLeaderboard}
              >
                Try Again
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Leaderboard
            </h1>
            <Button
              variant="outline"
              onClick={loadLeaderboard}
              className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
            >
              <Trophy className="h-4 w-4" />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {(!items || items.length === 0) ? (
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">No leaderboard data yet</p>
                <p className="text-sm text-zinc-500">
                  Be the first to take a quiz and show up here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Global Leaderboard</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Top performers based on average quiz scores
                </p>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={columns} 
                  data={items} 
                  searchKey="username"
                  searchPlaceholder="Search by username..."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
