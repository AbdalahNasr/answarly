"use client"

import { Palette, Paintbrush } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type DrawioStylePanelProps = {
  fillColors: string[]
  fillColor: string
  onFillColorChange: (color: string) => void
  onApplyFill: () => void
  strokeColors: string[]
  strokeColor: string
  onStrokeColorChange: (color: string) => void
  strokeWidth: number
  onStrokeWidthChange: (width: number) => void
  onApplyStroke: () => void
}

export function DrawioStylePanel({
  fillColors,
  fillColor,
  onFillColorChange,
  onApplyFill,
  strokeColors,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onApplyStroke,
}: DrawioStylePanelProps) {
  return (
    <>
      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Fill Color</span>
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-1.5">
            {fillColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onFillColorChange(color)}
                className={cn(
                  "h-7 rounded-lg border-2 transition-all",
                  fillColor === color ? "border-fuchsia-400 scale-110 shadow-[0_0_10px_rgba(192,38,211,0.4)]" : "border-white/10"
                )}
                style={{ background: color }}
              />
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onApplyFill}
            className="w-full h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/25 text-[10px] font-black uppercase tracking-widest"
          >
            <Paintbrush className="h-3 w-3 mr-1.5" /> Apply Fill
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Stroke</span>
        <div className="space-y-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="grid grid-cols-8 gap-1.5">
            {strokeColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onStrokeColorChange(color)}
                className={cn(
                  "h-7 rounded-lg border-2 transition-all",
                  strokeColor === color ? "border-violet-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.4)]" : "border-white/10"
                )}
                style={{ background: color }}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-[#aaa9be]">Stroke Width: {strokeWidth}px</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              min={1}
              max={8}
              step={1}
              className="py-1"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onApplyStroke}
            className="w-full h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 text-[10px] font-black uppercase tracking-widest"
          >
            <Palette className="h-3 w-3 mr-1.5" /> Apply Stroke
          </Button>
        </div>
      </div>
    </>
  )
}