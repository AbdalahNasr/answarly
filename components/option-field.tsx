"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useInputDebug } from "@/hooks/use-debug"
import { X } from "lucide-react"

type OptionFieldProps = {
  index: number
  value: string
  onChange: (val: string) => void
  onRemove: () => void
}

export default function OptionField({ index, value, onChange, onRemove }: OptionFieldProps) {
  const dbg = useInputDebug(`option-${index + 1}`)

  return (
    <div className="flex items-center gap-3 group/opt">
      <div className="relative flex-1">
        <Input
          ref={dbg.ref as any}
          {...dbg.bind}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Response Variant ${index + 1}`}
          className="h-14 rounded-2xl bg-background/50 border-none px-6 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary/40 transition-all shadow-inner placeholder:text-muted-foreground/20"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
        />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary/20 rounded-full group-hover/opt:bg-primary transition-colors" />
      </div>
      <Button 
        type="button" 
        variant="ghost" 
        size="icon"
        className="h-14 w-14 rounded-2xl bg-background/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all border border-white/5" 
        onClick={onRemove}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
}
