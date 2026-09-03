"use client"

import React, { useState } from "react"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ListChecks,
  ToggleLeft,
  Code2,
  PenLine,
  Headphones,
  FormInput,
  Shuffle,
  AlignJustify,
  Bold,
  Italic,
  Image as ImageIcon,
  Link as LinkIcon,
  Paperclip,
  Plus,
  Mic,
  Lightbulb,
  GripVertical,
  Check,
  ChevronDown
} from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// --- TYPES & CONFIG ---

interface Question {
  id: string
  type: string
  heading: string
  content: string
  options?: string[]
  correctAnswer?: string | number | boolean
  hint?: string
  timeLimit?: number
  difficulty: string
  points: number
  referenceImage?: string
  referenceLink?: string
  extraContext?: string
}

const QUESTION_TYPES = [
  { id: "multiple-choice", label: "Multiple Choice", icon: ListChecks, description: "Select one or more correct answers" },
  { id: "true-false", label: "True / False", icon: ToggleLeft, description: "Simple binary choice" },
  { id: "code-block", label: "Code Block", icon: Code2, description: "Technical coding challenge" },
  { id: "short-answer", label: "Short Answer", icon: PenLine, description: "Direct text-based response" },
  { id: "audio-response", label: "Audio Response", icon: Headphones, description: "Assess speaking or listening" },
  { id: "fill-blanks", label: "Fill Blanks", icon: FormInput, description: "Complete the sentence" },
  { id: "matching", label: "Matching", icon: Shuffle, description: "Connect related items" },
  { id: "ordering", label: "Ordering", icon: AlignJustify, description: "Arrange in sequence" },
]

// --- MAIN PAGE COMPONENT ---

