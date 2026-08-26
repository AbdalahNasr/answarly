"use client"

import React, { useState } from "react"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
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
  GripVertical
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

interface Question {
  id: string
  type: string
  heading: string
  content: string
  options?: string[]
  correctAnswer?: string | number
  hint?: string
  timeLimit?: number
  difficulty: string
  points: number
  referenceImage?: string
  referenceLink?: string
  extraContext?: string
}

const QUESTION_TYPES = [
  { id: "multiple-choice", label: "Multiple Choice", icon: ListChecks },
  { id: "true-false", label: "True / False", icon: ToggleLeft },
  { id: "code-block", label: "Code Block", icon: Code2 },
  { id: "short-answer", label: "Short Answer", icon: PenLine },
  { id: "audio-response", label: "Audio Response", icon: Headphones },
  { id: "fill-blanks", label: "Fill Blanks", icon: FormInput },
  { id: "matching", label: "Matching", icon: Shuffle },
  { id: "ordering", label: "Ordering", icon: AlignJustify },
]

export function CreateQuestionClient() {
  const { toast } = useToast()

  // State Management
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

  const [matchingPairs, setMatchingPairs] = useState([{ term: "", definition: "" }, { term: "", definition: "" }, { term: "", definition: "" }, { term: "", definition: "" }])
  const [orderingItems, setOrderingItems] = useState([{ text: "" }, { text: "" }, { text: "" }])

  // Customization sidebar state
  const [includeHint, setIncludeHint] = useState(false)
  const [hintText, setHintText] = useState("")
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimit, setTimeLimit] = useState(30)
  const [difficulty, setDifficulty] = useState("Medium")
  const [points, setPoints] = useState(10)
  const [extraContext, setExtraContext] = useState("")

  // Handlers
  const handleNextQuestionPreview = () => {
    if (currentIndex < questionQueue.length) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestionPreview = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
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
                     selectedType === "true-false" ? String(trueFalseAnswer) : undefined,
      hint: includeHint ? hintText : undefined,
      timeLimit: timeLimitEnabled ? timeLimit : undefined,
      difficulty,
      points,
      extraContext
    }

    // Save to queue
    setQuestionQueue(prev => {
      const updated = [...prev]
      if (currentIndex < updated.length) {
        updated[currentIndex] = newQuestion
      } else {
        updated.push(newQuestion)
      }
      return updated
    })

    // Increment counter & reset form
    setCurrentIndex(prev => prev + 1)
    
    // Reset specific states
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
    // Keep selectedType, difficulty and points
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Derived values
  const totalQuestions = Math.max(questionQueue.length + (currentIndex === questionQueue.length ? 1 : 0), 1)

  return (
    <div className="w-full min-h-screen bg-[#0A0B1A] pb-32">
      {/* PART 2 - SECONDARY PAGE HEADER */}
      <div className="bg-[#111223]/50 border-b border-[#464658]/10 px-6 py-3 w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageBreadcrumb items={[
            { label: "Home", href: "/" },
            { label: "My Questions", href: "/my-questions" },
            { label: "Create Question" }
          ]} />

          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrevQuestionPreview} 
              disabled={currentIndex === 0}
              className="text-[18px] text-[#aaa9be] hover:text-fuchsia-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#aaa9be]">
              QUESTION {currentIndex + 1} OF {totalQuestions}
            </span>
            <button 
              onClick={handleNextQuestionPreview}
              disabled={currentIndex >= questionQueue.length}
              className="text-[18px] text-[#aaa9be] hover:text-fuchsia-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 px-6 flex items-start gap-12">
        {/* LEFT COLUMN - MAIN FORM */}
        <div className="flex-1 space-y-12 min-w-0">
          
          {/* PART 3 - PAGE TITLE */}
          <div>
            <h1 className="text-4xl font-extrabold text-[#e7e6fc] tracking-tight">
              Create Question
            </h1>
            <p className="text-[#aaa9be] text-sm mt-2">
              Design a new educational challenge for your learners.
            </p>
          </div>

          {/* PART 4 - QUESTION TYPE SELECTOR */}
          <div>
            <h2 className="text-lg font-bold text-[#6366F1] mb-6">1. Select Question Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUESTION_TYPES.map(type => {
                const isSelected = selectedType === type.id
                const Icon = type.icon
                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[100px] transition-all
                      ${isSelected 
                        ? 'bg-[#111223] border-2 border-fuchsia-600 shadow-[0_0_20px_rgba(192,38,211,0.3)]' 
                        : 'bg-[#111223] border-none hover:bg-[#1d1e32]'
                      }
                    `}
                  >
                    <div className={isSelected ? 'text-fuchsia-400' : 'text-[#aaa9be]'}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs uppercase tracking-wider ${isSelected ? 'font-bold text-[#e7e6fc]' : 'font-medium text-[#aaa9be]'}`}>
                      {type.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PART 5 - DYNAMIC QUESTION CONTENT SECTION */}
          <div>
            <h2 className="text-lg font-bold text-[#6366F1] mb-6">2. Question Content</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Question heading (optional)"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                className="w-full rounded-xl bg-[#1d1e32] border-none px-4 py-3 text-[#e7e6fc] focus:outline-none focus:ring-2 focus:ring-fuchsia-600/40"
              />

              <div className="bg-[#111223] rounded-2xl overflow-hidden border border-transparent">
                <div className="bg-[#1d1e32] px-3 py-2 border-b border-[#464658]/20 flex items-center gap-1">
                  <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><Bold className="w-4 h-4" /></button>
                  <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><Italic className="w-4 h-4" /></button>
                  <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><Code2 className="w-4 h-4" /></button>
                  
                  <div className="w-px h-4 bg-[#464658]/30 mx-1" />
                  
                  <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><ImageIcon className="w-4 h-4" /></button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><LinkIcon className="w-4 h-4" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-[#111223] border-[#464658]/30 p-4 space-y-4 rounded-xl">
                      <div className="space-y-2">
                        <input type="text" placeholder="https://..." className="w-full bg-[#1d1e32] border-none rounded-lg text-sm px-3 py-2 text-[#e7e6fc] focus:ring-1 focus:ring-fuchsia-500" />
                        <input type="text" placeholder="Link text" className="w-full bg-[#1d1e32] border-none rounded-lg text-sm px-3 py-2 text-[#e7e6fc] focus:ring-1 focus:ring-fuchsia-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#aaa9be]">Attach to image</span>
                        <Switch />
                      </div>
                      <button className="w-full bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 text-white rounded-lg py-2 text-xs font-bold">
                        Insert
                      </button>
                    </PopoverContent>
                  </Popover>
                  
                  <button className="p-1.5 hover:bg-[#23243a] rounded text-[#aaa9be] hover:text-[#e7e6fc] transition-colors"><Paperclip className="w-4 h-4" /></button>

                  {selectedType === "fill-blanks" && (
                    <button className="ml-auto bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-600/20 rounded-lg px-3 py-1.5 text-xs font-bold uppercase hover:bg-fuchsia-600/20 transition-colors">
                      + Manual Blank
                    </button>
                  )}
                </div>

                <textarea
                  placeholder="Enter your question here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-[#0c0d1c] p-6 min-h-[160px] text-[#e7e6fc] leading-relaxed resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PART 6 - DYNAMIC ANSWER SECTION PER TYPE */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-lg font-bold text-[#6366F1]">3. Answer Options</h2>
              <span className="text-xs text-[#aaa9be] uppercase tracking-widest">Select Correct Answer</span>
            </div>

            <div className="space-y-4">
              
              {/* MULTIPLE CHOICE */}
              {selectedType === "multiple-choice" && (
                <div className="space-y-4">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-1 bg-[#111223]/40 backdrop-blur-sm rounded-xl flex items-center px-4 py-1 border border-[#464658]/10 focus-within:border-fuchsia-600/30 transition-colors">
                        <span className="text-fuchsia-400 font-bold mr-3">{String.fromCharCode(65 + i)}</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOps = [...options]
                            newOps[i] = e.target.value
                            setOptions(newOps)
                          }}
                          className="w-full bg-transparent border-none py-3 text-[#e7e6fc] focus:outline-none"
                          placeholder={`Option ${i + 1}`}
                        />
                      </div>
                      <div 
                        onClick={() => setCorrectOption(i)}
                        className={`
                          w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all flex-shrink-0
                          ${correctOption === i ? 'border-fuchsia-600 bg-fuchsia-600/20' : 'border-[#464658]'}
                        `}
                      >
                        {correctOption === i && <div className="w-3 h-3 rounded-full bg-fuchsia-400" />}
                      </div>
                    </div>
                  ))}
                  
                  {options.length < 6 && (
                    <button 
                      onClick={handleAddOption}
                      className="w-full py-4 border-2 border-dashed border-[#464658]/30 rounded-xl text-[#aaa9be] hover:text-fuchsia-400 hover:border-fuchsia-600/50 hover:bg-fuchsia-600/5 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <Plus className="w-4 h-4" /> Add New Option
                    </button>
                  )}
                </div>
              )}

              {/* TRUE / FALSE */}
              {selectedType === "true-false" && (
                <div className="grid grid-cols-2 gap-6">
                  <div 
                    onClick={() => setTrueFalseAnswer(true)}
                    className={`
                      rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer border-2 transition-all
                      ${trueFalseAnswer === true ? 'border-green-500 bg-green-500/10 text-green-400' : 'bg-[#111223] border-[#464658]/20 text-[#aaa9be] hover:bg-[#1d1e32]'}
                    `}
                  >
                    <ToggleLeft className="w-8 h-8" />
                    <span className="text-xl font-bold uppercase tracking-widest">True</span>
                  </div>
                  <div 
                    onClick={() => setTrueFalseAnswer(false)}
                    className={`
                      rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer border-2 transition-all
                      ${trueFalseAnswer === false ? 'border-red-400 bg-red-400/10 text-red-400' : 'bg-[#111223] border-[#464658]/20 text-[#aaa9be] hover:bg-[#1d1e32]'}
                    `}
                  >
                    <ToggleLeft className="w-8 h-8" />
                    <span className="text-xl font-bold uppercase tracking-widest">False</span>
                  </div>
                </div>
              )}

              {/* SHORT ANSWER */}
              {selectedType === "short-answer" && (
                <div className="space-y-4">
                  <textarea 
                    value={shortAnswerExpected}
                    onChange={(e) => setShortAnswerExpected(e.target.value)}
                    placeholder="Expected answer (used for grading)..."
                    className="w-full bg-[#111223] rounded-xl p-4 min-h-[100px] text-[#e7e6fc] border-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                  />
                  <div className="flex items-center gap-3 bg-[#111223] p-4 rounded-xl border border-[#464658]/10 w-max">
                    <Switch 
                      checked={shortAnswerCaseSensitive}
                      onCheckedChange={setShortAnswerCaseSensitive}
                    />
                    <span className="text-sm text-[#e7e6fc]">Case sensitive grading</span>
                  </div>
                </div>
              )}

              {/* CODE BLOCK */}
              {selectedType === "code-block" && (
                <div className="space-y-4">
                  <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                    <SelectTrigger className="w-[180px] bg-[#111223] border-none rounded-xl text-[#e7e6fc]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111223] border-[#464658]/30 text-[#e7e6fc]">
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <textarea 
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    placeholder={`// Enter expected ${codeLanguage} code answer...`}
                    className="w-full bg-[#000000] rounded-xl p-4 font-mono text-sm text-green-400 min-h-[160px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 resize-none"
                  />
                </div>
              )}

              {/* AUDIO RESPONSE */}
              {selectedType === "audio-response" && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-fuchsia-600/40 rounded-2xl p-10 flex flex-col items-center gap-4 bg-[#111223] cursor-pointer hover:border-fuchsia-500/60 hover:bg-[#1d1e32] transition-colors">
                    <Mic className="text-fuchsia-500 w-12 h-12" />
                    <span className="text-[#aaa9be] text-sm">Drop audio file or click to record</span>
                  </div>
                  <div className="flex justify-center">
                    <button className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-600 to-pink-600 shadow-[0_0_30px_rgba(192,38,211,0.4)] flex items-center justify-center hover:scale-105 transition-transform">
                      <Mic className="text-white w-8 h-8" />
                    </button>
                  </div>
                </div>
              )}

              {/* FILL BLANKS */}
              {selectedType === "fill-blanks" && (
                <div className="space-y-6">
                  <div 
                    contentEditable
                    suppressContentEditableWarning
                    className="bg-[#0c0d1c] p-8 min-h-[200px] rounded-2xl text-2xl leading-relaxed text-[#e7e6fc] font-light focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30"
                  >
                    The mitochondria is the <span className="text-fuchsia-400 bg-fuchsia-600/10 border-b-2 border-fuchsia-500 px-1 rounded-sm">powerhouse</span> of the cell.
                  </div>
                  
                  <div className="bg-[#111223] rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs text-[#aaa9be] uppercase tracking-widest font-bold mb-4">ANSWERS & LOGIC</h3>
                    <div className="flex items-center gap-4 bg-[#1d1e32] p-4 rounded-xl">
                      <div className="w-6 h-6 rounded bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center text-xs font-bold border border-fuchsia-500/30">1</div>
                      <input type="text" value="powerhouse" readOnly className="bg-transparent border-none text-[#e7e6fc] font-semibold flex-1 focus:outline-none" />
                      <div className="flex items-center gap-2 border-l border-[#464658]/30 pl-4">
                        <span className="text-xs text-[#aaa9be]">Add hint</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MATCHING */}
              {selectedType === "matching" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-[1fr_40px_1fr] gap-4">
                    <div className="text-xs text-[#aaa9be] uppercase tracking-widest text-center mb-2">Terms</div>
                    <div></div>
                    <div className="text-xs text-[#aaa9be] uppercase tracking-widest text-center mb-2">Definitions</div>
                  </div>
                  
                  {matchingPairs.map((pair, i) => (
                    <div key={i} className="grid grid-cols-[1fr_40px_1fr] gap-4 items-center">
                      <div className="bg-[#111223] rounded-xl px-4 py-3 border border-[#464658]/20 focus-within:border-fuchsia-500/50">
                        <input value={pair.term} onChange={e => {
                          const n = [...matchingPairs]; n[i].term = e.target.value; setMatchingPairs(n);
                        }} placeholder={`Term ${i+1}`} className="w-full bg-transparent text-[#e7e6fc] border-none focus:outline-none text-sm" />
                      </div>
                      <div className="flex justify-center">
                        <div className="w-full h-0 border-b border-dashed border-fuchsia-600/40" />
                      </div>
                      <div className="bg-[#111223] rounded-xl px-4 py-3 border border-[#464658]/20 focus-within:border-fuchsia-500/50">
                        <input value={pair.definition} onChange={e => {
                          const n = [...matchingPairs]; n[i].definition = e.target.value; setMatchingPairs(n);
                        }} placeholder={`Definition ${i+1}`} className="w-full bg-transparent text-[#e7e6fc] border-none focus:outline-none text-sm" />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setMatchingPairs([...matchingPairs, {term: "", definition: ""}])} className="w-full py-3 my-2 border border-fuchsia-600/30 text-fuchsia-400 rounded-xl hover:bg-fuchsia-600/10 transition-colors text-sm font-semibold">
                    + Add Pair
                  </button>
                </div>
              )}

              {/* ORDERING */}
              {selectedType === "ordering" && (
                <div className="space-y-3">
                  {orderingItems.map((item, i) => (
                    <div key={i} className="bg-[#111223] rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-fuchsia-500/30 transition-all cursor-move">
                      <GripVertical className="text-[#464658] w-5 h-5" />
                      <div className="w-6 h-6 rounded bg-fuchsia-600/20 text-fuchsia-400 flex items-center justify-center text-xs font-bold border border-fuchsia-500/30">{i+1}</div>
                      <input 
                        value={item.text} 
                        onChange={e => {
                          const n = [...orderingItems]; n[i].text = e.target.value; setOrderingItems(n);
                        }} 
                        className="flex-1 bg-transparent border-none text-[#e7e6fc] focus:outline-none text-sm" 
                        placeholder={`Ordering step ${i+1}`} 
                      />
                    </div>
                  ))}
                  <button onClick={() => setOrderingItems([...orderingItems, {text: ""}])} className="w-full py-3 mt-4 border border-dashed border-[#464658]/30 text-[#aaa9be] rounded-xl hover:text-fuchsia-400 hover:border-fuchsia-500/50 transition-colors text-sm font-semibold flex justify-center items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PART 7 - ADD ANOTHER QUESTION BUTTON */}
          <div className="pt-8">
            <button 
              onClick={handleAddAnotherQuestion}
              className="py-5 rounded-2xl w-full bg-gradient-to-r from-[#C026D3] via-[#9333EA] to-pink-600 text-white font-extrabold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-xl shadow-fuchsia-900/20"
            >
              <Plus className="w-6 h-6" /> Add Another Question
            </button>
          </div>

        </div>

        {/* RIGHT SIDEBAR - CUSTOMIZATION */}
        <div className="w-[400px] sticky top-24 hidden lg:block space-y-6">
          <div className="bg-[#23243a]/40 backdrop-blur-sm rounded-2xl border border-[#e7e6fc]/5 overflow-hidden">
            {/* Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#C026D3] to-indigo-600" />
            
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-400">Customization</span>
                <span className="text-[10px] text-[#aaa9be] uppercase tracking-wider">{selectedType.replace('-', ' ')} • {difficulty}</span>
              </div>

              {/* Include Hint */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-xl bg-[#111223] border border-[#464658]/10">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-[#e7e6fc]">Include Hint</span>
                  </div>
                  <Switch checked={includeHint} onCheckedChange={setIncludeHint} />
                </div>
                {includeHint && (
                  <textarea 
                    value={hintText}
                    onChange={e => setHintText(e.target.value)}
                    placeholder="Provide a helpful hint..."
                    className="w-full bg-[#111223] border border-[#464658]/20 rounded-xl p-3 text-xs text-[#e7e6fc] min-h-[80px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 resize-none"
                  />
                )}
              </div>

              {/* Reference Image */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase text-[#aaa9be] tracking-widest font-bold">Reference Image</span>
                <div className="border-2 border-dashed border-[#464658]/30 rounded-xl p-4 flex flex-col items-center text-center hover:border-fuchsia-600/40 cursor-pointer transition-colors bg-[#111223]">
                  <ImageIcon className="text-fuchsia-500 w-6 h-6 mb-2" />
                  <span className="text-sm font-medium text-[#e7e6fc]">Upload Image</span>
                  <div className="w-full h-px border-t border-[#464658]/20 my-4" />
                  <button className="flex items-center gap-1 text-fuchsia-400 text-[10px] uppercase tracking-wider font-bold">
                    <LinkIcon className="w-3 h-3" /> Add Link
                  </button>
                </div>
              </div>

              {/* Extra Context */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-[#aaa9be] tracking-widest font-bold">Extra Context / Feedback</span>
                <textarea 
                  value={extraContext}
                  onChange={e => setExtraContext(e.target.value)}
                  placeholder="Add explanation for the correct answer..."
                  className="w-full bg-[#111223] border border-[#464658]/20 rounded-xl p-3 text-xs text-[#e7e6fc] min-h-[80px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50 resize-none"
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-medium text-[#e7e6fc]">Time Limit</span>
                  <Switch checked={timeLimitEnabled} onCheckedChange={setTimeLimitEnabled} />
                </div>
                {timeLimitEnabled && (
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={timeLimit} 
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      className="bg-[#111223] border border-[#464658]/20 rounded-xl px-4 py-2 text-[#e7e6fc] focus:outline-none focus:border-fuchsia-500/50 w-24 text-center"
                    />
                    <span className="text-xs text-[#aaa9be] font-bold tracking-wider">SECONDS</span>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-[#464658]/20" />

              {/* Difficulty & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-[#aaa9be] tracking-widest font-bold pl-1">Difficulty</span>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-full bg-[#111223] border border-[#464658]/20 rounded-xl text-[#e7e6fc] focus:ring-1 focus:ring-fuchsia-500/50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111223] border-[#464658]/30 text-[#e7e6fc]">
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-[#aaa9be] tracking-widest font-bold pl-1">Points</span>
                  <input 
                    type="number"
                    value={points}
                    onChange={e => setPoints(Number(e.target.value))}
                    className="w-full bg-[#111223] border border-[#464658]/20 rounded-xl px-4 py-[9px] text-[#e7e6fc] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 flex gap-4 items-start">
            <Lightbulb className="text-[#6366F1] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#6366F1]">Expert Tip</h4>
              <p className="text-xs text-[#cfceeb] leading-relaxed">
                Add an explanation in the Extra Context field. Students learn better when they understand why an answer is correct immediately after attempting a question.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
