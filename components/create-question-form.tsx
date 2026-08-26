"use client"

import React, { useState } from "react"
import type { Difficulty, QuestionType } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ListChecks, ToggleLeft, Code2, PenLine, Headphones,
  FormInput, Shuffle, AlignJustify, Plus, Trash2, Bold, Italic, 
  ImageIcon, Link as LinkIcon, Paperclip, Lightbulb, Mic
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n"
import { motion, AnimatePresence } from "framer-motion"

const QUESTION_TYPES: Array<{ id: QuestionType; label: string; icon: React.ReactNode }> = [
  { id: "multiple_choice", label: "Multiple Choice", icon: <ListChecks className="w-6 h-6" /> },
  { id: "true_false", label: "True / False", icon: <ToggleLeft className="w-6 h-6" /> },
  { id: "code_snippet", label: "Code Block", icon: <Code2 className="w-6 h-6" /> },
  { id: "open_ended", label: "Short Answer", icon: <PenLine className="w-6 h-6" /> },
  { id: "listening", label: "Audio Response", icon: <Headphones className="w-6 h-6" /> },
  { id: "fill_in_blank", label: "Fill Blanks", icon: <FormInput className="w-6 h-6" /> },
  { id: "match_pairs", label: "Matching", icon: <Shuffle className="w-6 h-6" /> },
  { id: "ordering" as any, label: "Ordering", icon: <AlignJustify className="w-6 h-6" /> },
]

interface CreateQuestionFormProps {
  onAdded?: () => void
}

