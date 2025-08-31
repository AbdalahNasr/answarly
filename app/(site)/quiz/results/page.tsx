"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  Share2, 
  Download, 
  Copy, 
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  Check
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuizResult {
  questionId: string
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
}

interface QuizSummary {
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number
  category: string
  difficulty: string
  questionType: string
}

export default function QuizResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [results, setResults] = useState<QuizResult[]>([])
  const [summary, setSummary] = useState<QuizSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get results from URL parameters or localStorage
    const resultsParam = searchParams.get('results')
    if (resultsParam) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsParam))
        setResults(parsedResults.results || [])
        setSummary(parsedResults.summary || null)
      } catch (error) {
        console.error('Error parsing results:', error)
        // Fallback to localStorage
        loadResultsFromStorage()
      }
    } else {
      loadResultsFromStorage()
    }
    setLoading(false)
  }, [searchParams])

  const loadResultsFromStorage = () => {
    try {
      const storedResults = localStorage.getItem('quizResults')
      if (storedResults) {
        const parsed = JSON.parse(storedResults)
        setResults(parsed.results || [])
        setSummary(parsed.summary || null)
      }
    } catch (error) {
      console.error('Error loading results from storage:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    if (score >= 80) return { text: "Great", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" }
    if (score >= 70) return { text: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }
    if (score >= 60) return { text: "Fair", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
  }

  const shareResults = async () => {
    setSharing(true)
    try {
      const shareData = {
        title: `Quiz Results - ${summary?.category}`,
        text: `I scored ${summary?.score}% on the ${summary?.category} quiz!`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying to clipboard
        await copyToClipboard(window.location.href)
        toast.success("Results link copied to clipboard!")
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error("Failed to share results")
    } finally {
      setSharing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Try to use the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)
          return successful
        } catch (err) {
          document.body.removeChild(textArea)
          throw err
        }
      }
    } catch (error) {
      console.error('Copy failed:', error)
      throw error
    }
  }

  const copyResultsLink = async () => {
    try {
      await copyToClipboard(window.location.href)
      setCopied(true)
      toast.success("Results link copied to clipboard!")
      
      // Reset the copied status after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error("Failed to copy link. Please copy manually from the address bar.")
    }
  }

  const downloadPDF = () => {
    // Create a simple text-based report for now
    const report = generateTextReport()
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${summary?.category}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Results downloaded!")
  }

  const generateTextReport = () => {
    if (!summary) return "No results available"
    
    let report = `QUIZ RESULTS REPORT\n`
    report += `==================\n\n`
    report += `Category: ${summary.category}\n`
    report += `Difficulty: ${summary.difficulty}\n`
    report += `Question Type: ${summary.questionType}\n`
    report += `Total Questions: ${summary.totalQuestions}\n`
    report += `Correct Answers: ${summary.correctAnswers}\n`
    report += `Score: ${summary.score}%\n`
    report += `Time Spent: ${Math.round(summary.timeSpent / 60)} minutes\n\n`
    
    if (results.length > 0) {
      report += `DETAILED RESULTS\n`
      report += `================\n\n`
      
      results.forEach((result, index) => {
        report += `Question ${index + 1}:\n`
        report += `Question: ${result.questionText}\n`
        report += `Your Answer: ${result.userAnswer}\n`
        report += `Correct Answer: ${result.correctAnswer}\n`
        report += `Result: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}\n`
        if (result.explanation) {
          report += `Explanation: ${result.explanation}\n`
        }
        report += `\n`
      })
    } else {
      report += `Note: Detailed question-by-question results are not available for this quiz.\n`
    }
    
    return report
  }

  if (loading) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading results...</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!summary) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                No Results Found
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                It looks like there are no quiz results to display.
              </p>
              <Link href="/quiz/setup">
                <Button className="rounded-full">
                  Take a New Quiz
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  // Check if we have detailed results or just summary
  const hasDetailedResults = results.length > 0
  const scoreBadge = getScoreBadge(summary.score)

  return (
    <main>
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Quiz Results
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {summary.category} • {summary.difficulty} • {summary.questionType}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/history">
                <Button variant="outline" className="rounded-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 mb-8">
            <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
            <CardHeader className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Your Score
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-4xl font-bold ${getScoreColor(summary.score)}`}>
                      {summary.score}%
                    </span>
                    <Badge className={scoreBadge.color}>
                      {scoreBadge.text}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {summary.correctAnswers}/{summary.totalQuestions}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Correct</div>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(summary.timeSpent / 60)}m
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Time</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={shareResults}
                  disabled={sharing}
                  variant="outline"
                  className="rounded-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {sharing ? "Sharing..." : "Share Results"}
                </Button>
                <Button
                  onClick={copyResultsLink}
                  variant={copied ? "default" : "outline"}
                  className={`rounded-full transition-all duration-200 ${
                    copied 
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white dark:border-green-600" 
                      : "border-zinc-300 dark:border-zinc-600 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  className="rounded-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Show detailed results only if available */}
          {hasDetailedResults ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Detailed Results
              </h2>
              
              {results.map((result, index) => (
                <Card key={result.questionId} className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
                  <CardContent className="relative p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {result.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Question {index + 1}
                          </span>
                          <Badge variant={result.isCorrect ? "default" : "destructive"}>
                            {result.isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-50 mb-2">
                            {result.questionText}
                          </h3>
                          
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-600 dark:text-zinc-400">Your answer:</span>
                              <span className="font-medium">{result.userAnswer}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-600 dark:text-zinc-400">Correct answer:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {result.correctAnswer}
                              </span>
                            </div>
                            
                            {result.explanation && (
                              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="text-sm text-blue-700 dark:text-blue-300">
                                  <strong>Explanation:</strong> {result.explanation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardContent className="relative p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Summary View
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    This is a summary of your quiz performance. Detailed question-by-question results are only available immediately after completing a quiz.
                  </p>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {summary.correctAnswers}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Correct Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {summary.totalQuestions - summary.correctAnswers}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">Incorrect Answers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
