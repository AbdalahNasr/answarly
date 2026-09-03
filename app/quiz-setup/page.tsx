import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Rocket, 
  Target, 
  Zap, 
  Clock, 
  HelpCircle,
  Dna,
  Atom,
  Globe2,
  Palette,
  ArrowRight,
  BrainCircuit
} from "lucide-react"

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<any>;
}

export default async function QuizSetupPage(props: PageProps) {
  // Await params to adhere to Next.js 16 async Request APIs rules
  const params = await props.params;
  const searchParams = await props.searchParams;

  const categories = [
    { id: "sci", label: "Science" },
    { id: "tech", label: "Technology" },
    { id: "bio", label: "Biology" },
    { id: "geo", label: "Geography" },
    { id: "art", label: "Art & Design" },
  ]

  const difficulties = [
    { id: "easy", label: "Beginner", icon: Rocket, desc: "Fundamental concepts and basic terms." },
    { id: "med", label: "Intermediate", icon: Target, desc: "Complex theories and practical application.", defaultChecked: true },
    { id: "hard", label: "Expert", icon: BrainCircuit, desc: "Advanced reasoning and deep specialization." }
  ]

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-[#e7e6fc] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-fuchsia-500/10 text-fuchsia-400 border-none px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase">
            Quiz Master Config
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Quiz Setup <span className="text-[#aaa9be] mx-2 font-light">/</span> إعداد الاختبار
          </h1>
          <p className="text-[#aaa9be] max-w-2xl mx-auto text-xl font-light">
            Configure your session parameters for the ultimate bilingual learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Categories & Difficulty */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Category Selection (Replaced with specific requirement: Styled Select) */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <Atom className="size-6 text-fuchsia-500" />
                Select Category
              </h2>
              <div className="max-w-md">
                <Select defaultValue="sci">
                  <SelectTrigger className="w-full h-14 bg-[#111223] border-none rounded-xl text-lg px-6 focus:ring-2 focus:ring-fuchsia-500/50 shadow-none">
                    <SelectValue placeholder="Choose a domain..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111223] border-none text-[#e7e6fc] rounded-xl shadow-2xl">
                    {categories.map((cat) => (
                      <SelectItem 
                        key={cat.id} 
                        value={cat.id} 
                        className="text-base py-3 focus:bg-fuchsia-500/20 focus:text-fuchsia-100"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Difficulty Selection */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <Zap className="size-6 text-indigo-400" />
                Challenge Level
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {difficulties.map((diff) => (
                  <label key={diff.id} className="cursor-pointer group relative block">
                    <input 
                      type="radio" 
                      name="difficulty" 
                      value={diff.id} 
                      defaultChecked={diff.defaultChecked}
                      className="absolute opacity-0 w-0 h-0 peer" 
                    />
                    <Card className="bg-[#111223] border-none rounded-2xl h-full transition-all peer-checked:shadow-[0_0_24px_rgba(192,38,211,0.3)] peer-checked:ring-2 peer-checked:ring-fuchsia-500 hover:bg-[#1d1e32]">
                      <CardContent className="p-6 space-y-4 text-center">
                        <div className="mx-auto size-14 rounded-full bg-[#0A0B1A] flex items-center justify-center text-white peer-checked:bg-gradient-to-br peer-checked:from-fuchsia-500 peer-checked:to-indigo-500 group-hover:bg-[#2b2d42] transition-colors">
                          <diff.icon className="size-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{diff.label}</h3>
                          <p className="text-[#aaa9be] text-sm mt-2 leading-relaxed">{diff.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Parameters & Start */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <Card className="bg-[#111223] border-none rounded-2xl p-4 sticky top-12">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Configuration</CardTitle>
                <CardDescription className="text-[#aaa9be]">Tweak the session intensity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-10">
                {/* Question Count */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#aaa9be] uppercase tracking-widest">Questions</h4>
                      <p className="text-3xl font-bold">15</p>
                    </div>
                    <HelpCircle className="size-5 text-[#464658]" />
                  </div>
                  <Slider 
                    defaultValue={[15]} 
                    max={50} 
                    step={5} 
                    className="[&_[data-slot=slider-range]]:bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-none [&_[data-slot=slider-thumb]]:ring-fuchsia-500/50" 
                  />
                </div>

                {/* Time Limit */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-[#aaa9be] uppercase tracking-widest">Time Limit</h4>
                      <p className="text-3xl font-bold">20 <span className="text-lg font-light text-[#aaa9be]">min</span></p>
                    </div>
                    <Clock className="size-5 text-[#464658]" />
                  </div>
                  <Slider 
                    defaultValue={[20]} 
                    max={60} 
                    step={1} 
                    className="[&_[data-slot=slider-range]]:bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-none [&_[data-slot=slider-thumb]]:ring-fuchsia-500/50" 
                  />
                </div>

                <div className="pt-8 space-y-4">
                  <Button variant="brand" className="w-full h-16 text-xl font-bold rounded-2xl group">
                    Begin Journey
                    <ArrowRight className="size-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-center text-xs text-[#aaa9be] font-light">
                    Estimated XP reward: <span className="text-fuchsia-400 font-bold">450 points</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
