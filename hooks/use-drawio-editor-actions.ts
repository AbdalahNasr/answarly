import type { MutableRefObject } from "react"
import type { Editor } from "@tldraw/tldraw"

export type AlignmentAxis = "left" | "center-h" | "right" | "top" | "center-v" | "bottom"

type UseDrawioEditorActionsOptions = {
  editorRef: MutableRefObject<Editor | null>
  fillColor: string
  strokeColor: string
  strokeWidth: number
  textColor: string
  fontSize: number
  boldText: boolean
  italicText: boolean
}

export function useDrawioEditorActions({
  editorRef,
  fillColor,
  strokeColor,
  strokeWidth,
  textColor,
  fontSize,
  boldText,
  italicText,
}: UseDrawioEditorActionsOptions) {
  const zoomIn = () => {
    if (!editorRef.current) return
    try { editorRef.current.zoomIn() } catch {}
  }

  const zoomOut = () => {
    if (!editorRef.current) return
    try { editorRef.current.zoomOut() } catch {}
  }

  const zoomToFit = () => {
    if (!editorRef.current) return
    try { editorRef.current.zoomToFit() } catch {}
  }

  const applyFillColor = () => {
    if (!editorRef.current) return
    try {
      editorRef.current.getSelectedShapes().forEach((shape) => {
        editorRef.current?.updateShape(shape.id, { props: { fill: fillColor } as any })
      })
    } catch {}
  }

  const applyStrokeColor = () => {
    if (!editorRef.current) return
    try {
      editorRef.current.getSelectedShapes().forEach((shape) => {
        editorRef.current?.updateShape(shape.id, {
          props: { stroke: strokeColor, strokeWidth } as any,
        })
      })
    } catch {}
  }

  const applyTextProps = () => {
    if (!editorRef.current) return
    try {
      editorRef.current.getSelectedShapes().forEach((shape) => {
        const props: any = { color: textColor, fontSize }
        if (boldText) props.fontWeight = 700
        if (italicText) props.fontStyle = "italic"
        editorRef.current?.updateShape(shape.id, { props })
      })
    } catch {}
  }

  const alignSelected = (axis: AlignmentAxis) => {
    if (!editorRef.current) return
    try {
      switch (axis) {
        case "left": editorRef.current.alignLeft(); break
        case "center-h": editorRef.current.alignHorizontalCenter(); break
        case "right": editorRef.current.alignRight(); break
        case "top": editorRef.current.alignTop(); break
        case "center-v": editorRef.current.alignVerticalCenter(); break
        case "bottom": editorRef.current.alignBottom(); break
      }
    } catch {}
  }

  const distH = () => { try { editorRef.current?.distributeHorizontally() } catch {} }
  const distV = () => { try { editorRef.current?.distributeVertically() } catch {} }
  const doGroup = () => { try { editorRef.current?.group() } catch {} }
  const doUngroup = () => { try { editorRef.current?.ungroup() } catch {} }
  const doUndo = () => { try { editorRef.current?.undo() } catch {} }
  const doRedo = () => { try { editorRef.current?.redo() } catch {} }
  const doDelete = () => { try { editorRef.current?.deleteShapes(editorRef.current?.getSelectedShapeIds() || []) } catch {} }
  const doDuplicate = () => { try { editorRef.current?.duplicateShapes(editorRef.current?.getSelectedShapeIds() || []) } catch {} }

  const addQuickShape = (kind: string) => {
    if (!editorRef.current) return
    try {
      const editor = editorRef.current
      const { x: cx, y: cy } = editor.viewportPageCenter ?? { x: 200, y: 200 }
      let geo = "rectangle"
      switch (kind) {
        case "square": case "rectangle": case "process": case "terminator": geo = "rectangle"; break
        case "circle": case "ellipse": geo = "ellipse"; break
        case "diamond": case "decision": geo = "diamond"; break
        case "triangle": geo = "triangle"; break
        case "hexagon": geo = "pentagon"; break
      }
      editor.createShape({
        type: "geo",
        x: cx - 80,
        y: cy - 40,
        props: {
          geo,
          w: 160,
          h: 80,
          text: kind[0].toUpperCase() + kind.slice(1).replace(/[_-]/g, " "),
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
          color: textColor,
          fontSize,
        } as any,
      })
    } catch {}
  }

  const addTable = (rows: number = 3, cols: number = 3) => {
    if (!editorRef.current) return
    try {
      const { x: cx, y: cy } = editorRef.current.viewportPageCenter ?? { x: 200, y: 200 }
      editorRef.current.createShape({
        type: "embed",
        x: cx - 120,
        y: cy - 60,
        props: {
          w: 240,
          h: 120,
          url: `data:text/plain,Table%20${rows}x${cols}`,
        } as any,
      })
    } catch {}
  }

  return {
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
  }
}