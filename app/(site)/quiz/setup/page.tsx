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
import { Search, Plus, X, ChevronRight } from "lucide-react"

export default function QuizSetupPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Category selection states
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]) // Full path of selected categories
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([])
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">("select")
  const [customCategory, setCustomCategory] = useState<string>("")

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearch, setShowSearch] = useState(false)

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

  // Load subcategories when selection changes
  useEffect(() => {
    if (selectedCategories.length > 0) {
      loadSubcategories()
    } else {
      setAvailableSubcategories([])
    }
  }, [selectedCategories])

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
      const lastSelected = selectedCategories[selectedCategories.length - 1]
      if (lastSelected && lastSelected._id) {
        const subcategories = await fetchCategoriesByParent(lastSelected._id)
        setAvailableSubcategories(subcategories)
      }
    } catch (err) {
      console.error('Failed to load subcategories:', err)
      setAvailableSubcategories([])
    }
  }

  const handleCategorySelect = (category: Category) => {
    // Find if this category is already in the path
    const existingIndex = selectedCategories.findIndex(cat => cat._id === category._id)
    
    if (existingIndex >= 0) {
      // If category is already selected, truncate the path to this level
      setSelectedCategories(selectedCategories.slice(0, existingIndex + 1))
    } else {
      // Add new category to the path
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleSubcategorySelect = (subcategory: Category) => {
    // Find if this subcategory is already in the path
    const existingIndex = selectedCategories.findIndex(cat => cat._id === subcategory._id)
    
    if (existingIndex >= 0) {
      // If subcategory is already selected, truncate the path to this level
      setSelectedCategories(selectedCategories.slice(0, existingIndex + 1))
    } else {
      // Add new subcategory to the path
      setSelectedCategories([...selectedCategories, subcategory])
    }
  }

  const removeCategoryFromPath = (index: number) => {
    setSelectedCategories(selectedCategories.slice(0, index))
  }

  const clearCategoryPath = () => {
    setSelectedCategories([])
    setAvailableSubcategories([])
  }

  // Filter categories based on search
  const filteredRootCategories = rootCategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubcategories = availableSubcategories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const start = () => {
    const c = Math.max(1, Math.min(count, 50))
    
    // Get the final selected category (deepest level)
    const finalCategory = categoryMode === "custom" 
      ? customCategory 
      : selectedCategories.length > 0 
        ? selectedCategories[selectedCategories.length - 1]._id!
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
      setSelectedCategories([])
    }
  }

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
                  {categoryMode === "select" && selectedCategories.length > 0 && (
                    <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Path:</span>
                        {selectedCategories.map((cat, index) => (
                          <div key={cat._id} className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCategoryFromPath(index)}
                              className="h-6 px-2 text-xs"
                            >
                              {cat.name}
                              <X className="ml-1 h-3 w-3" />
                            </Button>
                            {index < selectedCategories.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-zinc-400" />
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearCategoryPath}
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

                      {/* Root Categories */}
                      {selectedCategories.length === 0 && (
                        <div className="max-h-48 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                          <div className="p-2 text-xs text-zinc-500 border-b">Root Categories</div>
                          {filteredRootCategories.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500">
                              {searchTerm ? "No categories found" : "No categories available"}
                            </div>
                          ) : (
                            filteredRootCategories.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => handleCategorySelect(c)}
                                className="w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                                {c.description && (
                                  <div className="text-xs text-zinc-500">{c.description}</div>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* Subcategories */}
                      {selectedCategories.length > 0 && availableSubcategories.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                          <div className="p-2 text-xs text-zinc-500 border-b">
                            Subcategories of "{selectedCategories[selectedCategories.length - 1].name}"
                          </div>
                          {filteredSubcategories.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500">
                              {searchTerm ? "No subcategories found" : "No subcategories available"}
                            </div>
                          ) : (
                            filteredSubcategories.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                onClick={() => handleSubcategorySelect(c)}
                                className="w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                                {c.description && (
                                  <div className="text-xs text-zinc-500">{c.description}</div>
                                )}
                                <div className="text-xs text-zinc-400">Level {c.level}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* No more subcategories message */}
                      {selectedCategories.length > 0 && availableSubcategories.length === 0 && (
                        <div className="p-4 text-center text-zinc-500 bg-zinc-50 dark:bg-white/5 rounded-lg">
                          <p>No more subcategories available.</p>
                          <p className="text-sm">You can start a quiz with the current selection or go back to choose a different path.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Write Custom Category */}
                  {categoryMode === "custom" && (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter your custom category name..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="min-h-[80px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                      />
                      <p className="text-xs text-zinc-500">
                        This category will be created if it doesn't exist in the database.
                      </p>
                    </div>
                  )}
                </div>

                {/* Question Type */}
                <div className="grid gap-2">
                  <Label className="text-sm">{"Question Type"}</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                      <SelectValue placeholder="Select question type" />
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

                {/* Difficulty */}
                <div className="grid gap-2">
                  <Label className="text-sm">{"Difficulty"}</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                      <SelectValue placeholder="Select difficulty" />
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

                {/* Number of Questions */}
                <div className="grid gap-2">
                  <Label className="text-sm">
                    {"Number of questions"}
                    <span className="ml-2 text-xs text-zinc-500">{"(1-50)"}</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                  />
                </div>

                {/* Start Button */}
                <div className="pt-2">
                  <Button
                    onClick={start}
                    disabled={!((categoryMode === "select" && selectedCategories.length > 0) || (categoryMode === "custom" && customCategory.trim()))}
                    className="rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500"
                  >
                    {"Start Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