export default function CreateQuestionPage() {
  const { toast } = useToast()

  // -- PART 9 — STATE MANAGEMENT --
  const [questionQueue, setQuestionQueue] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedType, setSelectedType] = useState("multiple-choice")
  
  const [heading, setHeading] = useState("")
  const [content, setContent] = useState("")
  
  // Specific states for question types
  const [options, setOptions] = useState<string[]>(["", "", ""])
  const [correctOption, setCorrectOption] = useState<number | null>(null)
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null)
  const [shortAnswerExpected, setShortAnswerExpected] = useState("")
  const [shortAnswerCaseSensitive, setShortAnswerCaseSensitive] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("Python")
  const [codeAnswer, setCodeAnswer] = useState("")
  const [matchingPairs, setMatchingPairs] = useState([{ term: "", definition: "" }, { term: "", definition: "" }, { term: "", definition: "" }])
  const [orderingItems, setOrderingItems] = useState([{ text: "" }, { text: "" }, { text: "" }])

  // Customization sidebar state
  const [includeHint, setIncludeHint] = useState(false)
  const [hintText, setHintText] = useState("")
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimit, setTimeLimit] = useState(30)
  const [difficulty, setDifficulty] = useState("Medium")
  const [points, setPoints] = useState(10)
  const [extraContext, setExtraContext] = useState("")

  // -- HANDLERS --
  
  const handleNextQuestionPreview = () => {
    if (currentIndex < questionQueue.length) {
      setCurrentIndex(prev => prev + 1)
      loadQuestionFromQueue(currentIndex + 1)
    }
  }

  const handlePrevQuestionPreview = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      loadQuestionFromQueue(currentIndex - 1)
    }
  }

  const loadQuestionFromQueue = (index: number) => {
    if (index < questionQueue.length) {
      const q = questionQueue[index]
      setSelectedType(q.type)
      setHeading(q.heading)
      setContent(q.content)
      setDifficulty(q.difficulty)
      setPoints(q.points)
      setExtraContext(q.extraContext || "")
      setHintText(q.hint || "")
      setIncludeHint(!!q.hint)
      setTimeLimit(q.timeLimit || 30)
      setTimeLimitEnabled(!!q.timeLimit)
      
      // Type specific loads omitted for brevity, but usually we'd sync them here
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setHeading("")
    setContent("")
    setOptions(["", "", ""])
    setCorrectOption(null)
    setTrueFalseAnswer(null)
    setShortAnswerExpected("")
    setCodeAnswer("")
    setIncludeHint(false)
    setHintText("")
    setTimeLimitEnabled(false)
    setExtraContext("")
  }

  const handleAddAnotherQuestion = () => {
    if (!content.trim() && selectedType !== "audio-response") {
      toast({
        title: "Content missing",
        description: "Please enter some content for the question before saving.",
        variant: "destructive"
      })
      return
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: selectedType,
      heading,
      content,
      options: selectedType === "multiple-choice" ? options : undefined,
      correctAnswer: selectedType === "multiple-choice" ? correctOption ?? undefined : 
                     selectedType === "true-false" ? (trueFalseAnswer !== null ? trueFalseAnswer : undefined) : 
                     selectedType === "short-answer" ? shortAnswerExpected : undefined,
      hint: includeHint ? hintText : undefined,
      timeLimit: timeLimitEnabled ? timeLimit : undefined,
      difficulty,
      points,
      extraContext
    }

    setQuestionQueue(prev => {
      const updated = [...prev]
      if (currentIndex < updated.length) {
        updated[currentIndex] = newQuestion
      } else {
        updated.push(newQuestion)
      }
      return updated
    })

    setCurrentIndex(prev => prev + 1)
    resetForm()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    toast({
      title: "Success",
      description: "Question added to your quiz queue."
    })
  }

  const totalQuestionsLoaded = Math.max(questionQueue.length + (currentIndex === questionQueue.length ? 1 : 0), 1)

  return (
    <div className="w-full min-h-screen bg-[#0A0B1A] text-[#e7e6fc] font-inter selection:bg-fuchsia-500/30">
      
      {/* -- PART 2 — SECONDARY PAGE HEADER (LUMINOUS) -- */}
      {/* Rules: No borders, bg shifts, glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#111223]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageBreadcrumb items={[
            { label: "Home", href: "/" },
            { label: "My Questions", href: "/my-questions" },
            { label: "Create New" }
          ]} />

          <div className="flex items-center gap-6 bg-[#000000]/20 px-4 py-2 rounded-full">
            <button 
              onClick={handlePrevQuestionPreview} 
              disabled={currentIndex === 0}
              className="text-[#aaa9be] hover:text-fuchsia-400 transition-colors disabled:opacity-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6366F1]">Quiz Sequence</span>
              <span className="text-xs font-bold text-[#e7e6fc]">
                QUESTION {currentIndex + 1} <span className="text-[#464658] mx-1">/</span> {totalQuestionsLoaded}
              </span>
            </div>
            <button 
              onClick={handleNextQuestionPreview}
              disabled={currentIndex >= questionQueue.length}
              className="text-[#aaa9be] hover:text-fuchsia-400 transition-colors disabled:opacity-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-12 px-6 pb-24 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-start">
        
        {/* -- LEFT COLUMN: MAIN CONTENT -- */}
        <section className="space-y-16">
          
          {/* -- PART 3 — PAGE TITLE (EDITORIAL) -- */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-white to-[#aaa9be] bg-clip-text text-transparent">
              Forge Knowledge
            </h1>
            <p className="text-lg text-[#aaa9be] font-medium leading-relaxed max-w-2xl">
              Craft deeply immersive educational challenges using our high-fidelity interaction suite.
            </p>
          </motion.div>

          {/* -- PART 4 — QUESTION TYPE SELECTOR (GRID) -- */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-600/20 flex items-center justify-center text-fuchsia-500 font-bold text-sm">1</div>
              <h2 className="text-xl font-bold tracking-tight text-[#e7e6fc]">Choose Your Blueprint</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {QUESTION_TYPES.map((type) => {
                const isSelected = selectedType === type.id
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      relative group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all duration-300
                      ${isSelected 
                        ? 'bg-[#1d1e32] shadow-[0_0_40px_rgba(192,38,211,0.15)] scale-[1.02]' 
                        : 'bg-[#111223] hover:bg-[#1d1e32]'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="active-bg"
                        className="absolute inset-0 rounded-2xl border-2 border-fuchsia-600/50 pointer-events-none"
                      />
                    )}
                    <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-fuchsia-600/10 text-fuchsia-400' : 'bg-[#0A0B1A] text-[#464658] group-hover:text-[#aaa9be]'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className={`text-[10px] uppercase font-black tracking-[0.15em] ${isSelected ? 'text-[#e7e6fc]' : 'text-[#464658]'}`}>
                        {type.label}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* -- PART 5 — QUESTION CONTENT SECTION (GLASSMISM) -- */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-500 font-bold text-sm">2</div>
              <h2 className="text-xl font-bold tracking-tight text-[#e7e6fc]">Architect the Query</h2>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                placeholder="Core Objective / Heading"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                className="w-full bg-[#111223] rounded-xl px-6 py-4 text-lg font-bold placeholder:text-[#464658] border-none focus:ring-2 focus:ring-fuchsia-600/40 transition-shadow"
              />

              <div className="bg-[#111223] rounded-2xl overflow-hidden shadow-2xl">
                {/* Internal Toolbar (No lines!) */}
                <div className="bg-[#1d1e32] px-4 py-3 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#aaa9be] mr-2">Markdown Pro</span>
                  <div className="flex items-center gap-1 bg-[#0A0B1A]/40 p-1 rounded-lg">
                    <button className="p-2 hover:bg-[#23243a] rounded-md text-[#aaa9be] hover:text-white transition-colors"><Bold className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-[#23243a] rounded-md text-[#aaa9be] hover:text-white transition-colors"><Italic className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-[#23243a] rounded-md text-[#aaa9be] hover:text-white transition-colors"><Code2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0A0B1A]/40 p-1 rounded-lg ml-auto">
                    <button className="p-2 hover:bg-[#23243a] rounded-md text-[#aaa9be] hover:text-white transition-colors"><ImageIcon className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-[#23243a] rounded-md text-[#aaa9be] hover:text-white transition-colors"><LinkIcon className="w-4 h-4" /></button>
                  </div>
                </div>

                <textarea
                  placeholder="Describe your question in detail..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-[#0c0d1c] p-8 min-h-[220px] text-lg leading-relaxed text-[#e7e6fc] placeholder:text-[#23243a] resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* -- PART 6 — DYNAMIC ANSWER SECTIONS (HIGH FIDELITY) -- */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-600/20 flex items-center justify-center text-pink-500 font-bold text-sm">3</div>
                <h2 className="text-xl font-bold tracking-tight text-[#e7e6fc]">Define the Outcome</h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Mark Correct Path</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                
                {/* --- MULTIPLE CHOICE --- */}
                {selectedType === "multiple-choice" && (
                  <motion.div 
                    key="mc"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {options.map((opt, i) => (
                      <div key={i} className="group flex items-center gap-4">
                        <div className={`
                          flex-1 flex items-center px-6 py-2 rounded-2xl transition-all duration-300
                          ${correctOption === i ? 'bg-fuchsia-600/10' : 'bg-[#111223] group-hover:bg-[#1d1e32]'}
                        `}>
                          <span className={`text-lg font-black mr-4 ${correctOption === i ? 'text-fuchsia-400' : 'text-[#464658]'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const n = [...options]; n[i] = e.target.value; setOptions(n);
                            }}
                            className="w-full bg-transparent border-none py-4 text-[#e7e6fc] font-medium placeholder:text-[#23243a] focus:outline-none"
                            placeholder={`Enter Option ${i+1}`}
                          />
                        </div>
                        <button 
                          onClick={() => setCorrectOption(i)}
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                            ${correctOption === i 
                              ? 'bg-gradient-to-br from-fuchsia-600 to-pink-600 shadow-lg shadow-fuchsia-900/40 text-white' 
                              : 'bg-[#111223] border-2 border-transparent hover:border-fuchsia-600/30 text-[#464658]'
                            }
                          `}
                        >
                          {correctOption === i ? <Check className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => setOptions([...options, ""])}
                      className="w-full py-6 mt-4 rounded-2xl border-2 border-dashed border-[#1d1e32] text-[#464658] font-bold text-sm uppercase tracking-widest hover:border-fuchsia-600/40 hover:text-fuchsia-400 hover:bg-fuchsia-600/5 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Expand Vocabulary
                    </button>
                  </motion.div>
                )}

                {/* --- TRUE / FALSE --- */}
                {selectedType === "true-false" && (
                  <motion.div 
                    key="tf"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-8"
                  >
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => setTrueFalseAnswer(val)}
                        className={`
                          relative overflow-hidden p-10 rounded-3xl flex flex-col items-center gap-4 transition-all duration-500
                          ${trueFalseAnswer === val 
                            ? (val ? 'bg-green-600/10 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'bg-red-600/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]') 
                            : 'bg-[#111223] hover:bg-[#1d1e32]'
                          }
                        `}
                      >
                        <div className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-all
                          ${trueFalseAnswer === val 
                            ? (val ? 'bg-green-600 text-white' : 'bg-red-600 text-white') 
                            : 'bg-[#0A0B1A] text-[#464658]'
                          }
                        `}>
                          {val ? <Check className="w-8 h-8" /> : <ChevronDown className="w-8 h-8 rotate-45" />}
                        </div>
                        <span className={`text-2xl font-black uppercase tracking-widest ${trueFalseAnswer === val ? (val ? 'text-green-400' : 'text-red-400') : 'text-[#464658]'}`}>
                          {val ? "Veritas" : "Falsitas"}
                        </span>
                        <span className="text-[10px] text-[#aaa9be] font-bold tracking-widest opacity-50">{val ? "CORRECT" : "INCORRECT"}</span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* --- SHORT ANSWER --- */}
                {selectedType === "short-answer" && (
                  <motion.div 
                    key="sa"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                   <div className="bg-[#111223] rounded-3xl p-8 space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#6366F1]">Canonical Response</div>
                      <textarea 
                        value={shortAnswerExpected}
                        onChange={(e) => setShortAnswerExpected(e.target.value)}
                        placeholder="Enter the definitive correct answer..."
                        className="w-full bg-transparent text-2xl font-bold text-[#e7e6fc] placeholder:text-[#23243a] focus:outline-none min-h-[120px] resize-none"
                      />
                   </div>
                   <div className="flex items-center gap-4 bg-[#111223] p-6 rounded-2xl w-max">
                      <span className="text-sm font-bold text-[#aaa9be]">Strict Casing</span>
                      <Switch checked={shortAnswerCaseSensitive} onCheckedChange={setShortAnswerCaseSensitive} />
                   </div>
                  </motion.div>
                )}

                {/* --- CODE BLOCK --- */}
                {selectedType === "code-block" && (
                  <motion.div 
                    key="cb"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-[#111223] p-4 rounded-xl">
                      <div className="flex gap-4">
                        {['Python', 'TypeScript', 'Java', 'C++'].map(lang => (
                          <button 
                            key={lang}
                            onClick={() => setCodeLanguage(lang)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${codeLanguage === lang ? 'bg-fuchsia-600 text-white' : 'text-[#464658] hover:text-[#aaa9be]'}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#000000] rounded-3xl p-8 border border-fuchsia-600/10 shadow-2xl">
                      <pre className="text-fuchsia-400 mb-4 text-xs font-mono opacity-50">// Expected output / Valid implementation</pre>
                      <textarea 
                        value={codeAnswer}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        placeholder="System.out.println('Hello Answerly');"
                        className="w-full bg-transparent font-mono text-lg text-indigo-300 border-none focus:outline-none min-h-[250px] resize-none"
                      />
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* -- PART 7 — FINAL ACTIONS (CTA) -- */}
          <div className="pt-12">
            <button 
              onClick={handleAddAnotherQuestion}
              className="group relative w-full py-8 rounded-3xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 text-white font-black text-2xl shadow-[0_20px_60px_rgba(192,38,211,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                <Plus className="w-8 h-8" /> Commit Question to Memory
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            </button>
            <p className="text-center text-[#464658] text-[10px] font-bold uppercase tracking-[0.3em] mt-8">
              Pressing this will finalize the current question and open a fresh slate
            </p>
          </div>

        </section>

        {/* -- RIGHT SIDEBAR: PARAMETERS (GLASSMISM FIXED) -- */}
        <aside className="sticky top-32 space-y-8 hidden lg:block">
          
          <div className="relative group bg-[#111223]/60 backdrop-blur-xl rounded-[2rem] p-8 overflow-hidden">
            {/* Signature Glow Decor */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-600/10 blur-[80px] rounded-full group-hover:bg-fuchsia-600/20 transition-all duration-1000" />
            
            <div className="relative space-y-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-500">Parameters</span>
                <h3 className="text-2xl font-black text-[#e7e6fc]">Configuration</h3>
              </div>

              {/* Difficulty & Points Tonal Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0B1A] p-4 rounded-2xl flex flex-col gap-3">
                  <span className="text-[9px] font-black uppercase text-[#464658]">Difficulty</span>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-transparent border-none p-0 h-auto text-fuchsia-400 font-bold focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111223] border-none text-white rounded-xl">
                      <SelectItem value="Easy">Novice</SelectItem>
                      <SelectItem value="Medium">Adept</SelectItem>
                      <SelectItem value="Hard">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-[#0A0B1A] p-4 rounded-2xl flex flex-col gap-3">
                  <span className="text-[9px] font-black uppercase text-[#464658]">Points</span>
                  <input 
                    type="number"
                    value={points}
                    onChange={e => setPoints(Number(e.target.value))}
                    className="bg-transparent border-none p-0 text-fuchsia-400 font-bold text-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Hint System */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold">Hint Overlay</span>
                  </div>
                  <Switch checked={includeHint} onCheckedChange={setIncludeHint} />
                </div>
                {includeHint && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <textarea 
                      value={hintText}
                      onChange={e => setHintText(e.target.value)}
                      placeholder="Enter subtle guidance..."
                      className="w-full bg-[#0A0B1A]/60 rounded-xl p-4 text-xs font-medium text-[#aaa9be] border-none focus:ring-1 focus:ring-fuchsia-500/50 min-h-[100px] resize-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Reference Assets */}
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase text-[#464658] pl-2">Reference Assets</span>
                <div className="bg-[#0A0B1A] p-10 rounded-3xl border-2 border-dashed border-[#1d1e32] flex flex-col items-center gap-4 group/asset cursor-pointer hover:border-fuchsia-500/30 transition-all">
                  <div className="p-4 rounded-full bg-[#111223] text-[#464658] group-hover/asset:text-fuchsia-400 transition-colors">
                    <Paperclip className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#464658] group-hover/asset:text-[#aaa9be]">Attach Media</span>
                </div>
              </div>

              {/* Time Control */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black uppercase tracking-widest">Chronos</span>
                  <Switch checked={timeLimitEnabled} onCheckedChange={setTimeLimitEnabled} />
                </div>
                {timeLimitEnabled && (
                  <div className="space-y-4">
                    <div className="bg-[#0A0B1A] p-6 rounded-2xl flex items-center justify-between">
                      <span className="text-3xl font-black text-indigo-400">{timeLimit}s</span>
                      <div className="flex gap-2">
                        <button onClick={() => setTimeLimit(Math.max(10, timeLimit - 10))} className="w-8 h-8 rounded-lg bg-[#111223] flex items-center justify-center font-bold text-sm">-</button>
                        <button onClick={() => setTimeLimit(timeLimit + 10)} className="w-8 h-8 rounded-lg bg-[#111223] flex items-center justify-center font-bold text-sm">+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#111223] p-8 rounded-[2rem] space-y-4">
            <h4 className="text-indigo-400 font-black text-sm uppercase tracking-widest">Designer Note</h4>
            <p className="text-xs text-[#aaa9be] leading-relaxed font-medium">
              You are currently editing <span className="text-[#e7e6fc]">Step {currentIndex + 1}</span> of your learning journey. Remember to save individual questions before proceeding to the final project export.
            </p>
          </div>
        </aside>

      </main>

      {/* Floating Action Bar (Mobile only or Global) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 lg:hidden">
        <button 
          onClick={handleAddAnotherQuestion}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black shadow-2xl"
        >
          Save & Next
        </button>
      </footer>
    </div>
  )
}
