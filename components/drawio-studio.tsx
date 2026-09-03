"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  Square,
  Circle,
  Diamond,
  Hexagon,
  Triangle,
  RectangleHorizontal,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Type,
  Image as ImageIcon,
  Database,
  Cylinder,
  Cloud,
  Monitor,
  Smartphone,
  Server,
  GitBranch,
  Workflow,
  Table2,
  FileText,
  Folder,
  User,
  Users,
  Settings,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Group,
  Ungroup,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DrawioStylePanel } from "@/components/drawio-style-panel"
import { DrawioTextPanel } from "@/components/drawio-text-panel"
import { useDrawioEditorActions } from "@/hooks/use-drawio-editor-actions"
import type { Editor } from "@tldraw/tldraw"
import type { VisualDiagramData } from "@/lib/questions"
import "@tldraw/tldraw/tldraw.css"

const TldrawEditor = dynamic(
  async () => (await import("@tldraw/tldraw")).Tldraw,
  { ssr: false }
)

type DrawioStudioProps = {
  persistenceKey?: string
  id?: string
  value?: VisualDiagramData
  onChange?: (data: VisualDiagramData) => void
  className?: string
}

const SHAPE_LIBRARY = [
  { group: "Basic", items: [
    { id: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
    { id: "square", label: "Square", icon: Square },
    { id: "circle", label: "Circle", icon: Circle },
    { id: "ellipse", label: "Ellipse", icon: Circle },
    { id: "diamond", label: "Diamond", icon: Diamond },
    { id: "triangle", label: "Triangle", icon: Triangle },
    { id: "hexagon", label: "Hexagon", icon: Hexagon },
  ]},
  { group: "Connectors", items: [
    { id: "arrow", label: "Arrow", icon: ArrowRight },
    { id: "connector", label: "Connector", icon: ArrowUpRight },
    { id: "line", label: "Line", icon: Minus },
    { id: "relation", label: "Relation", icon: GitBranch },
  ]},
  { group: "Flowchart", items: [
    { id: "process", label: "Process", icon: Workflow },
    { id: "decision", label: "Decision", icon: Diamond },
    { id: "terminator", label: "Terminator", icon: RectangleHorizontal },
    { id: "input", label: "Input/Output", icon: FileText },
    { id: "data", label: "Data", icon: Database },
  ]},
  { group: "Infrastructure", items: [
    { id: "server", label: "Server", icon: Server },
    { id: "database", label: "Database", icon: Cylinder },
    { id: "cloud", label: "Cloud", icon: Cloud },
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ]},
  { group: "Entities", items: [
    { id: "user", label: "User", icon: User },
    { id: "team", label: "Team", icon: Users },
    { id: "folder", label: "Folder", icon: Folder },
    { id: "file", label: "Document", icon: FileText },
    { id: "table", label: "Table", icon: Table2 },
  ]},
]

const FILL_COLORS = ["#1e1f33", "#2a2b4d", "#3b2f5e", "#1a3a5c", "#2c5a4a", "#5c3a3a", "#5c4a1a", "#0A0B1A"]
const STROKE_COLORS = ["#e7e6fc", "#C026D3", "#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#464658"]
const TEXT_COLORS = ["#e7e6fc", "#f3ecff", "#C026D3", "#6366F1", "#aaa9be", "#10B981"]

export default function DrawioStudio({
  persistenceKey = "answerly-drawio-studio-native-canvas-v2",
  id,
  value,
  onChange,
  className,
}: DrawioStudioProps) {
  const propsId = id || "drawio-studio"
  const editorRef = useRef<Editor | null>(null)
  const hasMountedRef = useRef(false)

  const [activePage, setActivePage] = useState(0)
  const [pages, setPages] = useState([
    { id: "page-1", name: "Page 1" },
    { id: "page-2", name: "Page 2" },
  ])
  const [gridVisible, setGridVisible] = useState(true)
  const [gridSize, setGridSize] = useState(24)
  const [showPageBounds, setShowPageBounds] = useState(true)
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Wide">("A4")
  const [zoom, setZoom] = useState(100)
  const [selectedCount, setSelectedCount] = useState(0)
  const [rightPanelTab, setRightPanelTab] = useState("diagram")
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [fillColor, setFillColor] = useState(FILL_COLORS[0])
  const [strokeColor, setStrokeColor] = useState(STROKE_COLORS[0])
  const [textColor, setTextColor] = useState(TEXT_COLORS[0])
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fontSize, setFontSize] = useState(14)
  const [boldText, setBoldText] = useState(false)
  const [italicText, setItalicText] = useState(false)
  const [underlineText, setUnderlineText] = useState(false)

  const persistenceKeyFinal = value?.persistenceKey || persistenceKey

  const {
    zoomIn,
    zoomOut,
    zoomToFit,
    applyFillColor,
    applyStrokeColor,
    applyTextProps,
    alignSelected,
    distH,
    distV,
    doGroup,
    doUngroup,
    doUndo,
    doRedo,
    doDelete,
    doDuplicate,
    addQuickShape,
    addTable,
  } = useDrawioEditorActions({
    editorRef,
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    fontSize,
    boldText,
    italicText,
  })

  const handleEditorMount = useCallback((editor: Editor) => {
    editorRef.current = editor
    hasMountedRef.current = true

    try {
      editor.user.updateUserPreferences({
        isSnapMode: true,
        isGridMode: gridVisible,
        gridSize: gridSize,
      })
    } catch {}

    try {
      editor.store.listen(() => {
        if (!onChange || !editorRef.current) return
        const allShapes = editorRef.current.getCurrentPageShapes()
        const snapshot = editorRef.current.store.getSnapshot()
        onChange({
          mode: "flowchart",
          nodes: allShapes.map((s) => ({
            id: s.id,
            label: (s.props as any)?.text || "",
            x: s.x,
            y: s.y,
            kind: s.type,
          })),
          edges: [],
          tldrawSnapshot: snapshot,
          persistenceKey: persistenceKeyFinal,
        })
      }, { source: "user", scope: "document" })
    } catch {}

    const updateSelection = () => {
      try {
        const sel = editorRef.current?.getSelectedShapes() || []
        setSelectedCount(sel.length)
      } catch {}
    }
    editor.store.listen(updateSelection, { scope: "selection" })
    updateSelection()
  }, [gridVisible, gridSize, onChange, persistenceKeyFinal])

  useEffect(() => {
    if (!editorRef.current) return
    try {
      editorRef.current.user.updateUserPreferences({
        isGridMode: gridVisible,
        gridSize: gridSize,
      })
    } catch {}
  }, [gridVisible, gridSize])

  return (
    <div
      id={propsId}
      className={cn(
        "drawio-studio-wrapper relative w-full rounded-2xl overflow-hidden bg-[#0b0c16] border border-white/10 shadow-2xl",
        className
      )}
      style={{ minHeight: 720 }}
    >
      {/* TOP TOOLBAR */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#111223] border-b border-white/10 z-30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(192,38,211,0.3)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-400">Answerly Studio</span>
            <span className="text-xs font-bold text-[#e7e6fc] mt-0.5">Draw.io Canvas</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-3" />
          <button
            type="button"
            onClick={doUndo}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center transition"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={doRedo}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center transition"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={doDuplicate}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center transition"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={doDelete}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => addTable(3, 3)}
            className="h-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-widest transition"
            title="Insert Table"
          >
            <Table2 className="h-3.5 w-3.5" /> Table
          </button>
        </div>

        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                {selectedCount} Selected
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-lg bg-white/5 px-1 py-1">
            <button
              type="button"
              onClick={zoomOut}
              className="h-7 w-7 rounded-md text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="w-14 text-center text-[10px] font-bold text-[#e7e6fc] tabular-nums">{zoom}%</div>
            <button
              type="button"
              onClick={zoomIn}
              className="h-7 w-7 rounded-md text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              type="button"
              onClick={zoomToFit}
              className="h-7 w-7 rounded-md text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center"
              title="Fit to screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed((v) => !v)}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center"
            title="Toggle shape library"
          >
            {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setRightPanelCollapsed((v) => !v)}
            className="h-8 w-8 rounded-lg bg-white/5 text-[#aaa9be] hover:text-[#e7e6fc] hover:bg-white/10 flex items-center justify-center"
            title="Toggle properties panel"
          >
            {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* PAGE TABS (between toolbar and main) */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#0f1024] border-b border-white/5 overflow-x-auto custom-scrollbar">
        {pages.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setActivePage(i)
              try { editorRef.current?.setCurrentPage(p.id) } catch {}
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all",
              activePage === i
                ? "bg-[#1b1d3a] text-[#e7e6fc] border border-white/10 shadow-inner"
                : "text-[#464658] hover:text-[#aaa9be] hover:bg-white/5"
            )}
          >
            <Layers className="h-3 w-3" />
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const idx = pages.length + 1
            const np = { id: `page-${idx}-${Date.now()}`, name: `Page ${idx}` }
            setPages([...pages, np])
          }}
          className="h-8 w-8 rounded-lg text-[#464658] hover:text-fuchsia-400 hover:bg-fuchsia-500/10 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* MAIN CANVAS AREA */}
      <div className="flex h-[560px]">
        {/* LEFT SHAPE LIBRARY */}
        {!leftPanelCollapsed && (
          <aside className="w-[220px] shrink-0 border-r border-white/10 bg-[#0e0f23] overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-6">
              {SHAPE_LIBRARY.map((group) => (
                <div key={group.group} className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">
                    {group.group}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addQuickShape(item.id)}
                        className="group relative flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 transition-all"
                        title={item.label}
                      >
                        <item.icon className="h-4.5 w-4.5 text-[#aaa9be] group-hover:text-fuchsia-400 transition-colors" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#6e6d8a] group-hover:text-[#e7e6fc] text-center leading-tight">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-3 border-t border-white/5">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">
                  Text & Media
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => addQuickShape("rectangle")}
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
                    title="Text Box"
                  >
                    <Type className="h-4.5 w-4.5 text-violet-400" />
                    <span className="text-[8px] font-bold uppercase text-violet-300">Text</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                    title="Image"
                  >
                    <ImageIcon className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="text-[8px] font-bold uppercase text-emerald-300">Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addTable(4, 3)}
                    className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
                    title="Table"
                  >
                    <Table2 className="h-4.5 w-4.5 text-amber-400" />
                    <span className="text-[8px] font-bold uppercase text-amber-300">Table</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CENTER TLDRAW CANVAS */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid & Page Boundary Overlay */}
          {showPageBounds && (
            <div
              className="pointer-events-none absolute z-10 mx-auto my-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-violet-500/25 rounded-md shadow-[0_0_80px_rgba(99,102,241,0.08)]"
              style={{
                width: pageSize === "A4" ? 794 : pageSize === "Letter" ? 816 : 1200,
                height: pageSize === "A4" ? 1123 : pageSize === "Letter" ? 1056 : 800,
                background: "rgba(15, 16, 36, 0.3)",
              }}
            >
              <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                {pages[activePage]?.name || "Page 1"} · {pageSize}
              </div>
            </div>
          )}

          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            {/* @ts-ignore - Tldraw dynamically loaded, SSR disabled */}
            <TldrawEditor
              persistenceKey={persistenceKeyFinal}
              options={{
                snapThreshold: 12,
                maxPages: 20,
                defaultName: pages[activePage]?.name || "Page",
              }}
              onMount={handleEditorMount}
              shapeUtils={undefined}
            />
          </div>

          {/* Inline Floating Settings Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 pointer-events-none">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#111223]/90 backdrop-blur-md border border-white/10 pointer-events-auto shadow-2xl">
              <div className="flex items-center gap-2 px-2">
                <Grid3X3 className="h-3.5 w-3.5 text-[#6e6d8a]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6e6d8a]">Grid</span>
                <Switch checked={gridVisible} onCheckedChange={setGridVisible} className="scale-[0.75]" />
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2 px-2 w-36">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6e6d8a]">Size</span>
                <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v))}>
                  <SelectTrigger className="h-7 bg-white/5 border-white/10 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111223] border-white/10 text-[#e7e6fc]">
                    {[8, 16, 24, 32, 48].map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">{n}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2 px-2">
                <Layers className="h-3.5 w-3.5 text-[#6e6d8a]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6e6d8a]">Bounds</span>
                <Switch checked={showPageBounds} onCheckedChange={setShowPageBounds} className="scale-[0.75]" />
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex items-center gap-2 px-2">
                <Settings className="h-3.5 w-3.5 text-[#6e6d8a]" />
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                  <SelectTrigger className="h-7 w-20 bg-white/5 border-white/10 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111223] border-white/10 text-[#e7e6fc]">
                    <SelectItem value="A4" className="text-xs">A4</SelectItem>
                    <SelectItem value="Letter" className="text-xs">Letter</SelectItem>
                    <SelectItem value="Wide" className="text-xs">Wide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        {!rightPanelCollapsed && (
          <aside className="w-[280px] shrink-0 border-l border-white/10 bg-[#0e0f23] overflow-y-auto custom-scrollbar">
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="w-full">
              <TabsList className="w-full rounded-none bg-[#111223] border-b border-white/10 p-1 grid grid-cols-4">
                {["diagram", "style", "text", "arrange"].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="h-9 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] data-[state=active]:bg-fuchsia-500/15 data-[state=active]:text-fuchsia-400 text-[#6e6d8a]"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* DIAGRAM TAB */}
              <TabsContent value="diagram" className="p-4 space-y-5 mt-0 border-none">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Page Setup</span>
                  <div className="space-y-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-[#aaa9be]">Paper Size</Label>
                      <Select value={pageSize} onValueChange={(v) => setPageSize(v as any)}>
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-[11px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111223] border-white/10 text-[#e7e6fc]">
                          <SelectItem value="A4" className="text-xs">A4 Portrait</SelectItem>
                          <SelectItem value="Letter" className="text-xs">Letter</SelectItem>
                          <SelectItem value="Wide" className="text-xs">Wide 16:9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                      <span className="text-[10px] font-bold uppercase text-[#aaa9be]">Show Page Boundary</span>
                      <Switch checked={showPageBounds} onCheckedChange={setShowPageBounds} className="scale-[0.8]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Canvas Grid</span>
                  <div className="space-y-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                      <span className="text-[10px] font-bold uppercase text-[#aaa9be]">Visible Grid</span>
                      <Switch checked={gridVisible} onCheckedChange={setGridVisible} className="scale-[0.8]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-[#aaa9be]">Grid Spacing: {gridSize}px</Label>
                      <Slider
                        value={[gridSize]}
                        onValueChange={(v) => setGridSize(v[0])}
                        min={8} max={64} step={8}
                        className="py-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Table Insert</span>
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    {[
                      { r: 2, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 3 },
                    ].map((s) => (
                      <button
                        key={`${s.r}-${s.c}`}
                        type="button"
                        onClick={() => addTable(s.r, s.c)}
                        className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/10 text-center transition-all"
                      >
                        <Table2 className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                        <span className="text-[9px] font-black uppercase text-[#aaa9be]">{s.r}×{s.c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* STYLE TAB */}
              <TabsContent value="style" className="p-4 space-y-5 mt-0 border-none">
                <DrawioStylePanel
                  fillColors={FILL_COLORS}
                  fillColor={fillColor}
                  onFillColorChange={setFillColor}
                  onApplyFill={applyFillColor}
                  strokeColors={STROKE_COLORS}
                  strokeColor={strokeColor}
                  onStrokeColorChange={setStrokeColor}
                  strokeWidth={strokeWidth}
                  onStrokeWidthChange={setStrokeWidth}
                  onApplyStroke={applyStrokeColor}
                />
              </TabsContent>

              {/* TEXT TAB */}
              <TabsContent value="text" className="p-4 space-y-5 mt-0 border-none">
                <DrawioTextPanel
                  textColors={TEXT_COLORS}
                  textColor={textColor}
                  onTextColorChange={setTextColor}
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  boldText={boldText}
                  onBoldTextChange={setBoldText}
                  italicText={italicText}
                  onItalicTextChange={setItalicText}
                  underlineText={underlineText}
                  onUnderlineTextChange={setUnderlineText}
                  onApplyTextProps={applyTextProps}
                />
              </TabsContent>

              {/* ARRANGE TAB */}
              <TabsContent value="arrange" className="p-4 space-y-5 mt-0 border-none">
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Align Horizontal</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "left", icon: AlignStartHorizontal, label: "Left" },
                      { id: "center-h", icon: AlignCenterHorizontal, label: "Center" },
                      { id: "right", icon: AlignEndHorizontal, label: "Right" },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => alignSelected(a.id as any)}
                        className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 transition-all disabled:opacity-40"
                        disabled={selectedCount < 2}
                      >
                        <a.icon className="h-4 w-4 text-fuchsia-400" />
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#aaa9be]">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Align Vertical</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "top", icon: AlignStartVertical, label: "Top" },
                      { id: "center-v", icon: AlignCenterVertical, label: "Middle" },
                      { id: "bottom", icon: AlignEndVertical, label: "Bottom" },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => alignSelected(a.id as any)}
                        className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-violet-500/30 hover:bg-violet-500/10 transition-all disabled:opacity-40"
                        disabled={selectedCount < 2}
                      >
                        <a.icon className="h-4 w-4 text-violet-400" />
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#aaa9be]">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Distribute</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={distH}
                      className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                      disabled={selectedCount < 3}
                    >
                      <AlignHorizontalSpaceAround className="h-4 w-4 text-emerald-400" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-[#aaa9be]">Horizontally</span>
                    </button>
                    <button
                      type="button"
                      onClick={distV}
                      className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all disabled:opacity-40"
                      disabled={selectedCount < 3}
                    >
                      <AlignVerticalSpaceAround className="h-4 w-4 text-emerald-400" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-[#aaa9be]">Vertically</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#464658] ml-1">Grouping</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={doGroup}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/10 transition-all disabled:opacity-40"
                      disabled={selectedCount < 2}
                    >
                      <Group className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#aaa9be]">Group</span>
                    </button>
                    <button
                      type="button"
                      onClick={doUngroup}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/30 hover:bg-amber-500/10 transition-all"
                    >
                      <Ungroup className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#aaa9be]">Ungroup</span>
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}
      </div>
    </div>
  )
}
