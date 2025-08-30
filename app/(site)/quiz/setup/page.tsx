"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Reveal from "@/components/reveal"
import { fetchCategories, fetchCategoriesByParent, createCategory, type Category } from "@/lib/categories"
import { Search, Plus, X, ChevronRight, ArrowLeft, FolderOpen, Folder } from "lucide-react"

export default function QuizSetupPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hierarchical category selection states
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [selectedPath, setSelectedPath] = useState<Category[]>([])
  const [currentLevelCategories, setCurrentLevelCategories] = useState<Category[]>([])
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">("select")
  const [customCategory, setCustomCategory] = useState<string>("")

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("")

  // Quiz configuration
  const [questionType, setQuestionType] = useState<string>("multiple_choice")
  const [level, setLevel] = useState<string>("medium")
  const [count, setCount] = useState<number>(5)

  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "true_false", label: "True/False" },
    { value: "code_snippet", label: "Code Snippet" },
    { value: "open_ended", label: "Open Ended" }
  ]

  const levels = ["easy", "medium", "hard"] as const

  // Load root categories on component mount
  useEffect(() => {
    loadRootCategories()
  }, [])

  // Load subcategories when path changes
  useEffect(() => {
    if (selectedPath.length > 0) {
      loadSubcategories()
    } else {
      setCurrentLevelCategories([])
    }
  }, [selectedPath])

  const loadRootCategories = async () => {
    try {
      setLoading(true)
      const categories = await fetchCategories()
      setRootCategories(categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const loadSubcategories = async () => {
    try {
      const lastSelected = selectedPath[selectedPath.length - 1]
      if (lastSelected && lastSelected._id) {
        const subcategories = await fetchCategoriesByParent(lastSelected._id)
        setCurrentLevelCategories(subcategories)
      }
    } catch (err) {
      console.error('Failed to load subcategories:', err)
      setCurrentLevelCategories([])
    }
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedPath([...selectedPath, category])
  }

  const handleGeneralSelect = () => {
    // User chose "General" - keep current path as is
    // This means they want questions from the current level category
  }

  const goBackOneLevel = () => {
    setSelectedPath(selectedPath.slice(0, -1))
  }

  const goToRoot = () => {
    setSelectedPath([])
  }

  const clearSelection = () => {
    setSelectedPath([])
    setCurrentLevelCategories([])
  }

  // Filter categories based on search
  const filteredRootCategories = rootCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCurrentCategories = currentLevelCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const start = () => {
    const c = Math.max(1, Math.min(count, 50))
    
    // Get the final selected category (deepest level)
    const finalCategory = categoryMode === "custom" 
      ? customCategory 
      : selectedPath.length > 0 
        ? selectedPath[selectedPath.length - 1]._id!
        : ""

    if (!finalCategory.trim()) {
      setError('Please select or enter a category')
      return
    }

    const params = new URLSearchParams({
      category: finalCategory,
      type: questionType,
      level,
      count: String(c),
    })
    
    router.push(`/quiz?${params.toString()}`)
  }

  const addCustomCategory = () => {
    if (customCategory.trim()) {
      setCategoryMode("custom")
      setSelectedPath([])
    }
  }

  // Get current level display name
  const getCurrentLevelName = () => {
    if (selectedPath.length === 0) return "Main Categories"
    const current = selectedPath[selectedPath.length - 1]
    return current.name
  }

  // Check if current level has subcategories
  const hasSubcategories = currentLevelCategories.length > 0

  if (loading) {
    return (
      <main>
        <section className="w-full">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading quiz setup...</p>
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
              <p className="text-red-600 dark:text-red-400">{error}</p>
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
          <Reveal>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {"Quiz Setup"}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {"Choose your quiz category, question type, difficulty, and number of questions."}
            </p>
          </Reveal>

          <div className="mt-8 max-w-2xl">
            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{"Configure your quiz"}</CardTitle>
              </CardHeader>
              <CardContent className="relative grid gap-5">
                
                {/* Category Selection */}
                <div className="grid gap-2">
                  <Label className="text-sm">{"Category Selection"}</Label>
                  
                  {/* Category Mode Toggle */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant={categoryMode === "select" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryMode("select")}
                      className="rounded-full"
                    >
                      Select Existing
                    </Button>
                    <Button
                      type="button"
                      variant={categoryMode === "custom" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryMode("custom")}
                      className="rounded-full"
                    >
                      Write Custom
                    </Button>
                  </div>

                  {/* Selected Category Path */}
                  {categoryMode === "select" && selectedPath.length > 0 && (
                    <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Path:</span>
                        {selectedPath.map((cat, index) => (
                          <div key={cat._id} className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPath(selectedPath.slice(0, index + 1))}
                              className="h-6 px-2 text-xs"
                            >
                              {cat.name}
                            </Button>
                            {index < selectedPath.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-zinc-400" />
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="h-6 px-2 text-xs text-red-500"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Select Existing Categories */}
                  {categoryMode === "select" && (
                    <div className="space-y-3">
                      {/* Navigation */}
                      {selectedPath.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={goBackOneLevel}
                            className="h-8 px-2 text-xs"
                          >
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            Back
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToRoot}
                            className="h-8 px-2 text-xs"
                          >
                            <Folder className="h-3 w-3 mr-1" />
                            Root
                          </Button>
                        </div>
                      )}

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          placeholder="Search categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                        />
                        {searchTerm && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Current Level Header */}
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {getCurrentLevelName()}
                      </div>

                      {/* Categories List */}
                      <div className="max-h-48 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                        {selectedPath.length === 0 ? (
                          // Root categories
                          <>
                            <div className="p-2 text-xs text-zinc-500 border-b">Main Categories</div>
                            {filteredRootCategories.length === 0 ? (
                              <div className="p-4 text-center text-zinc-500">
                                No categories found
                              </div>
                            ) : (
                              filteredRootCategories.map((cat) => (
                                <Button
                                  key={cat._id}
                                  variant="ghost"
                                  className="w-full justify-start h-auto p-3 rounded-none border-b last:border-b-0 hover:bg-zinc-50 dark:hover:bg-white/5"
                                  onClick={() => handleCategorySelect(cat)}
                                >
                                  <FolderOpen className="h-4 w-4 mr-2 text-zinc-400" />
                                  <div className="text-left">
                                    <div className="font-medium">{cat.name}</div>
                                    {cat.description && (
                                      <div className="text-xs text-zinc-500">{cat.description}</div>
                                    )}
                                  </div>
                                </Button>
                              ))
                            )}
                          </>
                        ) : (
                          // Subcategories or General option
                          <>
                            <div className="p-2 text-xs text-zinc-500 border-b">Choose an option</div>
                            
                            {/* General Option */}
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-auto p-3 rounded-none border-b hover:bg-zinc-50 dark:hover:bg-white/5"
                              onClick={handleGeneralSelect}
                            >
                              <Folder className="h-4 w-4 mr-2 text-zinc-400" />
                              <div className="text-left">
                                <div className="font-medium">General</div>
                                <div className="text-xs text-zinc-500">All questions from this category</div>
                              </div>
                            </Button>

                            {/* Specific Subcategories */}
                            {filteredCurrentCategories.length > 0 && (
                              <>
                                <div className="p-2 text-xs text-zinc-500 border-b bg-zinc-50 dark:bg-white/5">
                                  Specific Subcategories
                                </div>
                                {filteredCurrentCategories.map((cat) => (
                                  <Button
                                    key={cat._id}
                                    variant="ghost"
                                    className="w-full justify-start h-auto p-3 rounded-none border-b last:border-b-0 hover:bg-zinc-50 dark:hover:bg-white/5"
                                    onClick={() => handleCategorySelect(cat)}
                                  >
                                    <FolderOpen className="h-4 w-4 mr-2 text-zinc-400" />
                                    <div className="text-left">
                                      <div className="font-medium">{cat.name}</div>
                                      {cat.description && (
                                        <div className="text-xs text-zinc-500">{cat.description}</div>
                                      )}
                                    </div>
                                  </Button>
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Category Input */}
                  {categoryMode === "custom" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Enter your custom category (e.g., 'JavaScript Arrays', 'React Hooks', 'CSS Grid')"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="min-h-[80px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomCategory}
                        className="rounded-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Use Custom Category
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quiz Configuration */}
                <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-sm">{"Question Type"}</Label>
                    <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="text-sm">{"Difficulty Level"}</Label>
                    <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l} value={l}>
                            {l.charAt(0).toUpperCase() + l.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="text-sm">{"Number of Questions"}</Label>
                  <Input
                    type="number"
                      min="1"
                      max="50"
                    value={count}
                      onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 5)))}
                    className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                  />
                  </div>
                </div>

                {/* Start Button */}
                  <Button
                    onClick={start}
                  className="w-full rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                  Start Quiz
                  </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
