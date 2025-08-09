"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useInputDebug } from "@/hooks/use-debug"

type OptionFieldProps = {
  index: number
  value: string
  onChange: (val: string) => void
  onRemove: () => void
}

export default function OptionField({ index, value, onChange, onRemove }: OptionFieldProps) {
  const dbg = useInputDebug(`option-${index + 1}`)

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={dbg.ref as any}
        {...dbg.bind}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${index + 1}`}
        className="flex-1 rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 pointer-events-auto"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        inputMode="text"
      />
      <Button type="button" variant="outline" className="rounded-xl bg-transparent" onClick={onRemove}>
        Remove
      </Button>
    </div>
  )
}
