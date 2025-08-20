"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Difficulty, QuestionType } from "@/lib/questions"
import { addQuestion } from "@/lib/questions"
import { ensureCategory /* keep existing helper */ } from "@/lib/categories"
import { ensureSubcategory } from "@/lib/subcategories"
import { fetchCategories, fetchCategoriesByParent, createCategory, type Category } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GradientLoader from "@/components/gradient-loader"
import { cn } from "@/lib/utils"
import { useInputDebug } from "@/hooks/use-debug"
import OptionField from "@/components/option-field"
import { createQuestionApi } from "@/lib/api/questions"
import { X, ChevronRight, Search, Plus, FolderPlus, FolderOpen, Layers } from "lucide-react"

type Props = { onAdded?: () => void }

export default function AddQuestionForm({ onAdded }: Props) {
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [type, setType] = useState<QuestionType>("multiple_choice")
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>("easy")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [answer, setAnswer] = useState("")
  const [code, setCode] = useState("")
  const [reason, setReason] = useState("")

  // Category state
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [selectedRootCategory, setSelectedRootCategory] = useState<Category | null>(null)
  const [customRootCategory, setCustomRootCategory] = useState("")
  const [categoryMode, setCategoryMode] = useState<"select" | "custom">("select")
  
  // Subcategory state
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null)
  const [customSubcategory, setCustomSubcategory] = useState("")
  const [subcategoryMode, setSubcategoryMode] = useState<"select" | "custom">("select")
  
  // Third layer state
  const [thirdLayerCategories, setThirdLayerCategories] = useState<Category[]>([])
  const [selectedThirdLayer, setSelectedThirdLayer] = useState<Category | null>(null)
  const [customThirdLayer, setCustomThirdLayer] = useState("")
  const [thirdLayerMode, setThirdLayerMode] = useState<"select" | "custom">("select")

  // Create new category state
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [createForLevel, setCreateForLevel] = useState<"root" | "subcategory" | "thirdLayer">("root")

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Debug binders for critical, fixed fields (safe: not dynamic)
  const dbgQuestion = useInputDebug("question")
  const dbgAnswer = useInputDebug("answer")
  const dbgCode = useInputDebug("code")

  // Load root categories
  useEffect(() => {
    loadRootCategories()
  }, [])

  // Load subcategories when root category changes
  useEffect(() => {
    if (selectedRootCategory?._id) {
      loadSubcategories(selectedRootCategory._id)
    } else {
      setSubcategories([])
      setSelectedSubcategory(null)
    }
  }, [selectedRootCategory])

  // Load third layer when subcategory changes
  useEffect(() => {
    if (selectedSubcategory?._id) {
      loadThirdLayerCategories(selectedSubcategory._id)
    } else {
      setThirdLayerCategories([])
      setSelectedThirdLayer(null)
    }
  }, [selectedSubcategory])

  const loadRootCategories = async () => {
    try {
      const categories = await fetchCategories()
      setRootCategories(categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadSubcategories = async (parentId: string) => {
    try {
      const subcategories = await fetchCategoriesByParent(parentId)
      setSubcategories(subcategories)
    } catch (err) {
      console.error('Failed to load subcategories:', err)
      setSubcategories([])
    }
  }

  const loadThirdLayerCategories = async (parentId: string) => {
    try {
      const thirdLayer = await fetchCategoriesByParent(parentId)
      setThirdLayerCategories(thirdLayer)
    } catch (err) {
      console.error('Failed to load third layer categories:', err)
      setThirdLayerCategories([])
    }
  }

  // Create new category function
  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return
    
    setCreatingCategory(true)
    try {
      let parentId: string | undefined

      if (createForLevel === "subcategory") {
        parentId = selectedRootCategory?._id
      } else if (createForLevel === "thirdLayer") {
        parentId = selectedSubcategory?._id
      }

      const newCategory = await createCategory(newCategoryName, newCategoryDescription, parentId)

      if (newCategory) {
        // Add to appropriate list and select it
        if (createForLevel === "root") {
          setRootCategories([...rootCategories, newCategory])
          setSelectedRootCategory(newCategory)
        } else if (createForLevel === "subcategory") {
          setSubcategories([...subcategories, newCategory])
          setSelectedSubcategory(newCategory)
        } else if (createForLevel === "thirdLayer") {
          setThirdLayerCategories([...thirdLayerCategories, newCategory])
          setSelectedThirdLayer(newCategory)
        }
        
        // Reset form
        setNewCategoryName("")
        setNewCategoryDescription("")
        setShowCreateNew(false)
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    } finally {
      setCreatingCategory(false)
    }
  }

  const filteredRootCategories = rootCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubcategories = subcategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredThirdLayer = thirdLayerCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const mcqValidOptions = useMemo(() => options.map((o) => o.trim()).filter(Boolean), [options])
  const canSubmit = useMemo(() => {
    if (!question.trim()) return false
    if (categoryMode === "select" && !selectedRootCategory) return false
    if (categoryMode === "custom" && !customRootCategory.trim()) return false
    if (type === "multiple_choice")
      return mcqValidOptions.length >= 2 && !!answer.trim() && mcqValidOptions.includes(answer.trim())
    if (type === "true_false") return !!answer
    if (type === "code_snippet") return !!code.trim()
    return true
  }, [question, categoryMode, selectedRootCategory, customRootCategory, type, mcqValidOptions, answer, code])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    
    setTimeout(async () => {
      // Get the final selected category (deepest level)
      let finalCategoryId: string
      
      if (categoryMode === "custom") {
        finalCategoryId = customRootCategory
      } else if (selectedThirdLayer?._id) {
        finalCategoryId = selectedThirdLayer._id
      } else if (selectedSubcategory?._id) {
        finalCategoryId = selectedSubcategory._id
      } else if (selectedRootCategory?._id) {
        finalCategoryId = selectedRootCategory._id
      } else {
        setLoading(false)
        return
      }

      try {
        // Create or find the category
        let categoryId: string
        if (categoryMode === "custom") {
          // Create new custom category
          const newCategory = await createCategory(customRootCategory)
          categoryId = newCategory?._id || customRootCategory
        } else {
          // Use selected category
          categoryId = finalCategoryId
        }

        // Create the question
        await createQuestionApi({
          text: question.trim(),
          options: type === "multiple_choice" ? mcqValidOptions : undefined,
          correctAnswer: type === "multiple_choice" || type === "true_false" ? answer.trim() : undefined,
          category: categoryId,
          reason: type === "true_false" ? reason.trim() : undefined,
          difficulty: (difficulty as any) || undefined,
        })

        // Reset form
        setQuestion("")
        setType("multiple_choice")
        setDifficulty("easy")
        setOptions(["", "", "", ""])
        setAnswer("")
        setCode("")
        setReason("")
        setSelectedRootCategory(null)
        setSelectedSubcategory(null)
        setSelectedThirdLayer(null)
        setCustomRootCategory("")
        setCategoryMode("select")
        
        onAdded?.()
      } catch (error) {
        console.error('Failed to create question:', error)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
      <span className="pointer-events-none absolute -inset-1 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
      <CardHeader className="relative">
        <CardTitle className="text-xl">Question Details</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Type</Label>
              <Select value={type} onValueChange={(value: QuestionType) => setType(value)}>
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
              <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
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

          {/* Simple Category Selection */}
          <div className="space-y-4">
            <Label className="text-sm">Category</Label>
            
            {/* Root Category - Simple Select */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                />
              </div>
              
              <div className="max-h-32 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                <div className="p-2 text-xs text-zinc-500 border-b flex justify-between items-center">
                  <span>Categories</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreateForLevel("root")
                      setShowCreateNew(true)
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </div>
                {filteredRootCategories.length === 0 ? (
                  <div className="p-3 text-center text-zinc-500 text-sm">
                    No categories found
                  </div>
                ) : (
                  filteredRootCategories.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setSelectedRootCategory(c)}
                      className={cn(
                        "w-full p-2 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors",
                        selectedRootCategory?._id === c._id && "bg-blue-50 dark:bg-blue-500/10"
                      )}
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-zinc-500">{c.description}</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Tabbed Subcategory System */}
            {selectedRootCategory && (
              <div className="space-y-3">
                <Label className="text-sm">Subcategories</Label>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setSubcategoryMode("select")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      subcategoryMode === "select"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubcategoryMode("custom")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      subcategoryMode === "custom"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    Write Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateForLevel("subcategory")
                      setShowCreateNew(true)
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Create New
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[120px]">
                  {subcategoryMode === "select" ? (
                    <div className="space-y-2">
                      <div className="max-h-32 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                        <div className="p-2 text-xs text-zinc-500 border-b">
                          Subcategories of "{selectedRootCategory.name}"
                        </div>
                        {filteredSubcategories.length === 0 ? (
                          <div className="p-3 text-center text-zinc-500 text-sm">
                            No subcategories found
                          </div>
                        ) : (
                          filteredSubcategories.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => setSelectedSubcategory(c)}
                              className={cn(
                                "w-full p-2 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors",
                                selectedSubcategory?._id === c._id && "bg-green-50 dark:bg-green-500/10"
                              )}
                            >
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                              {c.description && (
                                <div className="text-xs text-zinc-500">{c.description}</div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <Input
                      placeholder="Enter custom subcategory..."
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Tabbed Third Layer System */}
            {selectedSubcategory && (
              <div className="space-y-3">
                <Label className="text-sm">Third Layer</Label>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setThirdLayerMode("select")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      thirdLayerMode === "select"
                        ? "border-purple-500 text-purple-600 dark:text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setThirdLayerMode("custom")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      thirdLayerMode === "custom"
                        ? "border-purple-500 text-purple-600 dark:text-purple-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    Write Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateForLevel("thirdLayer")
                      setShowCreateNew(true)
                    }}
                    className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Create New
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[120px]">
                  {thirdLayerMode === "select" ? (
                    <div className="space-y-2">
                      <div className="max-h-32 overflow-y-auto border rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                        <div className="p-2 text-xs text-zinc-500 border-b">
                          Third layer categories of "{selectedSubcategory.name}"
                        </div>
                        {filteredThirdLayer.length === 0 ? (
                          <div className="p-3 text-center text-zinc-500 text-sm">
                            No third layer categories found
                          </div>
                        ) : (
                          filteredThirdLayer.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => setSelectedThirdLayer(c)}
                              className={cn(
                                "w-full p-2 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors",
                                selectedThirdLayer?._id === c._id && "bg-purple-50 dark:bg-purple-500/10"
                              )}
                            >
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</div>
                              {c.description && (
                                <div className="text-xs text-zinc-500">{c.description}</div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <Input
                      placeholder="Enter custom third layer category..."
                      value={customThirdLayer}
                      onChange={(e) => setCustomThirdLayer(e.target.value)}
                      className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm">Question</Label>
            <Textarea
              ref={dbgQuestion.ref as any}
              {...dbgQuestion.bind}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Write the question..."
              className="min-h-[100px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
            />
          </div>

          {type === "multiple_choice" && (
            <div className="space-y-3">
              <Label className="text-sm">Options</Label>
              {options.map((option, index) => (
                <OptionField
                  key={index}
                  index={index}
                  value={option}
                  onChange={(val) => {
                    const newOptions = [...options]
                    newOptions[index] = val
                    setOptions(newOptions)
                  }}
                  onRemove={() => {
                    if (options.length > 2) {
                      const newOptions = options.filter((_, i) => i !== index)
                      setOptions(newOptions)
                      // Clear answer if it was the removed option
                      if (answer === option) {
                        setAnswer("")
                      }
                    }
                  }}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setOptions([...options, ""])}
                className="w-full rounded-xl"
              >
                Add Option
              </Button>
              
              <div>
                <Label className="text-sm">Correct Answer</Label>
                <Select value={answer} onValueChange={setAnswer}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.filter(opt => opt.trim()).map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "true_false" && (
            <div className="grid gap-3">
              <div>
                <Label className="text-sm">Answer</Label>
                <Select value={answer} onValueChange={setAnswer}>
                  <SelectTrigger className="rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10">
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Reason (Optional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  className="min-h-[80px] rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
                />
              </div>
            </div>
          )}

          {type === "code_snippet" && (
            <div>
              <Label className="text-sm">Code</Label>
              <Textarea
                ref={dbgCode.ref as any}
                {...dbgCode.bind}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write the code snippet..."
                className="min-h-[120px] font-mono text-sm rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn(
              "rounded-full text-white bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:via-indigo-500 hover:to-pink-500",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <GradientLoader size={16} />
            ) : (
              "Add Question"
            )}
          </Button>
        </form>
      </CardContent>

      {/* Create New Category Modal */}
      {showCreateNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              <FolderPlus className="h-5 w-5 inline mr-2" />
              Create New Category
              {createForLevel === "root" && (
                <span className="text-sm text-zinc-500 block mt-1">
                  Root level category
                </span>
              )}
              {createForLevel === "subcategory" && selectedRootCategory && (
                <span className="text-sm text-zinc-500 block mt-1">
                  Under: {selectedRootCategory.name}
                </span>
              )}
              {createForLevel === "thirdLayer" && selectedSubcategory && (
                <span className="text-sm text-zinc-500 block mt-1">
                  Under: {selectedSubcategory.name}
                </span>
              )}
            </h3>
            
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> You can create unlimited nested categories! 
                After creating this category, you can add subcategories, sub-subcategories, and so on.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Category Name</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <Label className="text-sm">Description (Optional)</Label>
                <Textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Enter description..."
                  className="rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateNew(false)
                  setNewCategoryName("")
                  setNewCategoryDescription("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={createNewCategory}
                disabled={!newCategoryName.trim() || creatingCategory}
                className="flex-1"
              >
                {creatingCategory ? (
                  <GradientLoader size={16} />
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}