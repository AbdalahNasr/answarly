"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash, Filter, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Question {
  _id: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'code_snippet' | 'open_ended'
  difficulty: 'easy' | 'medium' | 'hard'
  options?: string[]
  correctAnswer?: string
  category: {
    _id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  _id: string
  name: string
  description?: string
}

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editForm, setEditForm] = useState({
    text: '',
    type: 'multiple_choice' as Question['type'],
    difficulty: 'easy' as Question['difficulty'],
    options: ['', '', '', ''],
    correctAnswer: '',
    category: '',
    reason: ''
  })
  
  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('answerly-token')
    if (!token) {
      router.push('/login')
      return
    }
    
    loadQuestions()
    loadCategories()
  }, [router])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('answerly-token')
      if (!token) {
        toast({ title: 'Error', description: 'Please log in to view your questions', variant: 'destructive' })
        return
      }

      const response = await fetch('/api/questions?myQuestions=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setQuestions(data.questions || [])
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to load questions', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load questions', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || question.category._id === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty
    const matchesType = selectedType === 'all' || question.type === selectedType
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType
  })

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setEditForm({
      text: question.text,
      type: question.type,
      difficulty: question.difficulty,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      category: question.category._id,
      reason: ''
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingQuestion) return
    
    try {
      const token = localStorage.getItem('answerly-token')
      if (!token) {
        toast({ title: 'Error', description: 'Please log in to edit questions', variant: 'destructive' })
        return
      }

      const response = await fetch(`/api/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })
      
      const data = await response.json()
      if (response.ok) {
        toast({ title: 'Success', description: 'Question updated successfully' })
        setEditModalOpen(false)
        loadQuestions() // Reload questions
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to update question', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update question', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingQuestion) return
    
    try {
      const token = localStorage.getItem('answerly-token')
      if (!token) {
        toast({ title: 'Error', description: 'Please log in to delete questions', variant: 'destructive' })
        return
      }

      const response = await fetch(`/api/questions/${deletingQuestion._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast({ title: 'Success', description: 'Question deleted successfully' })
        setDeleteModalOpen(false)
        loadQuestions() // Reload questions
      } else {
        const data = await response.json()
        toast({ title: 'Error', description: data.message || 'Failed to delete question', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete question', variant: 'destructive' })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'true_false': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'code_snippet': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'open_ended': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <main className="p-6 bg-gradient-to-b from-indigo-50/30 via-white to-white dark:from-black dark:via-slate-900 min-h-[70vh]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">My Questions</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and organize your created questions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{questions.length}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {questions.filter(q => q.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Easy</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {questions.filter(q => q.difficulty === 'medium').length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Medium</div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {questions.filter(q => q.difficulty === 'hard').length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Hard</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Difficulty</Label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="code_snippet">Code Snippet</SelectItem>
                    <SelectItem value="open_ended">Open Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
              <CardContent className="p-8 text-center">
                <div className="text-zinc-500 dark:text-zinc-400 mb-4">
                  {questions.length === 0 ? (
                    <>
                      <p className="text-lg mb-2">No questions created yet</p>
                      <p className="text-sm">Start creating questions to see them here</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2">No questions match your filters</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </>
                  )}
                </div>
                <Button 
                  onClick={() => router.push('/qa')}
                  className="bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question._id} className="bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge className={getTypeColor(question.type)}>
                          {question.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.category.name}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                        {question.text}
                      </h3>
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-1 mb-3">
                          {question.options.map((option, index) => (
                            <div key={index} className="text-sm text-zinc-600 dark:text-zinc-400">
                              {String.fromCharCode(65 + index)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.correctAnswer && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Correct Answer: {question.correctAnswer}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Created: {new Date(question.createdAt).toLocaleDateString()}
                        {question.updatedAt !== question.createdAt && (
                          <span className="ml-4">
                            Updated: {new Date(question.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(question)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeletingQuestion(question)
                          setDeleteModalOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update your question details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Question Text</Label>
              <Textarea
                value={editForm.text}
                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                placeholder="Enter question text..."
                className="min-h-[100px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={editForm.type} onValueChange={(value: Question['type']) => setEditForm({ ...editForm, type: value })}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="code_snippet">Code Snippet</SelectItem>
                    <SelectItem value="open_ended">Open Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Difficulty</Label>
                <Select value={editForm.difficulty} onValueChange={(value: Question['difficulty']) => setEditForm({ ...editForm, difficulty: value })}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {editForm.type === 'multiple_choice' && (
              <div className="space-y-3">
                <Label className="text-sm">Options</Label>
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editForm.options]
                        newOptions[index] = e.target.value
                        setEditForm({ ...editForm, options: newOptions })
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                    />
                  </div>
                ))}
                
                <div>
                  <Label className="text-sm">Correct Answer</Label>
                  <Select value={editForm.correctAnswer} onValueChange={(value) => setEditForm({ ...editForm, correctAnswer: value })}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {editForm.options.filter(opt => opt.trim()).map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {editForm.type === 'true_false' && (
              <div>
                <Label className="text-sm">Correct Answer</Label>
                <Select value={editForm.correctAnswer} onValueChange={(value) => setEditForm({ ...editForm, correctAnswer: value })}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deletingQuestion && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Question:</strong> {deletingQuestion.text}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
