"use client"

import { Button } from "@/components/ui/button"
import { Network, Table2, Workflow } from "lucide-react"
import type { VisualDiagramData, VisualDiagramMode } from "@/lib/questions"

const cloneDiagram = (diagram: VisualDiagramData): VisualDiagramData => ({
  ...diagram,
  nodes: diagram.nodes.map((node) => ({ ...node })),
  edges: diagram.edges.map((edge) => ({ ...edge })),
  tableData: diagram.tableData ? diagram.tableData.map((row) => [...row]) : diagram.tableData,
})

export function createDefaultVisualDiagram(mode: VisualDiagramMode = "flowchart"): VisualDiagramData {
  if (mode === "table") {
    return {
      mode,
      nodes: [],
      edges: [],
      tableData: [["Header 1", "Header 2"], ["Value A", "Value B"]],
      rows: 2,
      columns: 2,
    }
  }

  if (mode === "mind_map") {
    return {
      mode,
      nodes: [
        { id: "node-main", label: "Core idea", x: 50, y: 50, kind: "topic" },
        { id: "node-a", label: "Branch A", x: 20, y: 25, kind: "idea" },
        { id: "node-b", label: "Branch B", x: 78, y: 28, kind: "idea" },
        { id: "node-c", label: "Branch C", x: 52, y: 75, kind: "idea" },
      ],
      edges: [
        { id: "edge-a", from: "node-main", to: "node-a", kind: "branch" },
        { id: "edge-b", from: "node-main", to: "node-b", kind: "branch" },
        { id: "edge-c", from: "node-main", to: "node-c", kind: "branch" },
      ],
    }
  }

  return {
    mode,
    nodes: [
      { id: "node-start", label: "Start", x: 12, y: 50, kind: "start" },
      { id: "node-step-1", label: "Process", x: 38, y: 50, kind: "task" },
      { id: "node-decision", label: "Decision", x: 62, y: 50, kind: "decision" },
      { id: "node-end", label: "End", x: 86, y: 50, kind: "end" },
    ],
    edges: [
      { id: "edge-1", from: "node-start", to: "node-step-1", kind: "arrow" },
      { id: "edge-2", from: "node-step-1", to: "node-decision", kind: "arrow" },
      { id: "edge-3", from: "node-decision", to: "node-end", kind: "arrow" },
    ],
  }
}

export default function VisualDiagramEditor({
  value,
  onChange,
}: {
  value: VisualDiagramData
  onChange: (next: VisualDiagramData) => void
}) {
  const diagram = value ?? createDefaultVisualDiagram("flowchart")

  const setMode = (mode: VisualDiagramMode) => {
    onChange(createDefaultVisualDiagram(mode))
  }

  const modeLabel = diagram.mode === "mind_map" ? "MIND MAP" : diagram.mode === "table" ? "TABLE" : "FLOWCHART"

  return (
    <div className="min-h-screen bg-[#0a0b1a] px-4 py-8 text-[#e7e6fc] md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight text-[#f3ecff]">Design your diagram</h1>
          <Button
            type="button"
            className="h-11 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 text-sm font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:brightness-110"
          >
            Use this diagram
          </Button>
        </div>

        <div className="rounded-[24px] border border-violet-500/20 bg-[#0d1220] p-6 shadow-[0_30px_80px_rgba(86,58,135,0.35)]">
          <div className="mb-6 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#a5a2c7]">Visual question type</p>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "flowchart", label: "Flowchart", icon: Workflow },
                { value: "mind_map", label: "Mind map", icon: Network },
                { value: "table", label: "Table", icon: Table2 },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value as VisualDiagramMode)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all",
                    diagram.mode === value
                      ? "border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                      : "border-white/10 bg-[#181d31] text-[#dfe3ff] hover:border-violet-400/30"
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#a5a2c7]">Studio canvas</p>
              <span className="rounded-lg border border-white/10 bg-[#1a2034] px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#f0ebff]">
                {modeLabel}
              </span>
            </div>

            <div className="relative h-[620px] overflow-hidden rounded-[22px] border border-white/10 bg-[#050b17]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.10),_transparent_35%)]" />
              <div className="absolute left-5 right-5 top-5 h-px bg-white/10" />

              {diagram.mode === "table" ? (
                <div className="relative z-10 h-full p-8">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1729]">
                    <table className="min-w-full border-collapse text-left text-sm text-[#e7e6fc]">
                      <tbody>
                        {(diagram.tableData ?? []).map((row, rowIndex) => (
                          <tr key={`studio-row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <td key={`studio-cell-${rowIndex}-${cellIndex}`} className="border border-white/10 p-4">
                                {cell || ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 h-full">
                  {diagram.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500/30 bg-[#101827] px-4 py-2 text-xs font-semibold text-[#f5efff] shadow-[0_0_18px_rgba(167,139,250,0.18)]"
                      style={{ left: `${node.x}%`, top: `${node.y}%`, minWidth: diagram.mode === "mind_map" ? 120 : 94 }}
                    >
                      {node.label}
                    </div>
                  ))}

                  <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                    {diagram.edges.map((edge) => {
                      const start = diagram.nodes.find((node) => node.id === edge.from)
                      const end = diagram.nodes.find((node) => node.id === edge.to)
                      if (!start || !end) return null

                      const startX = (start.x / 100) * 100
                      const startY = (start.y / 100) * 100
                      const endX = (end.x / 100) * 100
                      const endY = (end.y / 100) * 100

                      return (
                        <g key={edge.id}>
                          <line
                            x1={`${startX}%`}
                            y1={`${startY}%`}
                            x2={`${endX}%`}
                            y2={`${endY}%`}
                            stroke="rgba(168, 85, 247, 0.7)"
                            strokeWidth={2}
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
