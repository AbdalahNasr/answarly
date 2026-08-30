"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Difficulty, QuestionType, VisualDiagramData, VideoQuestionData } from "@/lib/questions"
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
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  ChevronRight, 
  Search, 
  Plus, 
  FolderPlus, 
  FolderOpen, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Folder,
  Headphones,
  FormInput,
  Shuffle,
  AlignJustify,
  Calculator,
  BarChart,
  Image as ImageIcon, 
  Code2, 
  Workflow,
  ExternalLink,
  Pencil,
  Trash2,
  Video
} from "lucide-react"
import { STITCH_OPTIONS, generateStitchQuestion } from "@/lib/stitch-engine"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = { 
  onAdded?: () => void,
  stitchId?: string 
}

export default function AddQuestionForm({ onAdded, stitchId }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Initial state derived from stitch if present
  const initialStitchData = useMemo(() => {
    if (stitchId && STITCH_OPTIONS[stitchId]) {
      return generateStitchQuestion(stitchId)
    }
    return null
  }, [stitchId])

  const [question, setQuestion] = useState(initialStitchData?.question || "")
  const [type, setType] = useState<QuestionType>(initialStitchData?.type || "multiple_choice")
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(initialStitchData?.difficulty || "easy")
  const [difficultyType, setDifficultyType] = useState<"academic" | "professional">("academic")
  const [options, setOptions] = useState<string[]>(initialStitchData?.options || ["", "", "", ""])
  const [answer, setAnswer] = useState(initialStitchData?.correctAnswer || "")
  const [code, setCode] = useState("")
  const [reason, setReason] = useState("")
  const [keywords, setKeywords] = useState("")

  // New fields for expansion
  const [audioUrl, setAudioUrl] = useState("")
  const [listeningAnswerFormat, setListeningAnswerFormat] = useState<"mcq" | "open">("mcq")
  const [blankTemplate, setBlankTemplate] = useState("")
  const [blankAnswers, setBlankAnswers] = useState<string[]>([])
  const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>([{ left: "", right: "" }, { left: "", right: "" }])
  const [orderItems, setOrderItems] = useState<string[]>(["", "", ""])
  const [latex, setLatex] = useState("")
  const [diagramLabels, setDiagramLabels] = useState<Array<{ x: number; y: number; label: string }>>([])
  const [drawioStudioData, setDrawioStudioData] = useState<VisualDiagramData | undefined>(undefined)
  const [videoQuestionData, setVideoQuestionData] = useState<VideoQuestionData | undefined>(undefined)

  // Update state when stitch data changes
  useEffect(() => {
    if (initialStitchData) {
      setQuestion(initialStitchData.question)
      setType(initialStitchData.type)
      setDifficulty(initialStitchData.difficulty)
      if (initialStitchData.options) setOptions(initialStitchData.options)
      setAnswer(initialStitchData.correctAnswer)
      
      toast({
        title: "Stitch Design Loaded",
        description: `Standardized ${STITCH_OPTIONS[stitchId!].name} template applied.`,
      })
    }
  }, [initialStitchData, toast, stitchId])

  // Pick up a diagram handed back from the full-page Draw.io Studio
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = window.sessionStorage.getItem("answerly-drawio-studio-diagram")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      setDrawioStudioData(parsed)
      setType("drawio_studio")
      toast({ title: "Diagram ready", description: "Your Draw.io Studio diagram was added to this question." })
    } catch {
      // Ignore malformed or stale payloads
    } finally {
      window.sessionStorage.removeItem("answerly-drawio-studio-diagram")
    }
  }, [toast])

  // Pick up media handed back from the full-page Video Question editor
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = window.sessionStorage.getItem("answerly-video-question-data")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      setVideoQuestionData(parsed)
      setType("video")
      toast({ title: "Video ready", description: "Your video question media was added to this question." })
    } catch {
      // Ignore malformed or stale payloads
    } finally {
      window.sessionStorage.removeItem("answerly-video-question-data")
    }
  }, [toast])

  // Prefetch the heavier studio routes as soon as the user shows intent,
  // so the redirect feels instant instead of waiting on a cold route load.
  useEffect(() => {
    if (type === "drawio_studio") router.prefetch("/drawio-studio")
    if (type === "video") router.prefetch("/video-question")
  }, [type, router])

  // Media and metadata state
  const [heading, setHeading] = useState("")
  const [description, setDescription] = useState("")
  const [media, setMedia] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [showHeading, setShowHeading] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [headingPosition, setHeadingPosition] = useState<"before" | "after">("before")
  const [descriptionPosition, setDescriptionPosition] = useState<"before" | "after">("before")

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
    if (type === "listening") return !!audioUrl && (listeningAnswerFormat === "open" || (mcqValidOptions.length >= 2 && !!answer.trim()))
    if (type === "fill_in_blank") return !!blankTemplate.trim() && blankAnswers.length > 0 && blankAnswers.every(a => a.trim())
    if (type === "match_pairs") return matchPairs.length >= 2 && matchPairs.every(p => p.left.trim() && p.right.trim())
    if (type === "ordering") return orderItems.length >= 2 && orderItems.every(i => i.trim())
    if (type === "math_equation") return !!latex.trim() && !!answer.trim()
    if (type === "graph_chart") return media.length > 0 && !!answer.trim()
    if (type === "diagram_label") return media.length > 0 && diagramLabels.length > 0 && diagramLabels.every(l => l.label.trim())
    if (type === "image_mcq") return media.length > 0 && mcqValidOptions.length >= 2 && !!answer.trim()
    if (type === "drawio_studio") return true
    if (type === "video") return !!videoQuestionData?.videoUrl
    return true
  }, [question, categoryMode, selectedRootCategory, customRootCategory, type, mcqValidOptions, answer, code, audioUrl, listeningAnswerFormat, blankTemplate, blankAnswers, matchPairs, orderItems, latex, media, diagramLabels, drawioStudioData, videoQuestionData])

  const openDrawioStudio = () => {
    const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/qa"
    router.push(`/drawio-studio?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const openVideoQuestionStudio = () => {
    const returnTo = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/qa"
    router.push(`/video-question?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }

      // Create a temporary question to get an ID for media upload
      // For now, we'll store media locally and upload with the question
      const newMedia = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          newMedia.push({
            url: base64, // Temporary: we'll replace with actual URL after question creation
            type: file.type === "image/gif" ? "gif" : "image",
            position: media.length + newMedia.length,
            mimeType: file.type,
            fileName: file.name,
            caption: ""
          })
          if (newMedia.length === files.length) {
            setMedia([...media, ...newMedia])
            toast({ title: "Success", description: `${newMedia.length} file(s) added` })
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error("Media upload error:", error)
      toast({ title: "Error", description: "Failed to upload media", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const updateMediaCaption = (index: number, caption: string) => {
    const updated = [...media]
    updated[index].caption = caption
    setMedia(updated)
  }

  const updateMediaSize = (index: number, width: "full" | "half" | "small" | "auto") => {
    const updated = [...media]
    updated[index].width = width
    setMedia(updated)
  }

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
          type: type,
          options: (type === "multiple_choice" || type === "listening" || type === "image_mcq") ? mcqValidOptions : undefined,
          correctAnswer: (type === "multiple_choice" || type === "true_false" || type === "open_ended" || type === "listening" || type === "math_equation" || type === "graph_chart" || type === "image_mcq") ? answer.trim() : undefined,
          keywords: type === "open_ended" && keywords.trim() ? keywords.split(',').map(k => k.trim()).filter(k => k) : undefined,
          category: categoryId,
          reason: (type === "true_false" || reason) ? reason.trim() : undefined,
          difficulty: (difficulty as any) || undefined,
          heading: heading.trim() || undefined,
          description: description.trim() || undefined,
          media: media.length > 0 ? media : undefined,
          contentLayout: {
            showHeading,
            showDescription,
            headingPosition,
            descriptionPosition
          },
          audioUrl: type === "listening" ? audioUrl : undefined,
          listeningAnswerFormat: type === "listening" ? listeningAnswerFormat : undefined,
          blankTemplate: type === "fill_in_blank" ? blankTemplate : undefined,
          blankAnswers: type === "fill_in_blank" ? blankAnswers : undefined,
          matchPairs: type === "match_pairs" ? matchPairs : undefined,
          orderItems: type === "ordering" ? orderItems : undefined,
          latex: type === "math_equation" ? latex : undefined,
          diagramLabels: type === "diagram_label" ? diagramLabels : undefined,
          drawioStudioData: type === "drawio_studio" ? drawioStudioData : undefined,
          videoQuestionData: type === "video" ? videoQuestionData : undefined
        })

        // Reset form
        setQuestion("")
        setType("multiple_choice")
        setDifficulty("easy")
        setDifficultyType("academic")
        setOptions(["", "", "", ""])
        setAnswer("")
        setCode("")
        setReason("")
        setKeywords("")
        setHeading("")
        setDescription("")
        setMedia([])
        setShowHeading(true)
        setShowDescription(true)
        setHeadingPosition("before")
        setDescriptionPosition("before")
        setSelectedRootCategory(null)
        setSelectedSubcategory(null)
        setSelectedThirdLayer(null)
        setCustomRootCategory("")
        setCategoryMode("select")
        
        // Reset new fields
        setAudioUrl("")
        setListeningAnswerFormat("mcq")
        setBlankTemplate("")
        setBlankAnswers([])
        setMatchPairs([{ left: "", right: "" }, { left: "", right: "" }])
        setOrderItems(["", "", ""])
        setLatex("")
        setDiagramLabels([])
        setDrawioStudioData(undefined)
        setVideoQuestionData(undefined)
        
        toast({ title: 'Success', description: 'Question created successfully!' })
        onAdded?.()
      } catch (error: any) {
        console.error('Failed to create question:', error)
        // Show user-friendly error message
        if (error.message.includes('Authentication required')) {
          toast({ 
            title: 'Authentication Required', 
            description: 'Please log in again to create questions. You will be redirected to the login page.',
            variant: 'destructive' 
          })
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          toast({ title: 'Error', description: 'Failed to create question. Please try again.', variant: 'destructive' })
        }
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="space-y-10">
      <form onSubmit={submit} className="space-y-10">
        {initialStitchData && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-tertiary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/5 shadow-2xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-lg shadow-primary/10 border border-white/10">
                  <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Stitch Template Active</h3>
                  <p className="text-muted-foreground font-medium">
                    The <span className="text-primary font-bold">{STITCH_OPTIONS[stitchId!].name}</span> system has pre-configured this studio.
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Standardized System</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN - CONFIGURATION */}
          <div className="lg:col-span-4 space-y-8">
            {/* TYPE SELECTOR - CARD BASED */}
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Question Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "multiple_choice", label: "Multiple Choice", icon: Layers },
                  { id: "true_false", label: "True / False", icon: CheckCircle2 },
                  { id: "code_snippet", label: "Code Snippet", icon: Code2 },
                  { id: "open_ended", label: "Open Ended", icon: Search },
                  { id: "listening", label: "Listening", icon: Headphones },
                  { id: "fill_in_blank", label: "Fill in Blank", icon: FormInput },
                  { id: "match_pairs", label: "Match Pairs", icon: Shuffle },
                  { id: "ordering", label: "Ordering", icon: AlignJustify },
                  { id: "math_equation", label: "Math / Equation", icon: Calculator },
                  { id: "graph_chart", label: "Graph / Chart", icon: BarChart },
                  { id: "diagram_label", label: "Diagram Label", icon: Layers },
                  { id: "image_mcq", label: "Image MCQ", icon: ImageIcon },
                  { id: "drawio_studio", label: "Draw.io Studio", icon: Workflow },
                  { id: "video", label: "Video", icon: Video },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as QuestionType)}
                    onMouseEnter={() => {
                      if (t.id === "drawio_studio") router.prefetch("/drawio-studio")
                      if (t.id === "video") router.prefetch("/video-question")
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 group",
                      type === t.id 
                        ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(192,38,211,0.15)] scale-[1.02]" 
                        : "bg-card/40 border-white/5 hover:border-white/20 hover:bg-card/60"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                      type === t.id ? "bg-primary text-white" : "bg-background text-muted-foreground group-hover:text-foreground"
                    )}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest text-center",
                      type === t.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DIFFICULTY SELECTOR */}
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Intelligence Level</Label>
              <div className="p-2 rounded-2xl bg-card/40 border border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-1 p-1 bg-background/50 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setDifficultyType("academic")}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      difficultyType === "academic" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Academic
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficultyType("professional")}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      difficultyType === "professional" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Professional
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(difficultyType === "academic" ? ["easy", "medium", "hard"] : ["beginner", "intermediate", "advanced"]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level as Difficulty)}
                      className={cn(
                        "py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        difficulty === level 
                          ? "bg-secondary/10 border-secondary text-secondary shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                          : "bg-background/30 border-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FOLDER DRILL-DOWN CATEGORY SELECTOR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Category Architecture</Label>
                <button
                  type="button"
                  onClick={() => { setCreateForLevel("root"); setShowCreateNew(true); }}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Root
                </button>
              </div>
              
              <div className="rounded-3xl bg-card/40 border border-white/5 overflow-hidden flex flex-col shadow-inner">
                {/* Drill-down Navigation */}
                <div className="p-4 space-y-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search taxonomy..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 rounded-2xl bg-background/50 border-none text-sm placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    {/* ROOT LAYER */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">Root Domain</span>
                      <div className="grid gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredRootCategories.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => setSelectedRootCategory(c)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl transition-all group/item",
                              selectedRootCategory?._id === c._id 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <FolderOpen className={cn("w-4 h-4 transition-transform", selectedRootCategory?._id === c._id ? "scale-110" : "group-hover/item:scale-110")} />
                            <span className="text-sm font-bold truncate">{c.name}</span>
                            {selectedRootCategory?._id === c._id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(192,38,211,0.8)]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SUBCATEGORY LAYER */}
                    {selectedRootCategory && (
                      <div className="space-y-1 pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between ml-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Sub Domain</span>
                          <button onClick={() => { setCreateForLevel("subcategory"); setShowCreateNew(true); }} className="text-[9px] font-bold text-primary">Add</button>
                        </div>
                        <div className="grid gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                          {filteredSubcategories.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => setSelectedSubcategory(c)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all group/item",
                                selectedSubcategory?._id === c._id 
                                  ? "bg-secondary/10 text-secondary" 
                                  : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Folder className={cn("w-4 h-4 transition-transform", selectedSubcategory?._id === c._id ? "scale-110" : "group-hover/item:scale-110")} />
                              <span className="text-sm font-bold truncate">{c.name}</span>
                              {selectedSubcategory?._id === c._id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* THIRD LAYER */}
                    {selectedSubcategory && (
                      <div className="space-y-1 pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between ml-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Core Concept</span>
                          <button onClick={() => { setCreateForLevel("thirdLayer"); setShowCreateNew(true); }} className="text-[9px] font-bold text-primary">Add</button>
                        </div>
                        <div className="grid gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                          {filteredThirdLayer.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => setSelectedThirdLayer(c)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all group/item",
                                selectedThirdLayer?._id === c._id 
                                  ? "bg-tertiary/10 text-tertiary" 
                                  : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Layers className={cn("w-4 h-4 transition-transform", selectedThirdLayer?._id === c._id ? "scale-110" : "group-hover/item:scale-110")} />
                              <span className="text-sm font-bold truncate">{c.name}</span>
                              {selectedThirdLayer?._id === c._id && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(244,114,182,0.8)]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - CONTENT STUDIO */}
          <div className="lg:col-span-8 space-y-10">
            {/* MAIN CONTENT CARD */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] blur opacity-50"></div>
              <div className="relative rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-white/5 p-8 lg:p-12 shadow-2xl space-y-10">
                
                {/* QUESTION INPUT */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">The Inquiry</Label>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">{question.length} chars</span>
                  </div>
                  <Textarea
                    ref={dbgQuestion.ref as any}
                    {...dbgQuestion.bind}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter the core question here..."
                    className="min-h-[160px] rounded-3xl bg-background/50 border border-white/5 focus:ring-2 focus:ring-primary/40 transition-all p-8 text-xl font-medium placeholder:text-muted-foreground/20 leading-relaxed outline-none shadow-inner"
                  />
                </div>

                {/* TYPE-SPECIFIC INPUTS */}
                <div className="animate-in fade-in duration-500">
                  {type === "multiple_choice" && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Potential Answers</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setOptions([...options, ""])}
                          className="h-8 rounded-lg text-primary hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Option
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((option, index) => (
                          <div key={index} className="group/option relative">
                            <OptionField
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
                                  if (answer === option) setAnswer("")
                                }
                              }}
                            />
                            {/* Correct Answer Toggle */}
                            <button
                              type="button"
                              onClick={() => option.trim() && setAnswer(option)}
                              className={cn(
                                "absolute -right-2 -top-2 h-6 w-6 rounded-full border border-white/10 flex items-center justify-center transition-all z-20",
                                answer === option 
                                  ? "bg-primary text-white scale-110 shadow-lg shadow-primary/40" 
                                  : "bg-background text-muted-foreground hover:text-foreground opacity-0 group-hover/option:opacity-100"
                              )}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === "true_false" && (
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Veracity</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {["true", "false"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAnswer(val)}
                              className={cn(
                                "h-20 rounded-2xl border text-sm font-black uppercase tracking-[0.2em] transition-all",
                                answer === val 
                                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(192,38,211,0.15)]" 
                                  : "bg-background/30 border-white/5 text-muted-foreground hover:border-white/20"
                              )}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Rationale</Label>
                        <Textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Why is this the case?"
                          className="min-h-[80px] rounded-2xl bg-background/50 border border-white/5 p-5 text-sm outline-none focus:ring-1 focus:ring-primary/30 shadow-inner"
                        />
                      </div>
                    </div>
                  )}

                  {type === "open_ended" && (
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Ideal Synthesis</Label>
                      <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="What is the expected comprehensive answer?"
                        className="min-h-[120px] rounded-2xl bg-background/50 border border-white/5 p-6 text-sm outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                      />
                    </div>
                  )}

                  {type === "listening" && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Audio Resource</Label>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <Input
                              type="file"
                              accept="audio/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setUploading(true)
                                try {
                                  const formData = new FormData()
                                  formData.append("file", file)
                                  const token = localStorage.getItem('answerly-token')
                                  const res = await fetch("/api/questions/audio", {
                                    method: "POST",
                                    headers: { "Authorization": `Bearer ${token}` },
                                    body: formData
                                  })
                                  const data = await res.json()
                                  if (data.audioUrl) {
                                    setAudioUrl(data.audioUrl)
                                    toast({ title: "Success", description: "Audio uploaded to Cloudinary" })
                                  }
                                } catch (err) {
                                  toast({ title: "Error", description: "Audio upload failed", variant: "destructive" })
                                } finally {
                                  setUploading(false)
                                }
                              }}
                              className="hidden"
                              id="audio-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("audio-upload")?.click()}
                              disabled={uploading}
                              className="rounded-xl border-dashed border-white/20 bg-background/30 hover:bg-background/50 h-14 px-8"
                            >
                              {uploading ? <GradientLoader size={16} /> : <Plus className="w-4 h-4 mr-2" />}
                              {audioUrl ? "Replace Audio" : "Upload Audio (Cloudinary)"}
                            </Button>
                            {audioUrl && (
                              <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                                <Headphones className="w-4 h-4 text-primary" />
                                <audio src={audioUrl} controls className="h-8 flex-1" />
                                <button type="button" onClick={() => setAudioUrl("")} className="text-muted-foreground hover:text-rose-500">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Answer Format</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setListeningAnswerFormat("mcq")}
                            className={cn(
                              "p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest",
                              listeningAnswerFormat === "mcq" ? "bg-primary/10 border-primary text-primary" : "bg-background/30 border-white/5 text-muted-foreground"
                            )}
                          >
                            Multiple Choice
                          </button>
                          <button
                            type="button"
                            onClick={() => setListeningAnswerFormat("open")}
                            className={cn(
                              "p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest",
                              listeningAnswerFormat === "open" ? "bg-primary/10 border-primary text-primary" : "bg-background/30 border-white/5 text-muted-foreground"
                            )}
                          >
                            Open Ended
                          </button>
                        </div>
                      </div>

                      {listeningAnswerFormat === "mcq" ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">MCQ Options</Label>
                            <Button type="button" variant="ghost" onClick={() => setOptions([...options, ""])} className="h-8 text-[10px] font-black uppercase">
                              <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {options.map((opt, i) => (
                              <div key={i} className="group/option relative">
                                <OptionField index={i} value={opt} onChange={(v) => {
                                  const n = [...options]; n[i] = v; setOptions(n)
                                }} onRemove={() => setOptions(options.filter((_, idx) => idx !== i))} />
                                <button type="button" onClick={() => opt.trim() && setAnswer(opt)} className={cn(
                                  "absolute -right-2 -top-2 h-6 w-6 rounded-full border border-white/10 flex items-center justify-center transition-all z-20",
                                  answer === opt ? "bg-primary text-white" : "bg-background opacity-0 group-hover/option:opacity-100"
                                )}>
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Expected Transcription/Answer</Label>
                          <Textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="What should the student answer?"
                            className="min-h-[100px] rounded-2xl bg-background/50 border border-white/5 p-5"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {type === "fill_in_blank" && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Template Architecture</Label>
                        <div className="relative">
                          <Textarea
                            value={blankTemplate}
                            onChange={(e) => {
                              const val = e.target.value
                              setBlankTemplate(val)
                              const blanks = val.match(/___/g) || []
                              setBlankAnswers(new Array(blanks.length).fill(""))
                            }}
                            placeholder="Use '___' (three underscores) for each blank. Example: React is a JavaScript ___ for building ___."
                            className="min-h-[120px] rounded-2xl bg-background/50 border border-white/5 p-6 font-mono text-sm"
                          />
                          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase">
                            {blankAnswers.length} Blanks Detected
                          </div>
                        </div>
                      </div>

                      {blankAnswers.length > 0 && (
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Verified Solutions</Label>
                          <div className="grid gap-3">
                            {blankAnswers.map((_, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-white/5">
                                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                  {i + 1}
                                </span>
                                <Input
                                  value={blankAnswers[i]}
                                  onChange={(e) => {
                                    const n = [...blankAnswers]
                                    n[i] = e.target.value
                                    setBlankAnswers(n)
                                  }}
                                  placeholder={`Answer for blank #${i + 1}`}
                                  className="flex-1 bg-transparent border-none focus-visible:ring-0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {type === "match_pairs" && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Pair Taxonomy</Label>
                        <Button type="button" variant="ghost" onClick={() => setMatchPairs([...matchPairs, { left: "", right: "" }])} className="h-8 text-[10px] font-black uppercase">
                          <Plus className="w-3 h-3 mr-1" /> Add Pair
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {matchPairs.map((pair, i) => (
                          <div key={i} className="flex items-center gap-4 group">
                            <div className="grid grid-cols-2 gap-2 flex-1">
                              <Input
                                value={pair.left}
                                onChange={(e) => {
                                  const n = [...matchPairs]; n[i].left = e.target.value; setMatchPairs(n)
                                }}
                                placeholder="Term (e.g. Earth)"
                                className="h-12 rounded-xl bg-background/50 border-white/5"
                              />
                              <Input
                                value={pair.right}
                                onChange={(e) => {
                                  const n = [...matchPairs]; n[i].right = e.target.value; setMatchPairs(n)
                                }}
                                placeholder="Definition (e.g. Planet)"
                                className="h-12 rounded-xl bg-background/50 border-white/5"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={matchPairs.length <= 2}
                              onClick={() => setMatchPairs(matchPairs.filter((_, idx) => idx !== i))}
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-0 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === "ordering" && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Sequence Structure</Label>
                        <Button type="button" variant="ghost" onClick={() => setOrderItems([...orderItems, ""])} className="h-8 text-[10px] font-black uppercase">
                          <Plus className="w-3 h-3 mr-1" /> Add Step
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-2 rounded-xl bg-card/40 border border-white/5 group">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                              {i + 1}
                            </div>
                            <Input
                              value={item}
                              onChange={(e) => {
                                const n = [...orderItems]; n[i] = e.target.value; setOrderItems(n)
                              }}
                              placeholder={`Sequence item ${i + 1}`}
                              className="flex-1 bg-transparent border-none h-10"
                            />
                            <button
                              type="button"
                              disabled={orderItems.length <= 2}
                              onClick={() => setOrderItems(orderItems.filter((_, idx) => idx !== i))}
                              className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 disabled:opacity-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <p className="text-[10px] font-medium text-muted-foreground/50 italic text-center pt-2">
                          Note: Items will be automatically shuffled when presented to students.
                        </p>
                      </div>
                    </div>
                  )}

                  {type === "math_equation" && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">LaTeX Formulation</Label>
                        <Textarea
                          value={latex}
                          onChange={(e) => setLatex(e.target.value)}
                          placeholder="Enter LaTeX. Example: E = mc^2"
                          className="min-h-[100px] rounded-2xl bg-background/50 border border-white/5 p-6 font-mono"
                        />
                      </div>
                      
                      {latex && (
                        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">Live KaTeX Preview</span>
                          <div className="text-2xl text-foreground">
                            {/* We'll use a simple span for now, the real renderer uses KaTeX */}
                            <span dangerouslySetInnerHTML={{ 
                              __html: typeof window !== 'undefined' ? (require('katex').renderToString(latex, { throwOnError: false })) : latex 
                            }} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Correct Solution (Value)</Label>
                        <Input
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="e.g. 42"
                          className="h-14 rounded-2xl bg-background/50 border-white/5 px-6"
                        />
                      </div>
                    </div>
                  )}

                  {type === "graph_chart" && (
                    <div className="space-y-8">
                      <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 bg-background/30 text-center space-y-4">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-sm font-bold">Graph/Chart Asset</p>
                          <p className="text-xs text-muted-foreground">Upload the visual data representation</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => document.getElementById("media-upload-input")?.click()} className="rounded-xl">
                          Select Image
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Data Synthesis Answer</Label>
                        <Input
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Extract value from graph..."
                          className="h-14 rounded-2xl bg-background/50 border-white/5 px-6"
                        />
                      </div>
                    </div>
                  )}

                  {type === "diagram_label" && (
                    <div className="space-y-8">
                      <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 bg-background/30 text-center space-y-4">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-sm font-bold">Diagram Schema</p>
                          <p className="text-xs text-muted-foreground">Upload image and click to place labels</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => document.getElementById("media-upload-input")?.click()} className="rounded-xl">
                          Select Diagram
                        </Button>
                      </div>

                      {media.length > 0 && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                          <img 
                            src={media[0].url} 
                            className="w-full h-auto cursor-crosshair" 
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const x = ((e.clientX - rect.left) / rect.width) * 100
                              const y = ((e.clientY - rect.top) / rect.height) * 100
                              setDiagramLabels([...diagramLabels, { x, y, label: "" }])
                            }}
                          />
                          {diagramLabels.map((l, i) => (
                            <div key={i} className="absolute h-6 w-6 -ml-3 -mt-3 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      )}

                      {diagramLabels.length > 0 && (
                        <div className="space-y-4">
                          <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Label Definitions</Label>
                          <div className="grid gap-3">
                            {diagramLabels.map((l, i) => (
                              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-card/40 border border-white/5">
                                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">{i+1}</span>
                                <Input 
                                  value={l.label} 
                                  onChange={(e) => {
                                    const n = [...diagramLabels]; n[i].label = e.target.value; setDiagramLabels(n)
                                  }}
                                  placeholder="What is this part called?"
                                  className="flex-1 bg-transparent border-none"
                                />
                                <button type="button" onClick={() => setDiagramLabels(diagramLabels.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-rose-500">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {type === "image_mcq" && (
                    <div className="space-y-8">
                      <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 bg-background/30 text-center space-y-4">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-sm font-bold">Visual Inquiry Asset</p>
                          <p className="text-xs text-muted-foreground">Upload the primary reference image</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => document.getElementById("media-upload-input")?.click()} className="rounded-xl">
                          Select Image
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">MCQ Options</Label>
                          <Button type="button" variant="ghost" onClick={() => setOptions([...options, ""])} className="h-8 text-[10px] font-black uppercase">
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {options.map((opt, i) => (
                            <div key={i} className="group/option relative">
                              <OptionField index={i} value={opt} onChange={(v) => {
                                const n = [...options]; n[i] = v; setOptions(n)
                              }} onRemove={() => setOptions(options.filter((_, idx) => idx !== i))} />
                              <button type="button" onClick={() => opt.trim() && setAnswer(opt)} className={cn(
                                "absolute -right-2 -top-2 h-6 w-6 rounded-full border border-white/10 flex items-center justify-center transition-all z-20",
                                answer === opt ? "bg-primary text-white" : "bg-background opacity-0 group-hover/option:opacity-100"
                              )}>
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {type === "drawio_studio" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
                          Canvas Studio
                        </Label>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
                          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                            Tldraw · Full Studio
                          </span>
                        </div>
                      </div>

                      {drawioStudioData ? (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-indigo-500/20 rounded-[28px] blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                          <div className="relative p-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="h-11 w-11 shrink-0 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-bold text-foreground">Diagram ready</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Your Draw.io Studio diagram will be attached to this question.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={openDrawioStudio} className="gap-2">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setDrawioStudioData(undefined)} className="gap-2 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-indigo-500/20 rounded-[28px] blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                          <button
                            type="button"
                            onClick={openDrawioStudio}
                            className="relative w-full flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-violet-500/30 bg-[#0d1220] px-6 py-16 text-center transition hover:border-violet-400/50 hover:bg-[#0f1526]"
                          >
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(168,85,247,0.35)]">
                              <Workflow className="h-6 w-6 text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground">Open Draw.io Studio</p>
                              <p className="text-[11px] text-muted-foreground max-w-xs">
                                Design your flowchart, diagram, or table in the full studio, then bring it back here.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]">
                              <ExternalLink className="h-4 w-4" /> Launch Studio
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {type === "video" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
                          Video Lesson
                        </Label>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
                          <Video className="h-3.5 w-3.5 text-violet-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                            Type 14
                          </span>
                        </div>
                      </div>

                      {videoQuestionData?.videoUrl ? (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-indigo-500/20 rounded-[28px] blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                          <div className="relative p-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center gap-4">
                            {videoQuestionData.coverUrl ? (
                              <img
                                src={videoQuestionData.coverUrl}
                                alt="Video cover"
                                className="h-16 w-24 shrink-0 rounded-xl object-cover border border-white/10"
                              />
                            ) : (
                              <div className="h-16 w-24 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              </div>
                            )}
                            <div className="flex-1 space-y-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{videoQuestionData.videoName || "Video ready"}</p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Your video and cover image will be attached to this question.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={openVideoQuestionStudio} className="gap-2">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setVideoQuestionData(undefined)} className="gap-2 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-indigo-500/20 rounded-[28px] blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                          <button
                            type="button"
                            onClick={openVideoQuestionStudio}
                            className="relative w-full flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-violet-500/30 bg-[#0d1220] px-6 py-16 text-center transition hover:border-violet-400/50 hover:bg-[#0f1526]"
                          >
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(168,85,247,0.35)]">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground">Open Video Editor</p>
                              <p className="text-[11px] text-muted-foreground max-w-xs">
                                Upload or record a lesson video and choose a cover image, then bring it back here.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]">
                              <ExternalLink className="h-4 w-4" /> Launch Video Editor
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}


                  {type === "code_snippet" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Code Architecture</Label>
                        <span className="text-[9px] font-mono text-muted-foreground/30">TypeScript / React</span>
                      </div>
                      <div className="relative group/code">
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur opacity-0 group-hover/code:opacity-100 transition duration-500"></div>
                        <Textarea
                          ref={dbgCode.ref as any}
                          {...dbgCode.bind}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="// Write your logic here..."
                          className="relative min-h-[240px] font-mono text-sm rounded-3xl bg-[#0d0e1a] border border-white/5 p-8 outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-2xl leading-relaxed text-blue-300"
                        />
                      </div>
                    </div>
                  )}

                  {type === "open_ended" && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Expected Response</Label>
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="What is the ideal answer?"
                          className="min-h-[120px] rounded-2xl bg-background/50 border border-white/5 p-6 text-base outline-none focus:ring-1 focus:ring-primary/30 shadow-inner"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Semantic Keywords</Label>
                        <Input
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="Enter core concepts, comma-separated..."
                          className="h-14 rounded-2xl bg-background/50 border border-white/5 px-6 outline-none focus:ring-1 focus:ring-primary/30 shadow-inner"
                        />
                        <p className="text-[10px] text-muted-foreground/50 ml-1 font-medium italic">
                          Used for AI-assisted semantic evaluation of partial responses.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MEDIA & DESCRIPTIVE STUDIO */}
                <div className="pt-10 border-t border-white/5 space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-secondary to-tertiary rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Descriptive Assets</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Contextual Heading</Label>
                        <Input
                          value={heading}
                          onChange={(e) => setHeading(e.target.value)}
                          placeholder="A title for this scenario..."
                          className="h-12 rounded-xl bg-background/30 border border-white/5 px-5 outline-none focus:ring-1 focus:ring-secondary/30"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Additional Context</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Supporting information or data..."
                          className="min-h-[100px] rounded-xl bg-background/30 border border-white/5 p-5 text-sm outline-none focus:ring-1 focus:ring-secondary/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Visual Evidence</Label>
                      <div className="relative group/upload">
                        <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-tertiary/20 rounded-2xl blur opacity-0 group-hover/upload:opacity-100 transition duration-500"></div>
                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-background/20 hover:bg-background/40 hover:border-white/20 transition-all cursor-pointer">
                          <input
                            type="file"
                            id="media-upload"
                            multiple
                            accept="image/*"
                            onChange={handleMediaUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                          <label htmlFor="media-upload" className="cursor-pointer space-y-3 block">
                            <Plus className="mx-auto h-10 w-10 text-muted-foreground/50 group-hover/upload:text-secondary transition-colors" />
                            <div>
                              <p className="text-sm font-bold text-foreground">Upload Visuals</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG, GIF (Max 10MB)</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Media List */}
                      {media.length > 0 && (
                        <div className="grid gap-3 animate-in fade-in zoom-in-95 duration-500">
                          {media.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 group/media">
                              <div className="h-12 w-12 rounded-lg bg-background overflow-hidden border border-white/10 flex-shrink-0">
                                <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-foreground truncate">{item.fileName || "Asset File"}</p>
                                <Input
                                  value={item.caption}
                                  onChange={(e) => updateMediaCaption(index, e.target.value)}
                                  placeholder="Add caption..."
                                  className="h-7 text-[9px] rounded-md bg-white/5 border-none mt-1 p-2"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-card/40 border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", canSubmit ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Validation Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", loading ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(192,38,211,0.5)]" : "bg-muted-foreground/30")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network Ready</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="rounded-xl h-12 px-8 text-muted-foreground hover:text-foreground"
                >
                  Save to Drafts
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className={cn(
                    "rounded-xl h-12 px-12 font-black uppercase tracking-widest transition-all duration-500",
                    canSubmit 
                      ? "bg-gradient-to-r from-primary via-secondary to-tertiary text-white shadow-xl shadow-primary/20 hover:scale-[1.05]" 
                      : "bg-muted-foreground/10 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      Publishing...
                    </div>
                  ) : "Finalize & Publish"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* CREATE NEW CATEGORY DIALOG (Logic preserved, UI updated) */}
      <Dialog open={showCreateNew} onOpenChange={setShowCreateNew}>
        <DialogContent className="bg-card/95 backdrop-blur-2xl border-none rounded-3xl shadow-2xl p-8 max-w-md">
          <DialogHeader className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <FolderPlus className="h-7 w-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">Expand Taxonomy</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Define a new {createForLevel === "root" ? "domain" : createForLevel === "subcategory" ? "sub-domain" : "core concept"}.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Quantum Computing"
                className="h-14 rounded-2xl bg-background/50 border-white/5 focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conceptual Purpose</Label>
              <Textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="What does this category encompass?"
                className="min-h-[100px] rounded-2xl bg-background/50 border-white/5 focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setShowCreateNew(false)} className="rounded-xl flex-1 h-12">Cancel</Button>
            <Button 
              onClick={createNewCategory} 
              disabled={creatingCategory || !newCategoryName.trim()}
              className="rounded-xl flex-1 h-12 bg-primary text-white font-bold"
            >
              {creatingCategory ? "Creating..." : "Confirm Expansion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}