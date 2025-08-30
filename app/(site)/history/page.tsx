"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Trophy, Target, Timer, CheckCircle, XCircle, ArrowUpDown } from "lucide-react"
import { useI18n } from "@/components/i18n"
import Link from "next/link"
import GradientLoader from "@/components/gradient-loader"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

interface QuizHistoryItem {
  _id: string;
  categoryName: string;
  questionType: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  createdAt: string;
  completedAt: string;
}

export default function HistoryPage() {
  const { dict } = useI18n()
  const { toast } = useToast()
  const [history, setHistory] = useState<QuizHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuizHistory()
  }, [])

  const loadQuizHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('answerly-token')
      if (!token) {
        setError('Please log in to view your quiz history')
        return
      }

      const response = await fetch('/api/quiz/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your quiz history')
        } else if (response.status === 403) {
          throw new Error('Access denied. Please log in again.')
        } else {
          throw new Error('Failed to load quiz history')
        }
      }

      const data = await response.json()
      setHistory(data.history || [])
    } catch (err: any) {
      console.error('Error loading quiz history:', err)
      setError(err.message || 'Failed to load quiz history')
      toast({
        title: 'Error',
        description: 'Failed to load quiz history',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'medium':
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'hard':
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const columns: ColumnDef<QuizHistoryItem>[] = [
    {
      accessorKey: "categoryName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("categoryName")}</div>,
    },
    {
      accessorKey: "score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const score = row.getValue("score") as number
        return (
          <div className="flex items-center gap-2">
            {score >= 80 ? (
              <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : score >= 60 ? (
              <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <Badge className={getScoreColor(score)}>
              {Math.round(score)}%
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "correctAnswers",
      header: "Correct Answers",
      cell: ({ row }) => {
        const correct = row.getValue("correctAnswers") as number
        const total = row.getValue("totalQuestions") as number
        return (
          <div className="text-center">
            <div className="font-medium">{correct}/{total}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((correct / total) * 100)}% accuracy
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string
        return (
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "questionType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("questionType") as string
        return (
          <Badge variant="outline">
            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        )
      },
    },
    {
      accessorKey: "timeSpent",
      header: "Time",
      cell: ({ row }) => {
        const timeSpent = row.getValue("timeSpent") as number
        return (
          <div className="flex items-center gap-1">
            <Timer className="h-3 w-3 text-muted-foreground" />
            <span>{formatTime(timeSpent)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "completedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 font-semibold"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("completedAt") as string
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{formatDate(date)}</span>
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
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading quiz history...</p>
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
              {error.includes('log in') ? (
                <div className="space-y-3">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    You need to be logged in to view your quiz history.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/login">
                      <Button className="rounded-full bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500 text-white">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" className="rounded-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-4 rounded-full bg-transparent" 
                  onClick={loadQuizHistory}
                >
                  Try Again
                </Button>
              )}
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
              Quiz History
            </h1>
            <Button
              variant="outline"
              onClick={loadQuizHistory}
              className="rounded-full border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5"
            >
              <Clock className="h-4 w-4" />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {history.length === 0 ? (
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">No quiz history yet</p>
                <p className="text-sm text-zinc-500 mb-6">Take your first quiz to see your results here!</p>
                <Link href="/quiz/setup">
                  <Button className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600">
                    Start a Quiz
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Your Quiz Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and analyze your quiz performance over time
                </p>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={columns} 
                  data={history} 
                  searchKey="categoryName"
                  searchPlaceholder="Search by category..."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
