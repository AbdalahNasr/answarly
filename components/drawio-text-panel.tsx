"use client"

import { Bold, Italic, Type, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type DrawioTextPanelProps = {
  textColors: string[]
  textColor: string
  onTextColorChange: (color: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  boldText: boolean
  onBoldTextChange: (value: boolean) => void
  italicText: boolean
  onItalicTextChange: (value: boolean) => void
  underlineText: boolean
  onUnderlineTextChange: (value: boolean) => void
  onApplyTextProps: () => void
}

export function DrawioTextPanel({
  textColors,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange,
  boldText,
  onBoldTextChange,
  italicText,
  onItalicTextChange,
  underlineText,
  onUnderlineTextChange,
  onApplyTextProps,
}: DrawioTextPanelProps) {
  return (
    <>
      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Typography</span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
          <button
            type="button"
            onClick={() => onBoldTextChange(!boldText)}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md transition",
              boldText ? "bg-emerald-500/20 text-emerald-300" : "text-[#aaa9be] hover:text-[#e7e6fc]"
            )}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onItalicTextChange(!italicText)}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md transition",
              italicText ? "bg-emerald-500/20 text-emerald-300" : "text-[#aaa9be] hover:text-[#e7e6fc]"
            )}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUnderlineTextChange(!underlineText)}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md transition",
              underlineText ? "bg-emerald-500/20 text-emerald-300" : "text-[#aaa9be] hover:text-[#e7e6fc]"
            )}
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Font Size</span>
        <div className="space-y-2">
          <Slider value={[fontSize]} onValueChange={(value) => onFontSizeChange(value[0])} min={8} max={48} step={1} />
          <div className="text-xs text-[#e7e6fc] text-center font-mono">{fontSize}px</div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Text Color</span>
        <div className="grid grid-cols-6 gap-1.5">
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onTextColorChange(color)}
              className={cn(
                "h-8 rounded-lg border-2 transition-all",
                textColor === color ? "border-emerald-400 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "border-white/10"
              )}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <Button
        type="button"
        onClick={onApplyTextProps}
        className="w-full h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-black uppercase tracking-widest"
      >
        <Type className="h-3 w-3 mr-1.5" /> Apply Text Style
      </Button>
    </>
  )
}