"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Reveal from "@/components/reveal"
import { fetchCategories, fetchCategoriesByParent, createCategory, type Category } from "@/lib/categories"
import { Search, Plus, X, ChevronRight, ArrowLeft, FolderOpen, Folder, Sparkles, Clock, Target, Layers, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function QuizSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<number>(0)
  const [checkingQuestions, setCheckingQuestions] = useState<boolean>(false)

  const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice", icon: Layers },
    { value: "true_false", label: "True/False", icon: Sparkles },
    { value: "code_snippet", label: "Code Snippet", icon: Plus },
    { value: "open_ended", label: "Open Ended", icon: Search }
  ]

  const levels = [
    { value: "easy", label: "Easy", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-amber-500" },
    { value: "hard", label: "Hard", color: "bg-rose-500" }
  ] as const

  // Load root categories on component mount
  useEffect(() => {
    loadRootCategories()
  }, [])

  // Handle URL parameters for pre-selecting category
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      handleCategoryFromUrl(categoryParam)
    }
  }, [searchParams, rootCategories])

  // Load subcategories when path changes
  useEffect(() => {
    if (selectedPath.length > 0) {
      loadSubcategories()
    } else {
      setCurrentLevelCategories([])
    }
  }, [selectedPath])

  // Check available questions when category or settings change
  useEffect(() => {
    if (selectedPath.length > 0 || categoryMode === "custom") {
      checkAvailableQuestions()
    }
  }, [selectedPath, categoryMode, customCategory, questionType, level])

  const handleCategoryFromUrl = async (categoryParam: string) => {
    try {
      // First try to find by ID
      const categoryById = rootCategories.find(cat => cat._id === categoryParam)
      if (categoryById) {
        setSelectedPath([categoryById])
        setCategoryMode("select")
        return
      }

      // If not found by ID, try to find by name
      const categoryByName = rootCategories.find(cat => 
        cat.name.toLowerCase() === categoryParam.toLowerCase()
      )
      if (categoryByName) {
        setSelectedPath([categoryByName])
        setCategoryMode("select")
        return
      }

      // If not found, set as custom category
      setCustomCategory(categoryParam)
      setCategoryMode("custom")
    } catch (error) {
      console.error('Error handling category from URL:', error)
    }
  }

  const checkAvailableQuestions = async () => {
    try {
      setCheckingQuestions(true)
      
      const finalCategory = categoryMode === "custom" 
        ? customCategory 
        : selectedPath.length > 0 
          ? selectedPath[selectedPath.length - 1]._id!
          : ""

      if (!finalCategory.trim()) {
        setAvailableQuestions(0)
        return
      }

      // Call API to get question count for this category
      const response = await fetch(`/api/questions/count?category=${encodeURIComponent(finalCategory)}&type=${questionType}&level=${level}`)
      
      if (response.ok) {
        const data = await response.json()
        const available = data.count || 0
        setAvailableQuestions(available)
        
        // If available questions are less than current count, adjust count
        if (available > 0 && available < count) {
          setCount(available)
        }
      } else {
        setAvailableQuestions(0)
      }
    } catch (error) {
      console.error('Error checking available questions:', error)
      setAvailableQuestions(0)
    } finally {
      setCheckingQuestions(false)
    }
  }

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
    // Use available questions count if it's less than requested count
    const finalCount = Math.min(count, availableQuestions > 0 ? availableQuestions : count)
    const c = Math.max(1, Math.min(finalCount, 50))
    
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
      categoryName: categoryMode === "custom" 
        ? customCategory 
        : selectedPath.length > 0 
          ? selectedPath[selectedPath.length - 1].name
          : "General",
      type: questionType,
      level,
      count: String(c),
    })
    
    // Add time limit to params if set
    if (timeLimit) {
      params.append('timeLimit', String(timeLimit))
    }
    
    router.push(`/quiz/take?${params.toString()}`)
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

  // Handle count input change with validation
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setCount(1) // Set minimum value if empty
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        const validValue = Math.max(1, Math.min(50, numValue))
        setCount(validValue)
      }
    }
  }

  // Handle time limit input change with validation
  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setTimeLimit(null) // Clear time limit if empty
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        const validValue = Math.max(1, Math.min(180, numValue)) // 1 minute to 3 hours
        setTimeLimit(validValue)
      }
    }
  }

  if (loading) {
    return (
      <main className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary animate-spin rounded-full" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Initializing Studio...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="w-full bg-background min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full rounded-3xl bg-destructive/5 border border-destructive/20 p-8 text-center space-y-4">
          <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-black text-foreground">Setup Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full rounded-xl bg-destructive text-white">Retry Connection</Button>
        </Card>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* HEADER SECTION */}
      <div className="sticky top-16 z-40 bg-card/60 backdrop-blur-xl border-none px-6 py-8 shadow-2xl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-14 w-14 rounded-2xl bg-background/50 border border-white/5 hover:bg-white/5 transition-all shadow-inner"
            >
              <ArrowLeft className="h-6 w-6 text-muted-foreground" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3 leading-none">
                <span className="h-10 w-1.5 bg-gradient-to-b from-primary via-secondary to-tertiary rounded-full" />
                Session Setup
              </h1>
              <p className="text-muted-foreground font-medium mt-2 ml-1 uppercase tracking-widest text-[10px]">
                Configuring Knowledge Synthesis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-background/50 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Availability</span>
              <span className={cn("text-xl font-black tracking-tighter", availableQuestions > 0 ? "text-primary" : "text-muted-foreground/30")}>
                {checkingQuestions ? "..." : availableQuestions} Questions
              </span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <Target className={cn("w-6 h-6", availableQuestions > 0 ? "text-primary animate-pulse" : "text-muted-foreground/20")} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
        
        {/* CATEGORY ARCHITECTURE CARD */}
        <Reveal delay={100}>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-tertiary/10 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
            <Card className="relative rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="p-8 pb-4 border-none flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <FolderOpen className="h-6 w-6 text-primary" />
                    Knowledge Domain
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Select the source taxonomy</p>
                </div>
                <div className="flex bg-background/50 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setCategoryMode("select")}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      categoryMode === "select" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Browse
                  </button>
                  <button
                    onClick={() => setCategoryMode("custom")}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      categoryMode === "custom" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Custom
                  </button>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-4">
                {categoryMode === "select" ? (
                  <div className="space-y-6">
                    {/* STUDIO-STYLE DRILL DOWN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Navigation Path */}
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Current Path</Label>
                        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-background/50 border border-white/5 min-h-[200px]">
                          <button
                            onClick={goToRoot}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl transition-all",
                              selectedPath.length === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
                            )}
                          >
                            <Layers className="w-4 h-4" />
                            <span className="text-sm font-bold">Root Domain</span>
                          </button>
                          {selectedPath.map((cat, i) => (
                            <div key={cat._id} className="flex flex-col">
                              <div className="ml-5 h-4 w-px bg-white/10" />
                              <button
                                onClick={() => setSelectedPath(selectedPath.slice(0, i + 1))}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                                  i === selectedPath.length - 1 ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-white/5"
                                )}
                              >
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-sm font-bold truncate">{cat.name}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Selection Area */}
                      <div className="space-y-4">
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="Search concepts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 rounded-2xl bg-background/50 border-none text-sm placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/30"
                          />
                        </div>

                        <div className="grid gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                          {selectedPath.length > 0 && (
                            <button
                              onClick={handleGeneralSelect}
                              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-black text-foreground">Select Current</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Use everything in this folder</p>
                              </div>
                            </button>
                          )}
                          
                          {(selectedPath.length === 0 ? filteredRootCategories : filteredCurrentCategories).map((cat) => (
                            <button
                              key={cat._id}
                              onClick={() => handleCategorySelect(cat)}
                              className="flex items-center gap-4 p-4 rounded-2xl bg-background/40 hover:bg-white/5 transition-all border border-white/5 group"
                            >
                              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Folder className="h-5 w-5 text-secondary" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-black text-foreground truncate">{cat.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Enter Domain</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl mx-auto py-10">
                    <div className="space-y-3">
                      <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Custom Subject Identity</Label>
                      <Input
                        placeholder="e.g. Quantum Electrodynamics"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="h-16 rounded-2xl bg-background border-none focus-visible:ring-2 focus-visible:ring-primary/40 text-xl font-bold px-8 shadow-inner"
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                      <Sparkles className="w-5 h-5 text-primary mt-1" />
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        The AI will synthesize a custom curriculum based on this unique subject. 
                        Accuracy depends on the specificity of the title.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Reveal>

        {/* LOGICAL CONFIGURATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* SETTINGS COLUMN */}
          <Reveal delay={200} className="lg:col-span-7 space-y-10">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-secondary/20 to-transparent rounded-[2.5rem] blur opacity-50"></div>
              <Card className="relative rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-white/5 p-8 lg:p-10 shadow-2xl space-y-10">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-3 uppercase tracking-widest">
                    Synthesizer Config
                  </h3>
                  <div className="h-0.5 w-12 bg-secondary rounded-full" />
                </div>

                {/* TYPE SELECTOR */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Modal Interaction Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {questionTypes.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setQuestionType(t.value)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                          questionType === t.value 
                            ? "bg-secondary/10 border-secondary shadow-[0_0_20px_rgba(99,102,241,0.1)] scale-[1.05]" 
                            : "bg-background/40 border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          questionType === t.value ? "bg-secondary text-white" : "bg-background text-muted-foreground"
                        )}>
                          <t.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest text-center leading-tight",
                          questionType === t.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* DIFFICULTY & TIME LIMIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Challenge Level</Label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-background/50 rounded-2xl border border-white/5">
                      {levels.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => setLevel(l.value)}
                          className={cn(
                            "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            level === l.value 
                              ? "bg-primary text-white shadow-lg shadow-primary/20" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Temporal Constraint</Label>
                      <span className="text-[9px] font-mono text-muted-foreground/50">{timeLimit ? `${timeLimit} min` : "Infinite"}</span>
                    </div>
                    <div className="relative group/time">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/time:text-primary transition-colors" />
                      <Input
                        type="number"
                        placeholder="Unbounded"
                        value={timeLimit || ""}
                        onChange={handleTimeLimitChange}
                        className="pl-12 h-14 rounded-2xl bg-background/50 border-none text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>

          {/* QUANTITY COLUMN */}
          <Reveal delay={300} className="lg:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-tertiary/20 to-transparent rounded-[2.5rem] blur opacity-50"></div>
              <Card className="relative rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-white/5 p-8 lg:p-10 shadow-2xl flex flex-col items-center text-center space-y-8">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-foreground uppercase tracking-widest">
                    Knowledge Volume
                  </h3>
                  <div className="h-0.5 w-12 bg-tertiary rounded-full mx-auto" />
                </div>

                {/* QUANTITY SELECTOR */}
                <div className="w-full space-y-8">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-tertiary/5 rounded-full blur-3xl" />
                    <div className="relative h-40 w-40 rounded-full border-4 border-white/5 flex flex-col items-center justify-center bg-background/50 shadow-2xl">
                      <span className="text-6xl font-black tracking-tighter text-foreground leading-none">{count}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">Units</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max={availableQuestions > 0 ? Math.min(50, availableQuestions) : 50}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-tertiary"
                      />
                      <div className="flex justify-between px-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase">1 Unit</span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase">{availableQuestions > 0 ? Math.min(50, availableQuestions) : 50} Max</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Session Duration</p>
                        <p className="text-xs font-bold text-foreground">Est. {count * 2} - {count * 4} minutes</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-tertiary" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>
        </div>

        {/* FINAL ACTION */}
        <Reveal delay={400}>
          <div className="relative group pt-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
            <Button
              onClick={start}
              disabled={(!customCategory.trim() && selectedPath.length === 0) || availableQuestions === 0}
              className={cn(
                "w-full h-20 rounded-3xl text-2xl font-black uppercase tracking-[0.2em] transition-all duration-500",
                availableQuestions > 0 
                  ? "bg-gradient-to-r from-primary via-secondary to-tertiary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/40" 
                  : "bg-muted-foreground/10 text-muted-foreground cursor-not-allowed border border-white/5"
              )}
            >
              Initialize Synthesis
            </Button>
            {availableQuestions === 0 && (selectedPath.length > 0 || customCategory.trim()) && !checkingQuestions && (
              <p className="text-center mt-4 text-xs font-bold text-rose-500 uppercase tracking-widest animate-bounce">
                Insufficient data in selected domain
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