export function CreateQuestionForm({ onAdded }: CreateQuestionFormProps) {
  const { toast } = useToast()
  const { lang } = useI18n()
  
  // Existing Logic & State
  const [selectedType, setSelectedType] = useState<QuestionType>("multiple_choice")
  const [heading, setHeading] = useState("")
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [category, setCategory] = useState("")
  const [points, setPoints] = useState("10")
  const [options, setOptions] = useState<string[]>(["", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState<string>("0")
  
  // Sidebar states
  const [includeHint, setIncludeHint] = useState(false)
  const [hintText, setHintText] = useState("")
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimit, setTimeLimit] = useState(30)

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addOption = () => setOptions([...options, ""])
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

  const handleSave = async (publish: boolean = false) => {
    if (!question.trim()) {
      toast({ title: "Validation error", description: "Question content is required", variant: "destructive" })
      return
    }
    toast({ title: "Success", description: publish ? "Question published!" : "Question saved as draft" })
    if (onAdded) onAdded()
  }

  return (
    <div className="w-full bg-[#0A0B1A] min-h-screen text-[#e7e6fc] font-inter">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 pt-8">
        
        {/* MAIN FORM AREA */}
        <div className="flex-1 space-y-12">
          
          {/* 1. SELECT QUESTION TYPE */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-[#6366F1]">1. Select Question Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUESTION_TYPES.map((type) => {
                const isSelected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 border-2
                      ${isSelected 
                        ? 'bg-[#111223] border-fuchsia-600 shadow-[0_0_20px_rgba(192,38,211,0.3)]' 
                        : 'bg-[#111223] border-transparent hover:bg-[#1d1e32]'
                      }
                    `}
                  >
                    <div className={isSelected ? 'text-fuchsia-400' : 'text-[#aaa9be]'}>
                      {type.icon}
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-[#e7e6fc]' : 'text-[#aaa9be]'}`}>
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* 2. QUESTION CONTENT */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-[#6366F1]">2. Question Content</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Question heading (optional)"
                value={heading}
                onChange={e => setHeading(e.target.value)}
                className="w-full bg-[#1d1e32] rounded-xl px-4 py-3 text-[#e7e6fc] border-none focus:outline-none focus:ring-2 focus:ring-fuchsia-600/40"
              />

              <div className="bg-[#111223] rounded-2xl overflow-hidden">
                {/* TOOLBAR */}
                <div className="bg-[#1d1e32] px-3 py-2 border-b border-[#464658]/20 flex items-center gap-1">
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><Bold className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><Italic className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><Code2 className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-[#464658]/30 mx-1" />
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><ImageIcon className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><LinkIcon className="w-4 h-4" /></button>
                  <button className="p-1.5 rounded text-[#aaa9be] hover:text-[#e7e6fc]"><Paperclip className="w-4 h-4" /></button>
                </div>

                <textarea
                  placeholder="Enter your question here..."
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  className="w-full bg-transparent p-6 min-h-[160px] text-[#e7e6fc] leading-relaxed resize-none focus:outline-none placeholder:text-[#464658]"
                />
              </div>
            </div>
          </section>

          {/* 3. ANSWER OPTIONS */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-[#6366F1]">3. Answer Options</h2>
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {(selectedType === "multiple_choice" || selectedType === "image_mcq" as any) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="space-y-4">
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="flex-1 bg-[#111223] rounded-xl flex items-center px-4 border-none focus-within:ring-2 focus-within:ring-fuchsia-600/40 transition-all">
                            <span className="text-fuchsia-400 font-bold mr-3">{String.fromCharCode(65 + i)}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(i, e.target.value)}
                              className="w-full bg-transparent border-none py-3 text-[#e7e6fc] focus:outline-none placeholder:text-[#464658]"
                              placeholder={`Option ${i + 1}`}
                            />
                          </div>
                          <RadioGroupItem 
                            value={String(i)} 
                            className="w-6 h-6 border-2 border-[#464658] text-white data-[state=checked]:bg-fuchsia-600 data-[state=checked]:border-fuchsia-600"
                          />
                          {options.length > 2 && (
                            <button onClick={() => removeOption(i)} className="text-[#464658] hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    <button 
                      onClick={addOption}
                      className="w-full py-4 border-2 border-dashed border-fuchsia-600/30 rounded-xl text-[#aaa9be] hover:text-fuchsia-400 hover:border-fuchsia-600/50 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <Plus className="w-4 h-4" /> Add Option
                    </button>
                  </motion.div>
                )}

                {selectedType === "true_false" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-6">
                    {["true", "false"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setCorrectAnswer(val)}
                        className={`
                          p-6 rounded-2xl flex flex-col items-center gap-3 transition-all border-none font-bold uppercase tracking-widest
                          ${correctAnswer === val ? 'bg-fuchsia-600 text-white shadow-lg' : 'bg-[#111223] text-[#aaa9be] hover:bg-[#1d1e32]'}
                        `}
                      >
                        {val === "true" ? "True" : "False"}
                      </button>
                    ))}
                  </motion.div>
                )}
                
                {selectedType === "open_ended" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <textarea 
                      placeholder="Expected answer..."
                      className="w-full bg-[#111223] rounded-xl p-4 text-[#e7e6fc] border-none focus:outline-none focus:ring-2 focus:ring-fuchsia-600/40 min-h-[100px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* BOTTOM BUTTON */}
          <div className="pt-8">
            <button 
              onClick={() => handleSave(false)}
              className="py-5 rounded-2xl w-full bg-gradient-to-r from-[#C026D3] via-[#9333EA] to-pink-600 text-white font-extrabold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
            >
              <Plus className="w-6 h-6" /> Add Another Question
            </button>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full lg:w-[380px] space-y-6">
          <div className="bg-[#111223] rounded-xl overflow-hidden relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-600 to-indigo-600" />
            <div className="p-6 space-y-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-500">CUSTOMIZATION</span>
              </div>

              {/* Include Hint */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 rounded-xl bg-[#0A0B1A]">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold">Include Hint</span>
                  </div>
                  <Switch checked={includeHint} onCheckedChange={setIncludeHint} />
                </div>
                {includeHint && (
                  <textarea 
                    value={hintText}
                    onChange={e => setHintText(e.target.value)}
                    placeholder="Enter hint text..."
                    className="w-full bg-[#0A0B1A] rounded-xl p-3 text-xs text-[#e7e6fc] border-none focus:ring-1 focus:ring-fuchsia-500/50 min-h-[80px]"
                  />
                )}
              </div>

              {/* Reference Image */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase text-[#464658] tracking-widest font-black">Reference Image</span>
                <div className="bg-[#0A0B1A] p-8 rounded-xl flex flex-col items-center gap-3 border-2 border-dashed border-[#1d1e32] cursor-pointer hover:border-fuchsia-500/40">
                  <ImageIcon className="text-fuchsia-500 w-6 h-6" />
                  <span className="text-xs font-bold text-[#aaa9be]">Attach Media</span>
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">Time Limit</span>
                  <Switch checked={timeLimitEnabled} onCheckedChange={setTimeLimitEnabled} />
                </div>
                {timeLimitEnabled && (
                  <div className="flex items-center gap-3 bg-[#0A0B1A] p-3 rounded-xl">
                    <input 
                      type="number" 
                      value={timeLimit} 
                      onChange={e => setTimeLimit(Number(e.target.value))}
                      className="bg-transparent border-none w-16 text-center text-fuchsia-400 font-bold focus:outline-none"
                    />
                    <span className="text-[10px] font-black uppercase text-[#464658]">Seconds</span>
                  </div>
                )}
              </div>

              {/* Difficulty & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#464658]">Difficulty</span>
                  <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                    <SelectTrigger className="bg-[#0A0B1A] border-none rounded-xl text-[#e7e6fc]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111223] border-none text-white">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#464658]">Points</span>
                  <input 
                    type="number"
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                    className="w-full bg-[#0A0B1A] rounded-xl px-4 py-[9px] text-[#e7e6fc] border-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Expert Tip */}
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#6366F1]">Expert Tip</span>
                </div>
                <p className="text-[11px] text-[#aaa9be] leading-relaxed">
                  Adding an explanation in the Extra Context field helps students learn better by understanding the "why".
                </p>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
