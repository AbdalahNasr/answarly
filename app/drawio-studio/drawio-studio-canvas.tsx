"use client"

/* Violet Workshop: a focused dark studio shell framing a bright drafting canvas. */
// Draw.io Studio editor: a dark workbench keeps Answerly navigation above native diagram commands, pages, and inspectors.
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import "./drawio-studio.css";
import LanguageToggle from "@/components/language-toggle";
import ThemeToggle from "@/components/theme-toggle";

// Loaded separately from the rest of the shell so the header, toolbar, and
// sidebars can paint immediately instead of waiting on tldraw's own bundle.
const Tldraw = dynamic(() => import("@tldraw/tldraw").then((mod) => mod.Tldraw), {
  ssr: false,
  loading: () => <div className="canvas-loading">Loading canvas…</div>,
});
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold,
  Check,
  ChevronDown,
  Circle,
  Cloud,
  Copy,
  Database,
  Diamond,
  Download,
  Eraser,
  Eye,
  FileText,
  GitBranch,
  GraduationCap,
  GripVertical,
  Hand,
  Image,
  Italic,
  Layers3,
  Lock,
  Menu,
  MessageSquare,
  Minus,
  MoreHorizontal,
  MousePointer2,
  MoveRight,
  Network,
  PanelRight,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Square,
  Table2,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

type IconComponent = typeof MousePointer2;

type Tool = {
  label: string;
  icon: IconComponent;
};
type LibraryShape = { label: string; icon: IconComponent; type: "geo" | "arrow" | "line" | "note" | "table"; geo?: string; doubleHeaded?: boolean; bend?: number; width?: number; height?: number; preview?: string };

type Point = { x: number; y: number };
type InkStroke = { points: Point[]; mode: "draw" | "erase" };
type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type CanvasObjectKind = "rectangle" | "frame" | "ellipse" | "diamond" | "polygon" | "table" | "text" | "comment" | "image" | "line" | "arrow" | "connector";
type CanvasObject = {
  id: string;
  kind: CanvasObjectKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  src?: string;
  fill: string;
  stroke: string;
  opacity: number;
  textColor: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textAlign: "left" | "center" | "right";
  locked: boolean;
};
type CanvasInteraction = { mode: "create" | "move" | "pan" | "resize"; kind?: CanvasObjectKind; start: Point; objectId?: string; origin?: Point; handle?: ResizeHandle; originalObject?: CanvasObject };
type DirectionalResizeInteraction = { object: CanvasObject; handle: ResizeHandle; pointerStart: Point; start: Point; end: Point; unit: Point; length: number; resizeStart: boolean; pointerId: number };
type NativeDirectionalFrame = { id: any; left: number; top: number; width: number; height: number };
type NativeFrameDrag = { id: any; shape: any; bounds: any; handle: ResizeHandle; pointerStart: Point; pointerId: number; moveStart: boolean; mode: "length" | "height"; bend: number; unit: Point; cleanup?: () => void };
type NativeArrowControl = "rotate" | "adjust";
type NativeArrowControlDrag = { id: any; shape: any; control: NativeArrowControl; pointerStart: Point; pointerId: number; center: Point; rotation: number; bend: number; unit: Point; cleanup?: () => void };
type RelationDirection = "n" | "e" | "s" | "w";
type NativeRelationFrame = { id: any; left: number; top: number; width: number; height: number };
type NativeRelationDrag = { sourceId: any; direction: RelationDirection; pointerId: number; cleanup?: () => void };
type EditorPageTab = { id: any; name: string };
type EditorCommand = "save" | "new-page" | "fit" | "toggle-grid" | "toggle-page" | "select-all" | "clear-selection" | "front" | "back" | "help";

const studioTools: Tool[] = [
  { label: "Select", icon: MousePointer2 },
  { label: "Pan", icon: Hand },
  { label: "Draw", icon: Pencil },
  { label: "Eraser", icon: Eraser },
  { label: "Text", icon: Type },
  { label: "Line", icon: Minus },
  { label: "Arrow", icon: MoveRight },
  { label: "Connector", icon: GitBranch },
  { label: "Rectangle", icon: Square },
  { label: "Frame", icon: Square },
  { label: "Ellipse", icon: Circle },
  { label: "Diamond", icon: Diamond },
  { label: "Polygon", icon: Triangle },
  { label: "Table", icon: Table2 },
  { label: "Image", icon: Image },
  { label: "Comment", icon: MessageSquare },
];

const shapeCategories: { label: string; items: LibraryShape[] }[] = [
  { label: "Basic", items: [
    { label: "Rectangle", icon: Square, type: "geo", geo: "rectangle", preview: "process" }, { label: "Ellipse", icon: Circle, type: "geo", geo: "ellipse", preview: "terminator" }, { label: "Cloud", icon: Cloud, type: "geo", geo: "cloud", preview: "cloud" }, { label: "Diamond", icon: Diamond, type: "geo", geo: "diamond", preview: "decision" }, { label: "Triangle", icon: Triangle, type: "geo", geo: "triangle", preview: "triangle" }, { label: "Note", icon: FileText, type: "note", preview: "document" },
  ] },
  { label: "Flowchart", items: [
    { label: "Process", icon: Square, type: "geo", geo: "rectangle", preview: "process" }, { label: "Decision", icon: Diamond, type: "geo", geo: "diamond", preview: "decision" }, { label: "Terminator", icon: Circle, type: "geo", geo: "oval", preview: "terminator" }, { label: "Input / Output", icon: MoveRight, type: "geo", geo: "trapezoid", preview: "input" }, { label: "Preparation", icon: Triangle, type: "geo", geo: "hexagon", preview: "preparation" }, { label: "Document", icon: FileText, type: "note", preview: "document" }, { label: "Database", icon: Database, type: "geo", geo: "ellipse", preview: "database" }, { label: "Delay", icon: Circle, type: "geo", geo: "oval", preview: "delay" },
  ] },
  { label: "Arrows", items: [
    { label: "Block right arrow", icon: ArrowRight, type: "geo", geo: "arrow-right", width: 150, height: 76, preview: "block-right" }, { label: "Block left arrow", icon: ArrowLeft, type: "geo", geo: "arrow-left", width: 150, height: 76, preview: "block-left" }, { label: "Block up arrow", icon: ArrowUp, type: "geo", geo: "arrow-up", width: 76, height: 150, preview: "block-up" }, { label: "Block down arrow", icon: ArrowDown, type: "geo", geo: "arrow-down", width: 76, height: 150, preview: "block-down" }, { label: "Double block arrow", icon: ArrowRight, type: "arrow", doubleHeaded: true, preview: "block-double" }, { label: "Chevron arrow", icon: MoveRight, type: "geo", geo: "arrow-right", preview: "block-chevron" }, { label: "Notched arrow", icon: MoveRight, type: "geo", geo: "arrow-right", preview: "block-notch" }, { label: "Split arrow", icon: GitBranch, type: "arrow", bend: 55, preview: "block-split" }, { label: "Bent right arrow", icon: MoveRight, type: "arrow", bend: 90, preview: "block-bent-right" }, { label: "Bent down arrow", icon: ArrowDown, type: "arrow", bend: -90, preview: "block-bent-down" }, { label: "Circular arrow", icon: RotateCcw, type: "arrow", bend: 160, preview: "block-cycle" }, { label: "Straight connector", icon: GitBranch, type: "arrow", preview: "connector" }, { label: "Line", icon: Minus, type: "line", preview: "line" },
  ] },
  { label: "UML", items: [
    { label: "Table", icon: Table2, type: "table", preview: "table" }, { label: "Association", icon: GitBranch, type: "arrow", preview: "connector" }, { label: "Use case", icon: Circle, type: "geo", geo: "ellipse", preview: "terminator" }, { label: "Class", icon: Square, type: "geo", geo: "rectangle", preview: "process" },
  ] },
];

const secondaryLibraries: { label: string; icon: IconComponent; items: LibraryShape[] }[] = [
  { label: "Network", icon: Network, items: [{ label: "Network node", icon: Circle, type: "geo", geo: "ellipse", preview: "terminator" }, { label: "Network cloud", icon: Cloud, type: "geo", geo: "cloud", preview: "cloud" }, { label: "Network connector", icon: GitBranch, type: "arrow", preview: "connector" }] },
  { label: "Database", icon: Database, items: [{ label: "Database", icon: Database, type: "geo", geo: "ellipse", preview: "database" }, { label: "Database table", icon: Table2, type: "table", preview: "table" }, { label: "Data flow", icon: ArrowRight, type: "arrow", preview: "connector" }] },
  { label: "Mind map", icon: GitBranch, items: [{ label: "Central topic", icon: Circle, type: "geo", geo: "ellipse", preview: "terminator" }, { label: "Topic", icon: Square, type: "geo", geo: "rectangle", preview: "process" }, { label: "Branch", icon: GitBranch, type: "arrow", bend: 50, preview: "connector" }] },
  { label: "BPMN", icon: Layers3, items: [{ label: "Start event", icon: Circle, type: "geo", geo: "ellipse", preview: "terminator" }, { label: "Gateway", icon: Diamond, type: "geo", geo: "diamond", preview: "decision" }, { label: "Task", icon: Square, type: "geo", geo: "rectangle", preview: "process" }] },
  { label: "Education", icon: GraduationCap, items: [{ label: "Lesson card", icon: Square, type: "geo", geo: "rectangle", preview: "process" }, { label: "Knowledge check", icon: Diamond, type: "geo", geo: "diamond", preview: "decision" }, { label: "Explanation note", icon: FileText, type: "note", preview: "document" }] },
];

const toolToObjectKind: Record<string, CanvasObjectKind> = {
  Rectangle: "rectangle",
  Frame: "frame",
  Ellipse: "ellipse",
  Diamond: "diamond",
  Polygon: "polygon",
  Table: "table",
  Text: "text",
  Comment: "comment",
  Line: "line",
  Arrow: "arrow",
  Connector: "connector",
};

const templates = [
  {
    title: "Explain a process",
    preview: "process",
  },
  {
    title: "Unpack a concept",
    preview: "decision",
  },
  {
    title: "Map a system",
    preview: "cloud",
  },
];

const editorMenuItems: Record<string, { label: string; command: EditorCommand }[]> = {
  File: [{ label: "Save diagram", command: "save" }, { label: "New page", command: "new-page" }],
  Edit: [{ label: "Select all", command: "select-all" }, { label: "Clear selection", command: "clear-selection" }],
  View: [{ label: "Fit canvas", command: "fit" }, { label: "Show / hide grid", command: "toggle-grid" }, { label: "Show / hide page", command: "toggle-page" }],
  Arrange: [{ label: "Bring to front", command: "front" }, { label: "Send to back", command: "back" }],
  Extras: [{ label: "New page", command: "new-page" }, { label: "Fit canvas", command: "fit" }],
  Help: [{ label: "Canvas help", command: "help" }],
};

const framedResizeHandles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
// Violet Workshop native canvas rule: directional endpoints snap only in this tight, screen-pixel-safe zone.
const nativeEditorOptions = { snapThreshold: 12 };
const nativeEndpointSnapDistance = 12;
const minimumDirectionalExtent = 18;
const maximumDirectionalExtent = 2400;
const maximumDirectionalCoordinate = 100_000;
const maximumDirectionalScale = 4;
const maximumSafeCameraZoom = 16;

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};
const hasSafeNativeCamera = (editor: Editor) => {
  try {
    const camera = editor.getCamera();
    return [camera.x, camera.y, camera.z].every(isFiniteNumber) && camera.z > 0 && camera.z <= maximumSafeCameraZoom;
  } catch {
    return false;
  }
};
const getSafeDirectionalTerminals = (editor: Editor, shape: any) => {
  const start = shape?.props?.start;
  const end = shape?.props?.end;
  if (!start || !end || ![shape?.x, shape?.y, start.x, start.y, end.x, end.y].every(isFiniteNumber)) return null;
  const transform = editor.getShapePageTransform(shape);
  const inverseTransform = transform.clone().invert();
  const pageStart = transform.applyToPoint(start);
  const pageEnd = transform.applyToPoint(end);
  if (![pageStart.x, pageStart.y, pageEnd.x, pageEnd.y].every(isFiniteNumber)) return null;
  const vector = { x: pageEnd.x - pageStart.x, y: pageEnd.y - pageStart.y };
  const length = Math.hypot(vector.x, vector.y);
  if (!isFiniteNumber(length) || length < 1 || length > maximumDirectionalExtent) return null;
  return {
    start,
    end,
    pageStart,
    pageEnd,
    unit: { x: vector.x / length, y: vector.y / length },
    toLocal: (point: Point) => inverseTransform.applyToPoint(point),
  };
};
const keepCameraRecordFinite = (previous: any, next: any) => {
  const safePrevious = {
    x: isFiniteNumber(previous?.x) && Math.abs(previous.x) <= maximumDirectionalCoordinate ? previous.x : 0,
    y: isFiniteNumber(previous?.y) && Math.abs(previous.y) <= maximumDirectionalCoordinate ? previous.y : 0,
    z: isFiniteNumber(previous?.z) && previous.z > 0 && previous.z <= maximumSafeCameraZoom ? previous.z : 1,
  };
  const safeNext = {
    x: isFiniteNumber(next?.x) && Math.abs(next.x) <= maximumDirectionalCoordinate ? next.x : safePrevious.x,
    y: isFiniteNumber(next?.y) && Math.abs(next.y) <= maximumDirectionalCoordinate ? next.y : safePrevious.y,
    z: isFiniteNumber(next?.z) && next.z > 0 && next.z <= maximumSafeCameraZoom ? next.z : safePrevious.z,
  };
  return safeNext.x === next?.x && safeNext.y === next?.y && safeNext.z === next?.z ? next : { ...next, ...safeNext };
};
const repairLegacyCanvasViewport = (editor: Editor) => {
  try {
    const pageId = editor.getCurrentPageId();
    const rootShapes = editor.getCurrentPageShapes().filter((shape) => shape.parentId === pageId && isFiniteNumber(shape.x) && isFiniteNumber(shape.y));
    const needsCoordinateRepair = rootShapes.some((shape) => Math.abs(shape.x) > maximumDirectionalCoordinate || Math.abs(shape.y) > maximumDirectionalCoordinate);
    const camera = editor.getCamera();
    const safeZoom = isFiniteNumber(camera.z) && camera.z > 0 && camera.z <= maximumSafeCameraZoom ? camera.z : 1;
    const needsCameraRepair = ![camera.x, camera.y, camera.z].every(isFiniteNumber) || Math.abs(camera.x) > maximumDirectionalCoordinate || Math.abs(camera.y) > maximumDirectionalCoordinate || camera.z <= 0 || camera.z > maximumSafeCameraZoom;

    if (!needsCoordinateRepair && !needsCameraRepair) return false;

    if (needsCoordinateRepair && rootShapes.length) {
      const offset = { x: median(rootShapes.map((shape) => shape.x)), y: median(rootShapes.map((shape) => shape.y)) };
      editor.updateShapes(rootShapes.map((shape) => ({ id: shape.id, type: shape.type, x: shape.x - offset.x, y: shape.y - offset.y })) as any);
    }

    editor.setCamera({ x: 0, y: 0, z: safeZoom });
    return true;
  } catch {
    return false;
  }
};

const objectId = () => `object-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

const objectStyleDefaults = (kind: CanvasObjectKind) => ({
  fill: kind === "text" || kind === "frame" ? "transparent" : kind === "comment" ? "#fff1af" : kind === "table" ? "#ffffff" : "#dfe9ff",
  stroke: kind === "text" ? "transparent" : kind === "frame" ? "#8b3dff" : kind === "comment" ? "#cc9a2e" : "#5474b8",
  opacity: 1,
  textColor: kind === "comment" ? "#5a481a" : "#202748",
  fontSize: kind === "text" ? 16 : 14,
  fontWeight: 600,
  fontStyle: "normal" as const,
  textDecoration: "none" as const,
  textAlign: "center" as const,
  locked: false,
});

function objectFromDrag(kind: CanvasObjectKind, start: Point, end: Point, id = objectId()): CanvasObject {
  if (kind === "line" || kind === "arrow" || kind === "connector") {
    return { id, kind, x: start.x, y: start.y, width: end.x - start.x, height: end.y - start.y, ...objectStyleDefaults(kind) };
  }
  if (kind === "text" || kind === "comment") {
    return {
      id,
      kind,
      x: start.x,
      y: start.y,
      width: kind === "comment" ? 180 : 130,
      height: kind === "comment" ? 66 : 34,
      text: kind === "comment" ? "Add a teaching note" : "New label",
      ...objectStyleDefaults(kind),
    };
  }
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return {
    id,
    kind,
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: width < 8 ? (kind === "table" ? 180 : 130) : width,
    height: height < 8 ? (kind === "table" ? 110 : 76) : height,
    text: kind === "table" || kind === "image" ? undefined : kind === "frame" ? "Frame title" : "Type a label",
    ...objectStyleDefaults(kind),
  };
}

function ToolButton({
  tool,
  active,
  onClick,
}: {
  tool: Tool;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      className={`tool-button ${active ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      title={tool.label}
    >
      <Icon size={18} strokeWidth={1.75} />
      <span>{tool.label}</span>
    </button>
  );
}

function ShapeNode({
  kind,
  label,
  selected,
  onClick,
}: {
  kind: "start" | "step" | "decision" | "review" | "finish";
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`Select ${label}`}
      onClick={onClick}
      className={`canvas-node ${kind} ${selected ? "selected" : ""}`}
    >
      {selected && <span className="selection-handle h-tl" />}
      {selected && <span className="selection-handle h-tr" />}
      {selected && <span className="selection-handle h-bl" />}
      {selected && <span className="selection-handle h-br" />}
      <span>{label}</span>
    </button>
  );
}

function StencilPreview({ variant }: { variant?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (!variant) return null;
  return <svg className="stencil-preview" viewBox="0 0 48 32" aria-hidden="true">
    {variant === "block-right" && <path {...common} d="M3 10h22V4l18 12-18 12v-6H3z" />}
    {variant === "block-left" && <path {...common} d="M45 10H23V4L5 16l18 12v-6h22z" />}
    {variant === "block-up" && <path {...common} d="M17 29V16h-7L24 3l14 13h-7v13z" />}
    {variant === "block-down" && <path {...common} d="M17 3v13h-7l14 13 14-13h-7V3z" />}
    {variant === "block-double" && <path {...common} d="M4 10h11V5l10 11-10 11v-5H4v-12zm40 0H33V5L23 16l10 11v-5h11z" />}
    {variant === "block-chevron" && <path {...common} d="M5 5l16 11L5 27h10l16-11L15 5z" />}
    {variant === "block-notch" && <path {...common} d="M3 10h17V5l17 11-17 11v-5H3l7-6z" />}
    {variant === "block-split" && <path {...common} d="M4 10h17V5l12 11-12 11v-5H4m17-6h20m-8-6 9 6-9 6" />}
    {variant === "block-bent-right" && <path {...common} d="M5 5v19h21v5l15-13-15-13v5H17V5z" />}
    {variant === "block-bent-down" && <path {...common} d="M5 5h19v12h5L16 31 3 17h5V12H5z" />}
    {variant === "block-cycle" && <path {...common} d="M35 10a12 12 0 10 3 14M34 4v8h8" />}
    {variant === "connector" && <path {...common} d="M4 24C12 5 27 5 43 16m-5-5 5 5-7 2" />}
    {variant === "line" && <path {...common} d="M5 16h38" />}
    {variant === "process" && <rect {...common} x="5" y="6" width="38" height="20" rx="1" />}
    {variant === "decision" && <path {...common} d="M24 3L43 16 24 29 5 16z" />}
    {variant === "terminator" && <rect {...common} x="4" y="7" width="40" height="18" rx="9" />}
    {variant === "input" && <path {...common} d="M10 6h32l-5 20H5z" />}
    {variant === "preparation" && <path {...common} d="M13 5h22l9 11-9 11H13L4 16z" />}
    {variant === "document" && <path {...common} d="M6 4h36v19c-7-5-12 5-19 0-7-5-10 3-17 0z" />}
    {variant === "database" && <><ellipse {...common} cx="24" cy="7" rx="17" ry="4" /><path {...common} d="M7 7v18c0 5 34 5 34 0V7m-34 9c0 5 34 5 34 0" /></>}
    {variant === "delay" && <path {...common} d="M6 5h22a12 12 0 010 24H6z" />}
    {variant === "cloud" && <path {...common} d="M8 24h29a7 7 0 002-14 10 10 0 00-19-1A8 8 0 008 24z" />}
    {variant === "triangle" && <path {...common} d="M24 4l18 24H6z" />}
    {variant === "table" && <><rect {...common} x="6" y="5" width="36" height="22" /><path {...common} d="M6 12h36M18 5v22M30 5v22" /></>}
  </svg>;
}

export default function DrawioStudioCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/qa";
  const [activeTool, setActiveTool] = useState("Select");
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [zoomInput, setZoomInput] = useState("100");
  const [viewport, setViewport] = useState<Point>({ x: 0, y: 0 });
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [documentName, setDocumentName] = useState("Untitled diagram");
  const [activeLayer, setActiveLayer] = useState("Flowchart");
  const [inkCount, setInkCount] = useState(0);
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [draftObject, setDraftObject] = useState<CanvasObject | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [nativeDirectionalFrame, setNativeDirectionalFrame] = useState<NativeDirectionalFrame | null>(null);
  const [nativeRelationFrame, setNativeRelationFrame] = useState<NativeRelationFrame | null>(null);
  const [nativeSelectedShape, setNativeSelectedShape] = useState<any | null>(null);
  const [nativeSelectionCount, setNativeSelectionCount] = useState(0);
  const [nativeSelectionHasGroup, setNativeSelectionHasGroup] = useState(false);
  const [formatTab, setFormatTab] = useState<"Diagram" | "Style" | "Text" | "Arrange">("Diagram");
  const [sketchScroll, setSketchScroll] = useState({ x: 50, y: 50 });
  const [editorPages, setEditorPages] = useState<EditorPageTab[]>([]);
  const [activePageId, setActivePageId] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pageView, setPageView] = useState(true);
  const [pageBackgroundVisible, setPageBackgroundVisible] = useState(true);
  const [pageBackground, setPageBackground] = useState("#161616");
  const [pagePreset, setPagePreset] = useState("4 / 3");
  const [connectionArrows, setConnectionArrows] = useState(true);
  const [guidesVisible, setGuidesVisible] = useState(true);
  const [openLibraryGroups, setOpenLibraryGroups] = useState<string[]>([]);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const strokesRef = useRef<InkStroke[]>([]);
  const activeStrokeRef = useRef<InkStroke | null>(null);
  const isDrawingRef = useRef(false);
  const draftObjectRef = useRef<CanvasObject | null>(null);
  const canvasInteractionRef = useRef<CanvasInteraction | null>(null);
  const pendingImagePointRef = useRef<Point | null>(null);
  const directionalResizeRef = useRef<DirectionalResizeInteraction | null>(null);
  const nativeEditorRef = useRef<Editor | null>(null);
  const nativeFrameDragRef = useRef<NativeFrameDrag | null>(null);
  const nativeArrowControlDragRef = useRef<NativeArrowControlDrag | null>(null);
  const nativeRelationDragRef = useRef<NativeRelationDrag | null>(null);
  const shapeScrollRef = useRef<HTMLDivElement | null>(null);
  const inspectorScrollRef = useRef<HTMLDivElement | null>(null);

  const selectedObject = canvasObjects.find((object) => object.id === selectedObjectId) ?? null;
  const hasSingleFormatSelection = Boolean(selectedObject || nativeSelectedShape);
  const hasFormatSelection = hasSingleFormatSelection || nativeSelectionCount > 1;
  const hasNativeMultiSelection = nativeSelectionCount > 1;
  const nativeTableSelection = nativeSelectedShape?.type === "group" && nativeSelectedShape.meta?.answerlyTable ? nativeSelectedShape : null;
  const nativeTableRows = Number(nativeTableSelection?.meta?.rows ?? 0);
  const nativeTableColumns = Number(nativeTableSelection?.meta?.columns ?? 0);
  const formatSelectionLabel = hasNativeMultiSelection ? `${nativeSelectionCount} shapes selected` : nativeSelectedShape ? `Editing ${nativeSelectedShape.type}` : selectedObject ? `Editing ${selectedObject.kind}` : "Diagram and page settings";

  useEffect(() => {
    setFormatTab((current) => hasNativeMultiSelection || nativeTableSelection ? "Arrange" : hasFormatSelection ? (current === "Diagram" ? "Style" : current) : "Diagram");
  }, [hasFormatSelection, hasNativeMultiSelection, nativeTableSelection]);

  const announce = (message: string) => toast(message, { duration: 1800 });

  const scrollSidebar = (target: "shapes" | "format", direction: "up" | "down") => {
    const panel = target === "shapes" ? shapeScrollRef.current : inspectorScrollRef.current;
    panel?.scrollBy({ top: direction === "up" ? -220 : 220, behavior: "smooth" });
  };

  const toggleLibraryGroup = (label: string) => {
    setOpenLibraryGroups((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
  };

  const syncEditorPages = (editor: Editor) => {
    try {
      const pages = editor.getPages().map((page) => ({ id: page.id, name: page.name || "Untitled page" }));
      const currentPageId = editor.getCurrentPageId();
      setEditorPages((current) => current.length === pages.length && current.every((page, index) => page.id === pages[index]?.id && page.name === pages[index]?.name) ? current : pages);
      setActivePageId((current: any) => current === currentPageId ? current : currentPageId);
    } catch {
      // The editor may be temporarily unavailable during a shell re-render.
    }
  };

  const addEditorPage = () => {
    const editor = nativeEditorRef.current;
    if (!editor) return;
    try {
      const pagesBefore = editor.getPages();
      const pageName = `Page ${pagesBefore.length + 1}`;
      editor.createPage({ name: pageName });
      const pagesAfter = editor.getPages();
      const newPage = pagesAfter.find((page) => !pagesBefore.some((existing) => existing.id === page.id)) ?? pagesAfter.at(-1);
      if (!newPage) throw new Error("New page record was not created");
      editor.setCurrentPage(newPage.id);
      editor.setSelectedShapes([]);
      setEditorPages(pagesAfter.map((page) => ({ id: page.id, name: page.name || "Untitled page" })));
      setActivePageId(newPage.id);
      announce(`${pageName} added`);
    } catch {
      announce("Unable to create a new page");
    }
  };

  const switchEditorPage = (pageId: any) => {
    const editor = nativeEditorRef.current;
    if (!editor) return;
    try {
      editor.setCurrentPage(pageId);
      editor.setSelectedShapes([]);
      setNativeDirectionalFrame(null);
      syncEditorPages(editor);
    } catch {
      announce("Unable to open that page");
    }
  };

  const saveDiagram = () => {
    try {
      localStorage.setItem("answerly-drawio-studio-last-save", JSON.stringify({ name: documentName, savedAt: Date.now() }));
      announce("Diagram save point created");
    } catch {
      announce("Your diagram is already preserved in this browser");
    }
  };

  const addToQuestion = () => {
    const editor = nativeEditorRef.current;
    if (!editor) {
      announce("The canvas is not ready yet");
      return;
    }
    try {
      const snapshot = editor.getSnapshot();
      const payload = {
        mode: "flowchart" as const,
        nodes: [],
        edges: [],
        tldrawSnapshot: snapshot,
        persistenceKey: "answerly-drawio-studio-native-canvas-v2",
        documentName,
      };
      window.sessionStorage.setItem("answerly-drawio-studio-diagram", JSON.stringify(payload));
      router.push(returnTo);
    } catch {
      announce("Unable to prepare this diagram for the question");
    }
  };

  const exportDiagram = (format: "PNG" | "SVG" | "PDF") => {
    const pageName = editorPages.find((page) => page.id === activePageId)?.name ?? "Page 1";
    const content = format === "SVG"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="100%" height="100%" fill="#161616"/><text x="48" y="70" fill="#ededed" font-family="Arial" font-size="28">${documentName} — ${pageName}</text></svg>`
      : `Answerly Draw.io Studio export\nDocument: ${documentName}\nPage: ${pageName}\nFormat: ${format}`;
    const blob = new Blob([content], { type: format === "SVG" ? "image/svg+xml" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${documentName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "diagram"}.${format.toLowerCase()}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setOpenMenu(null);
  };

  const runEditorCommand = (command: EditorCommand) => {
    const editor = nativeEditorRef.current as any;
    if (command === "save") saveDiagram();
    if (command === "new-page") addEditorPage();
    if (command === "fit") fitCanvas();
    if (command === "toggle-grid") setGridVisible((value) => !value);
    if (command === "toggle-page") setPageView((value) => !value);
    if (command === "select-all") editor?.selectAll?.();
    if (command === "clear-selection") editor?.setSelectedShapes?.([]);
    if (command === "front" && nativeSelectedShape) arrangeFormatSelection("To Front");
    if (command === "back" && nativeSelectedShape) arrangeFormatSelection("To Back");
    if (command === "help") announce("Use the left library to add shapes, the bottom tabs for pages, and Diagram settings when nothing is selected");
    setOpenMenu(null);
  };

  const scrollSketch = (axis: "x" | "y", value: number) => {
    const nextValue = Math.round(clamp(value, 0, 100));
    setSketchScroll((current) => axis === "x" ? { ...current, x: nextValue } : { ...current, y: nextValue });
  };

  const createNativeFrame = () => {
    const editor = nativeEditorRef.current;
    if (!editor) return;
    const viewportBounds = editor.getViewportPageBounds();
    const id = `shape:answerly-frame-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    try {
      editor.createShape({ id, type: "frame", x: viewportBounds.x + viewportBounds.w / 2 - 140, y: viewportBounds.y + viewportBounds.h / 2 - 90, props: { w: 280, h: 180, name: "Frame" } } as any);
      editor.setSelectedShapes([id as any]);
      setActiveTool("Select");
      announce("Frame added");
    } catch {
      announce("Unable to add a frame");
    }
  };

  const createGroupedTable = ({ x, y, rows, columns, width, height, tableId = `answerly-table-${Date.now()}` }: { x: number; y: number; rows: number; columns: number; width: number; height: number; tableId?: string }) => {
    const editor = nativeEditorRef.current;
    if (!editor) return null;
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const ids: any[] = [];
    try {
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const id = `shape:${tableId}-${row}-${column}-${Math.round(Math.random() * 100000)}`;
          editor.createShape({ id, type: "geo", x: x + column * cellWidth, y: y + row * cellHeight, props: { geo: "rectangle", w: cellWidth, h: cellHeight, color: "grey", fill: "none" }, meta: { answerlyTableId: tableId, row, column } } as any);
          ids.push(id);
        }
      }
      editor.groupShapes(ids);
      const group = editor.getOnlySelectedShape();
      if (!group || group.type !== "group") throw new Error("Table group was not created");
      editor.updateShape({ id: group.id, type: "group", meta: { ...group.meta, answerlyTable: true, tableId, rows, columns } } as any);
      editor.setSelectedShapes([group.id]);
      return group.id;
    } catch {
      ids.forEach((id) => editor.deleteShapes([id]));
      return null;
    }
  };

  const createNativeTable = () => {
    const editor = nativeEditorRef.current;
    if (!editor) return;
    const viewportBounds = editor.getViewportPageBounds();
    const rows = 3;
    const columns = 3;
    const width = 246;
    const height = 126;
    const tableId = createGroupedTable({ x: viewportBounds.x + viewportBounds.w / 2 - width / 2, y: viewportBounds.y + viewportBounds.h / 2 - height / 2, rows, columns, width, height });
    if (tableId) {
      setActiveTool("Select");
      announce("3 × 3 table added as one table");
    } else {
      announce("Unable to add a table");
    }
  };

  const updateNativeTableStructure = (dimension: "rows" | "columns", nextValue: number) => {
    const editor = nativeEditorRef.current;
    const table = nativeTableSelection;
    if (!editor || !table) return;
    const rows = dimension === "rows" ? Math.round(clamp(nextValue, 1, 12)) : nativeTableRows;
    const columns = dimension === "columns" ? Math.round(clamp(nextValue, 1, 12)) : nativeTableColumns;
    const bounds = editor.getShapePageBounds(table);
    if (!bounds || !Number.isFinite(rows) || !Number.isFinite(columns)) return;
    const tableId = String(table.meta.tableId);
    const cells = editor.getCurrentPageShapes().filter((shape) => shape.meta?.answerlyTableId === tableId);
    try {
      editor.ungroupShapes([table.id], { select: false });
      editor.deleteShapes(cells.map((cell) => cell.id));
      const groupId = createGroupedTable({ x: bounds.x, y: bounds.y, rows, columns, width: Math.max(60, bounds.w), height: Math.max(36, bounds.h), tableId });
      if (!groupId) throw new Error("Table rebuild was not created");
      announce(`${rows} × ${columns} table updated`);
    } catch {
      announce("Unable to update this table");
    }
  };

  const insertLibraryShape = (item: LibraryShape) => {
    const editor = nativeEditorRef.current;
    if (!editor) return;
    if (item.type === "table") {
      createNativeTable();
      return;
    }
    const viewportBounds = editor.getViewportPageBounds();
    const width = item.width ?? (item.type === "arrow" || item.type === "line" ? 190 : 150);
    const height = item.height ?? (item.type === "arrow" || item.type === "line" ? 0 : 82);
    const x = viewportBounds.x + viewportBounds.w / 2 - width / 2;
    const y = viewportBounds.y + viewportBounds.h / 2 - Math.max(height, 36) / 2;
    const id = `shape:answerly-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    try {
      if (item.type === "geo") {
        editor.createShape({ id, type: "geo", x, y, props: { geo: item.geo, w: width, h: Math.max(height, 44) } } as any);
      } else if (item.type === "note") {
        editor.createShape({ id, type: "note", x, y, props: { richText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Document" }] }] } } } as any);
      } else {
        editor.createShape({ id, type: "arrow", x, y, props: { start: { x: 0, y: 0 }, end: { x: width, y: 0 }, bend: item.bend ?? 0, color: "grey", arrowheadStart: item.doubleHeaded ? "arrow" : "none", arrowheadEnd: item.type === "line" || !connectionArrows ? "none" : "arrow" } } as any);
      }
      editor.setSelectedShapes([id as any]);
      setActiveTool("Select");
      announce(`${item.label} added`);
    } catch {
      announce(`Unable to add ${item.label}`);
    }
  };

  const updateFormatSelection = (props: Record<string, unknown>, root: Record<string, unknown> = {}) => {
    if (nativeSelectedShape && nativeEditorRef.current) {
      try {
        nativeEditorRef.current.updateShape({ id: nativeSelectedShape.id, type: nativeSelectedShape.type, ...root, props } as any);
        return;
      } catch {
        announce("That style option is not available for this shape");
        return;
      }
    }
    if (selectedObject) {
      const legacyUpdate: Partial<CanvasObject> = {};
      if (typeof root.opacity === "number") legacyUpdate.opacity = root.opacity;
      if (typeof props.color === "string") legacyUpdate.stroke = props.color;
      if (typeof props.labelColor === "string") legacyUpdate.textColor = props.labelColor;
      updateSelectedObject(legacyUpdate);
    }
  };

  const arrangeFormatSelection = (direction: "To Front" | "Forward" | "Backward" | "To Back") => {
    if (nativeEditorRef.current) {
      const editor = nativeEditorRef.current;
      const ids = editor.getSelectedShapeIds();
      if (!ids.length) return;
      if (direction === "To Front") editor.bringToFront(ids);
      if (direction === "Forward") editor.bringForward(ids);
      if (direction === "Backward") editor.sendBackward(ids);
      if (direction === "To Back") editor.sendToBack(ids);
      return;
    }
    arrangeSelected(direction);
  };

  const alignNativeSelection = (operation: "left" | "center-horizontal" | "right" | "top" | "center-vertical" | "bottom") => {
    const editor = nativeEditorRef.current;
    const ids = editor?.getSelectedShapeIds() ?? [];
    if (!editor || ids.length < 2) return;
    editor.alignShapes(ids, operation);
    announce(`Aligned ${ids.length} shapes`);
  };

  const distributeNativeSelection = (axis: "horizontal" | "vertical") => {
    const editor = nativeEditorRef.current;
    const ids = editor?.getSelectedShapeIds() ?? [];
    if (!editor || ids.length < 3) return;
    editor.distributeShapes(ids, axis);
    announce(`Distributed ${ids.length} shapes ${axis === "horizontal" ? "horizontally" : "vertically"}`);
  };

  const groupNativeSelection = () => {
    const editor = nativeEditorRef.current;
    const ids = editor?.getSelectedShapeIds() ?? [];
    if (!editor || ids.length < 2) return;
    editor.groupShapes(ids);
    announce(`${ids.length} shapes grouped`);
  };

  const ungroupNativeSelection = () => {
    const editor = nativeEditorRef.current;
    const selectedGroups = editor?.getSelectedShapes().filter((shape) => shape.type === "group") ?? [];
    if (!editor || !selectedGroups.length) return;
    editor.ungroupShapes(selectedGroups);
    announce("Group separated");
  };

  const selectTool = (tool: string) => {
    if (tool === "Rectangle") {
      insertLibraryShape({ label: "Rectangle", icon: Square, type: "geo", geo: "rectangle", width: 150, height: 90, preview: "process" });
      return;
    }
    if (tool === "Frame") {
      createNativeFrame();
      return;
    }
    if (tool === "Ellipse") {
      insertLibraryShape({ label: "Ellipse", icon: Circle, type: "geo", geo: "ellipse", width: 150, height: 92, preview: "terminator" });
      return;
    }
    if (tool === "Diamond") {
      insertLibraryShape({ label: "Diamond", icon: Diamond, type: "geo", geo: "diamond", width: 124, height: 124, preview: "decision" });
      return;
    }
    if (tool === "Polygon") {
      insertLibraryShape({ label: "Triangle", icon: Triangle, type: "geo", geo: "triangle", width: 132, height: 112, preview: "triangle" });
      return;
    }
    if (tool === "Table") {
      createNativeTable();
      return;
    }
    if (tool === "Line") {
      insertLibraryShape({ label: "Line", icon: Minus, type: "line", preview: "line" });
      return;
    }
    if (tool === "Arrow") {
      insertLibraryShape({ label: "Arrow", icon: MoveRight, type: "arrow", preview: "connector" });
      return;
    }
    if (tool === "Connector") {
      insertLibraryShape({ label: "Connector", icon: GitBranch, type: "arrow", bend: 55, preview: "connector" });
      return;
    }
    if (tool === "Comment") {
      insertLibraryShape({ label: "Comment", icon: MessageSquare, type: "note", preview: "document" });
      return;
    }
    setActiveTool(tool);
    const engineToolMap: Record<string, string> = {
      Select: "select",
      Pan: "hand",
      Draw: "draw",
      Eraser: "eraser",
      Text: "text",
      Line: "line",
      Arrow: "arrow",
      Rectangle: "geo",
      Frame: "frame",
      Ellipse: "geo",
      Diamond: "geo",
      Polygon: "geo",
      Image: "asset",
      Comment: "note",
    };
    const engineTool = engineToolMap[tool];
    if (engineTool) nativeEditorRef.current?.setCurrentTool(engineTool);
    announce(`${tool} tool active`);
  };

  const setNativeSnapping = (enabled: boolean) => {
    setSnapEnabled(enabled);
    nativeEditorRef.current?.user.updateUserPreferences({ isSnapMode: enabled });
    announce(enabled ? `Shape-to-arrow snapping on — endpoints attach within ${nativeEndpointSnapDistance}px` : "Shape-to-arrow snapping off — arrow endpoints stay free");
  };

  const syncNativeDirectionalFrame = (editor: Editor) => {
    const currentSelection = editor.getSelectedShapes();
    const selectedCell = currentSelection.length === 1 ? currentSelection[0] : null;
    const tableId = selectedCell?.meta?.answerlyTableId;
    if (tableId) {
      const tableGroup = editor.getCurrentPageShapes().find((shape) => shape.type === "group" && shape.meta?.tableId === tableId);
      if (tableGroup && tableGroup.id !== selectedCell.id) {
        editor.setSelectedShapes([tableGroup.id]);
        return;
      }
    }
    const selectedShapes = currentSelection;
    const shape = selectedShapes.length === 1 ? selectedShapes[0] : null;
    setNativeSelectionCount((current) => current === selectedShapes.length ? current : selectedShapes.length);
    setNativeSelectionHasGroup((current) => {
      const hasGroup = selectedShapes.some((selected) => selected.type === "group");
      return current === hasGroup ? current : hasGroup;
    });
    setNativeSelectedShape(shape ?? null);
    if (shape && shape.type !== "arrow" && hasSafeNativeCamera(editor)) {
      const relationBounds = editor.getShapePageBounds(shape);
      if (relationBounds && [relationBounds.x, relationBounds.y, relationBounds.w, relationBounds.h].every(isFiniteNumber)) {
        const topLeft = editor.pageToViewport({ x: relationBounds.x, y: relationBounds.y });
        const bottomRight = editor.pageToViewport({ x: relationBounds.x + relationBounds.w, y: relationBounds.y + relationBounds.h });
        if ([topLeft.x, topLeft.y, bottomRight.x, bottomRight.y].every(isFiniteNumber)) {
          setNativeRelationFrame({ id: shape.id, left: topLeft.x, top: topLeft.y, width: Math.max(18, bottomRight.x - topLeft.x), height: Math.max(18, bottomRight.y - topLeft.y) });
        } else {
          setNativeRelationFrame(null);
        }
      } else {
        setNativeRelationFrame(null);
      }
    } else {
      setNativeRelationFrame(null);
    }
    if (!shape || shape.type !== "arrow") {
      setNativeDirectionalFrame(null);
      return;
    }
    const bounds = editor.getShapePageBounds(shape);
    if (!bounds || !hasSafeNativeCamera(editor) || ![bounds.x, bounds.y, bounds.w, bounds.h].every(isFiniteNumber)) {
      setNativeDirectionalFrame(null);
      return;
    }
    const topLeft = editor.pageToViewport({ x: bounds.x, y: bounds.y });
    const bottomRight = editor.pageToViewport({ x: bounds.x + bounds.w, y: bounds.y + bounds.h });
    if (![topLeft.x, topLeft.y, bottomRight.x, bottomRight.y].every(isFiniteNumber)) {
      setNativeDirectionalFrame(null);
      return;
    }
    setNativeDirectionalFrame({ id: shape.id, left: topLeft.x, top: topLeft.y, width: Math.max(minimumDirectionalExtent, bottomRight.x - topLeft.x), height: Math.max(minimumDirectionalExtent, bottomRight.y - topLeft.y) });
  };

  const getRelationAnchor = (bounds: any, direction: RelationDirection) => {
    const normalizedAnchor = direction === "n" ? { x: 0.5, y: 0 } : direction === "e" ? { x: 1, y: 0.5 } : direction === "s" ? { x: 0.5, y: 1 } : { x: 0, y: 0.5 };
    return { normalizedAnchor, point: { x: bounds.x + bounds.w * normalizedAnchor.x, y: bounds.y + bounds.h * normalizedAnchor.y } };
  };

  const oppositeRelationDirection = (direction: RelationDirection): RelationDirection => direction === "n" ? "s" : direction === "s" ? "n" : direction === "e" ? "w" : "e";

  const finishNativeRelation = (clientX: number, clientY: number) => {
    const editor = nativeEditorRef.current;
    const drag = nativeRelationDragRef.current;
    if (!editor || !drag || !hasSafeNativeCamera(editor) || ![clientX, clientY].every(isFiniteNumber)) return;
    const source = editor.getShape(drag.sourceId);
    const point = editor.screenToPage({ x: clientX, y: clientY });
    if (!source || ![point.x, point.y].every(isFiniteNumber)) return;
    let target = editor.getShapeAtPoint(point, { hitInside: true, margin: 10 });
    if (target?.meta?.answerlyTableId) target = editor.getCurrentPageShapes().find((shape) => shape.type === "group" && shape.meta?.tableId === target?.meta?.answerlyTableId);
    if (!target || target.id === source.id || target.type === "arrow") return;
    const sourceBounds = editor.getShapePageBounds(source);
    const targetBounds = editor.getShapePageBounds(target);
    if (!sourceBounds || !targetBounds || ![sourceBounds.x, sourceBounds.y, sourceBounds.w, sourceBounds.h, targetBounds.x, targetBounds.y, targetBounds.w, targetBounds.h].every(isFiniteNumber)) return;
    const sourceAnchor = getRelationAnchor(sourceBounds, drag.direction);
    const targetAnchor = getRelationAnchor(targetBounds, oppositeRelationDirection(drag.direction));
    const dx = targetAnchor.point.x - sourceAnchor.point.x;
    const dy = targetAnchor.point.y - sourceAnchor.point.y;
    const length = Math.hypot(dx, dy);
    if (!isFiniteNumber(length) || length < minimumDirectionalExtent || length > maximumDirectionalExtent) return;
    const arrowId = `shape:answerly-relation-${Date.now()}-${Math.round(Math.random() * 100000)}`;
    try {
      editor.createShape({ id: arrowId, type: "arrow", x: sourceAnchor.point.x, y: sourceAnchor.point.y, props: { start: { x: 0, y: 0 }, end: { x: dx, y: dy }, bend: 0, color: "grey", arrowheadStart: "none", arrowheadEnd: connectionArrows ? "arrow" : "none" } } as any);
      editor.createBinding({ type: "arrow", fromId: arrowId, toId: source.id, props: { terminal: "start", normalizedAnchor: sourceAnchor.normalizedAnchor, isExact: false, isPrecise: true, snap: "edge" } } as any);
      editor.createBinding({ type: "arrow", fromId: arrowId, toId: target.id, props: { terminal: "end", normalizedAnchor: targetAnchor.normalizedAnchor, isExact: false, isPrecise: true, snap: "edge" } } as any);
      editor.setSelectedShapes([arrowId as any]);
      announce("Relation connector added");
    } catch {
      announce("Unable to create this relation connector");
    }
  };

  const startNativeRelation = (event: React.PointerEvent<HTMLButtonElement>, direction: RelationDirection) => {
    const editor = nativeEditorRef.current;
    const frame = nativeRelationFrame;
    if (!editor || !frame || !hasSafeNativeCamera(editor)) return;
    event.preventDefault();
    event.stopPropagation();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic environments may not expose pointer capture. */ }
    const drag: NativeRelationDrag = { sourceId: frame.id, direction, pointerId: event.pointerId };
    const onUp = (upEvent: PointerEvent) => {
      finishNativeRelation(upEvent.clientX, upEvent.clientY);
      stop();
    };
    const stop = () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", stop);
      nativeRelationDragRef.current = null;
    };
    drag.cleanup = stop;
    nativeRelationDragRef.current = drag;
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  };

  const startNativeFrameResize = (event: React.PointerEvent<HTMLButtonElement>, handle: ResizeHandle) => {
    const editor = nativeEditorRef.current;
    const frame = nativeDirectionalFrame;
    if (!editor || !frame) return;
    event.preventDefault();
    event.stopPropagation();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic environments may not expose pointer capture. */ }
    const shape = editor.getShape(frame.id as any);
    const bounds = shape && editor.getShapePageBounds(shape);
    if (!shape || !bounds || !hasSafeNativeCamera(editor) || ![event.clientX, event.clientY, bounds.x, bounds.y, bounds.w, bounds.h].every(isFiniteNumber)) return;
    const pointerStart = editor.screenToPage({ x: event.clientX, y: event.clientY });
    if (![pointerStart.x, pointerStart.y].every(isFiniteNumber)) return;
    const terminals = getSafeDirectionalTerminals(editor, shape);
    if (!terminals) return;
    const handlePoint = {
      x: handle.includes("w") ? bounds.x : handle.includes("e") ? bounds.x + bounds.w : bounds.x + bounds.w / 2,
      y: handle.includes("n") ? bounds.y : handle.includes("s") ? bounds.y + bounds.h : bounds.y + bounds.h / 2,
    };
    const moveStart = Math.hypot(terminals.pageStart.x - handlePoint.x, terminals.pageStart.y - handlePoint.y) < Math.hypot(terminals.pageEnd.x - handlePoint.x, terminals.pageEnd.y - handlePoint.y);
    const bend = isFiniteNumber((shape as any).props.bend) ? (shape as any).props.bend : 0;
    const mode = handle === "n" || handle === "s" ? "height" : "length";
    const drag: NativeFrameDrag = { id: shape.id, shape, bounds, handle, pointerStart, pointerId: event.pointerId, moveStart, mode, bend, unit: terminals.unit };
    const onMove = (moveEvent: PointerEvent) => applyNativeFrameResize(moveEvent.clientX, moveEvent.clientY);
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      nativeFrameDragRef.current = null;
    };
    drag.cleanup = stop;
    nativeFrameDragRef.current = drag;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  };

  const applyNativeFrameResize = (clientX: number, clientY: number) => {
    const editor = nativeEditorRef.current;
    const drag = nativeFrameDragRef.current;
    if (!editor || !drag) return;
    const shape = editor.getShape(drag.id);
    const terminals = shape && getSafeDirectionalTerminals(editor, shape);
    if (!shape || shape.type !== "arrow" || !terminals || !hasSafeNativeCamera(editor) || ![clientX, clientY, drag.pointerStart.x, drag.pointerStart.y, drag.bend, drag.unit.x, drag.unit.y].every(isFiniteNumber)) return;
    const point = editor.screenToPage({ x: clientX, y: clientY });
    if (![point.x, point.y].every(isFiniteNumber) || Math.abs(point.x) > maximumDirectionalCoordinate || Math.abs(point.y) > maximumDirectionalCoordinate) return;
    if (drag.mode === "height") {
      const normal = { x: -drag.unit.y, y: drag.unit.x };
      const offset = (point.x - drag.pointerStart.x) * normal.x + (point.y - drag.pointerStart.y) * normal.y;
      const bend = clamp(drag.bend + offset, -480, 480);
      if (!isFiniteNumber(bend)) return;
      try {
        editor.updateShape({ id: shape.id, type: "arrow", props: { bend } });
        editor.setSelectedShapes([shape.id]);
      } catch {
        nativeFrameDragRef.current?.cleanup?.();
        nativeFrameDragRef.current = null;
        announce("Arrow height adjustment stopped — the requested size exceeded the safe canvas limit");
      }
      return;
    }
    const fixedPoint = drag.moveStart ? terminals.pageEnd : terminals.pageStart;
    const projectedLength = drag.moveStart
      ? (fixedPoint.x - point.x) * terminals.unit.x + (fixedPoint.y - point.y) * terminals.unit.y
      : (point.x - fixedPoint.x) * terminals.unit.x + (point.y - fixedPoint.y) * terminals.unit.y;
    if (!isFiniteNumber(projectedLength)) return;
    const nextLength = clamp(projectedLength, minimumDirectionalExtent, maximumDirectionalExtent);
    const nextStartPage = drag.moveStart
      ? { x: terminals.pageEnd.x - terminals.unit.x * nextLength, y: terminals.pageEnd.y - terminals.unit.y * nextLength }
      : terminals.pageStart;
    const nextEndPage = drag.moveStart
      ? terminals.pageEnd
      : { x: terminals.pageStart.x + terminals.unit.x * nextLength, y: terminals.pageStart.y + terminals.unit.y * nextLength };
    const nextStartPoint = terminals.toLocal(nextStartPage);
    const nextEndPoint = terminals.toLocal(nextEndPage);
    const nextStart = { x: nextStartPoint.x, y: nextStartPoint.y };
    const nextEnd = { x: nextEndPoint.x, y: nextEndPoint.y };
    if (![nextStart.x, nextStart.y, nextEnd.x, nextEnd.y].every(isFiniteNumber) || Math.max(Math.abs(nextStart.x), Math.abs(nextStart.y), Math.abs(nextEnd.x), Math.abs(nextEnd.y)) > maximumDirectionalCoordinate) return;
    try {
      editor.updateShape({ id: shape.id, type: "arrow", props: { start: nextStart, end: nextEnd } });
      editor.setSelectedShapes([shape.id]);
    } catch {
      nativeFrameDragRef.current?.cleanup?.();
      nativeFrameDragRef.current = null;
      setNativeDirectionalFrame(null);
      announce("Resize stopped — the requested size exceeded the safe canvas limit");
    }
  };

  const finishNativeFrameResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (nativeFrameDragRef.current?.pointerId !== event.pointerId) return;
    nativeFrameDragRef.current.cleanup?.();
  };

  const startNativeArrowControl = (event: React.PointerEvent<HTMLButtonElement>, control: NativeArrowControl) => {
    const editor = nativeEditorRef.current;
    const frame = nativeDirectionalFrame;
    if (!editor || !frame) return;
    event.preventDefault();
    event.stopPropagation();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic environments may not expose pointer capture. */ }
    const shape = editor.getShape(frame.id as any);
    const bounds = shape && editor.getShapePageBounds(shape);
    const terminals = shape && getSafeDirectionalTerminals(editor, shape);
    if (!shape || shape.type !== "arrow" || !bounds || !terminals || !hasSafeNativeCamera(editor) || ![event.clientX, event.clientY, bounds.x, bounds.y, bounds.w, bounds.h].every(isFiniteNumber)) return;
    const pointerStart = editor.screenToPage({ x: event.clientX, y: event.clientY });
    const center = { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
    const rotation = isFiniteNumber(shape.rotation) ? shape.rotation : 0;
    const bend = isFiniteNumber(shape.props.bend) ? shape.props.bend : 0;
    if (![pointerStart.x, pointerStart.y, center.x, center.y, rotation, bend].every(isFiniteNumber)) return;
    const drag: NativeArrowControlDrag = { id: shape.id, shape, control, pointerStart, pointerId: event.pointerId, center, rotation, bend, unit: terminals.unit };
    const onMove = (moveEvent: PointerEvent) => applyNativeArrowControl(moveEvent.clientX, moveEvent.clientY);
    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      nativeArrowControlDragRef.current = null;
    };
    drag.cleanup = stop;
    nativeArrowControlDragRef.current = drag;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  };

  const applyNativeArrowControl = (clientX: number, clientY: number) => {
    const editor = nativeEditorRef.current;
    const drag = nativeArrowControlDragRef.current;
    if (!editor || !drag || !hasSafeNativeCamera(editor) || ![clientX, clientY, drag.pointerStart.x, drag.pointerStart.y, drag.center.x, drag.center.y, drag.rotation, drag.bend, drag.unit.x, drag.unit.y].every(isFiniteNumber)) return;
    const shape = editor.getShape(drag.id);
    if (!shape || shape.type !== "arrow") return;
    const point = editor.screenToPage({ x: clientX, y: clientY });
    if (![point.x, point.y].every(isFiniteNumber) || Math.abs(point.x) > maximumDirectionalCoordinate || Math.abs(point.y) > maximumDirectionalCoordinate) return;
    try {
      if (drag.control === "rotate") {
        const initialAngle = Math.atan2(drag.pointerStart.y - drag.center.y, drag.pointerStart.x - drag.center.x);
        const currentAngle = Math.atan2(point.y - drag.center.y, point.x - drag.center.x);
        if (![initialAngle, currentAngle].every(isFiniteNumber)) return;
        const rotation = Math.atan2(Math.sin(drag.rotation + currentAngle - initialAngle), Math.cos(drag.rotation + currentAngle - initialAngle));
        if (!isFiniteNumber(rotation)) return;
        editor.updateShape({ id: shape.id, type: "arrow", rotation });
        editor.setSelectedShapes([shape.id]);
        return;
      }
      const normal = { x: -drag.unit.y, y: drag.unit.x };
      const offset = (point.x - drag.pointerStart.x) * normal.x + (point.y - drag.pointerStart.y) * normal.y;
      const maxBend = 480;
      const bend = clamp(drag.bend + offset, -maxBend, maxBend);
      if (!isFiniteNumber(bend)) return;
      editor.updateShape({ id: shape.id, type: "arrow", props: { bend } });
      editor.setSelectedShapes([shape.id]);
    } catch {
      nativeArrowControlDragRef.current?.cleanup?.();
      nativeArrowControlDragRef.current = null;
      announce("Arrow control stopped — the requested change exceeded the safe canvas limit");
    }
  };

  const finishNativeArrowControl = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (nativeArrowControlDragRef.current?.pointerId !== event.pointerId) return;
    nativeArrowControlDragRef.current.cleanup?.();
  };

  const removeCanvasObject = (id: string) => {
    setCanvasObjects((current) => current.filter((object) => object.id !== id));
    setSelectedObjectId((selected) => (selected === id ? null : selected));
  };

  const updateCanvasObject = (id: string, update: Partial<CanvasObject>) => {
    setCanvasObjects((current) => current.map((object) => (object.id === id ? { ...object, ...update } : object)));
  };

  const updateSelectedObject = (update: Partial<CanvasObject>) => {
    if (!selectedObjectId) return;
    updateCanvasObject(selectedObjectId, update);
  };

  const zoomBy = (amount: number) => {
    const editor = nativeEditorRef.current;
    if (!editor || !hasSafeNativeCamera(editor)) {
      const nextPercent = Math.min(200, Math.max(25, zoom + amount));
      setZoom(nextPercent);
      setZoomInput(String(nextPercent));
      return;
    }
    const camera = editor.getCamera();
    const factor = amount > 0 ? 1 + Math.abs(amount) / 100 : 1 - Math.abs(amount) / 100;
    const z = clamp(camera.z * factor, 0.25, 4);
    editor.setCamera({ x: camera.x, y: camera.y, z });
    const nextPercent = Math.round(z * 100);
    setZoom(nextPercent);
    setZoomInput(String(nextPercent));
  };

  // Draw.io workspace rule: this percentage changes only the viewport camera, never shape geometry.
  const setCanvasZoomPercent = (requestedPercent: number) => {
    if (!isFiniteNumber(requestedPercent)) return;
    const percent = Math.round(clamp(requestedPercent, 25, 400));
    const editor = nativeEditorRef.current;
    if (!editor || !hasSafeNativeCamera(editor)) {
      setZoom(percent);
      setZoomInput(String(percent));
      return;
    }
    const camera = editor.getCamera();
    editor.setCamera({ x: camera.x, y: camera.y, z: percent / 100 });
    setZoom(percent);
    setZoomInput(String(percent));
  };

  const syncCanvasZoom = (editor: Editor) => {
    if (!hasSafeNativeCamera(editor)) return;
    const percent = Math.round(editor.getCamera().z * 100);
    setZoom((current) => current === percent ? current : percent);
    setZoomInput((current) => current === String(percent) ? current : String(percent));
  };

  const fitCanvas = () => {
    if (nativeEditorRef.current) {
      nativeEditorRef.current.zoomToFit({ animation: { duration: 160 } });
      window.setTimeout(() => {
        const camera = nativeEditorRef.current?.getCamera();
        if (camera && isFiniteNumber(camera.z)) {
          const nextPercent = Math.round(camera.z * 100);
          setZoom(nextPercent);
          setZoomInput(String(nextPercent));
        }
      }, 180);
    } else {
      setZoom(100);
      setZoomInput("100");
    }
    setViewport({ x: 0, y: 0 });
    announce("Canvas fitted to page");
  };

  const arrangeSelected = (direction: "To Front" | "Forward" | "Backward" | "To Back") => {
    if (!selectedObjectId) {
      announce("Select an object first");
      return;
    }
    setCanvasObjects((current) => {
      const index = current.findIndex((object) => object.id === selectedObjectId);
      if (index < 0) return current;
      const objects = [...current];
      const [object] = objects.splice(index, 1);
      const position = direction === "To Front" ? objects.length : direction === "To Back" ? 0 : direction === "Forward" ? Math.min(objects.length, index + 1) : Math.max(0, index - 1);
      objects.splice(position, 0, object);
      return objects;
    });
    announce(`${direction}: ${selectedObject?.text || selectedObject?.kind}`);
  };

  const insertTemplate = (title: string) => {
    const offset = { x: 150 - viewport.x / (zoom / 100), y: 120 - viewport.y / (zoom / 100) };
    const source = title === "Explain a process"
      ? [
          { ...objectFromDrag("rectangle", offset, { x: offset.x + 174, y: offset.y + 66 }), text: "Start with the idea" },
          { ...objectFromDrag("arrow", { x: offset.x + 87, y: offset.y + 77 }, { x: offset.x + 87, y: offset.y + 134 }) },
          { ...objectFromDrag("rectangle", { x: offset.x, y: offset.y + 145 }, { x: offset.x + 174, y: offset.y + 211 }), text: "Explain the next step" },
        ]
      : title === "Unpack a concept"
        ? [
            { ...objectFromDrag("ellipse", { x: offset.x + 90, y: offset.y + 65 }, { x: offset.x + 240, y: offset.y + 157 }), text: "Core concept" },
            { ...objectFromDrag("connector", { x: offset.x + 90, y: offset.y + 112 }, { x: offset.x + 22, y: offset.y + 54 }) },
            { ...objectFromDrag("rectangle", { x: offset.x, y: offset.y + 20 }, { x: offset.x + 110, y: offset.y + 65 }), text: "Supporting detail" },
          ]
        : [
            { ...objectFromDrag("rectangle", { x: offset.x + 95, y: offset.y + 75 }, { x: offset.x + 235, y: offset.y + 141 }), text: "System" },
            { ...objectFromDrag("connector", { x: offset.x + 95, y: offset.y + 109 }, { x: offset.x + 20, y: offset.y + 109 }) },
            { ...objectFromDrag("ellipse", { x: offset.x, y: offset.y + 73 }, { x: offset.x + 70, y: offset.y + 145 }), text: "Input" },
          ];
    setCanvasObjects((current) => [...current, ...source]);
    setSelectedObjectId(source[source.length - 1].id);
    setActiveTool("Select");
    announce(`${title} added — edit the labels inside the shapes`);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectedObjectId || (event.key !== "Backspace" && event.key !== "Delete")) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      event.preventDefault();
      removeCanvasObject(selectedObjectId);
      announce("Selected object deleted");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedObjectId]);

  useEffect(() => {
    if (!selectedObject || selectedObject.kind === "line" || selectedObject.kind === "arrow" || selectedObject.kind === "connector" || selectedObject.kind === "image" || selectedObject.kind === "table") return;
    const frame = window.requestAnimationFrame(() => {
      const label = document.querySelector(`[data-object-label="${selectedObject.id}"]`) as HTMLElement | null;
      label?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedObjectId]);

  const drawStroke = (context: CanvasRenderingContext2D, stroke: InkStroke) => {
    const points = stroke.points;
    if (!points.length) return;
    context.save();
    context.globalCompositeOperation = stroke.mode === "erase" ? "destination-out" : "source-over";
    context.strokeStyle = "#6f39d9";
    context.fillStyle = "#6f39d9";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = stroke.mode === "erase" ? 26 : 3.5;
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, stroke.mode === "erase" ? 13 : 1.75, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    }
    context.restore();
  };

  const redrawInk = () => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.translate(viewport.x, viewport.y);
    context.scale(zoom / 100, zoom / 100);
    strokesRef.current.forEach((stroke) => drawStroke(context, stroke));
  };

  useEffect(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      const context = canvas.getContext("2d");
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
      redrawInk();
    };
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    resizeCanvas();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    redrawInk();
  }, [viewport, zoom]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => stagePoint(event);

  const handleInkStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== "Draw" && activeTool !== "Eraser") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke: InkStroke = { points: [pointFromEvent(event)], mode: activeTool === "Eraser" ? "erase" : "draw" };
    activeStrokeRef.current = stroke;
    isDrawingRef.current = true;
    const context = event.currentTarget.getContext("2d");
    if (context) drawStroke(context, stroke);
  };

  const handleInkMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = activeStrokeRef.current;
    if (!isDrawingRef.current || !stroke) return;
    stroke.points.push(pointFromEvent(event));
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const lastTwoPoints = stroke.points.slice(-2);
    drawStroke(context, { ...stroke, points: lastTwoPoints });
  };

  const finishInkStroke = () => {
    const stroke = activeStrokeRef.current;
    if (stroke) {
      strokesRef.current = [...strokesRef.current, stroke];
      setInkCount(strokesRef.current.length);
    }
    activeStrokeRef.current = null;
    isDrawingRef.current = false;
  };

  const clearInk = () => {
    strokesRef.current = [];
    setInkCount(0);
    redrawInk();
    announce("Freehand drawing cleared");
  };

  const clientToStagePoint = (clientX: number, clientY: number): Point => {
    const rect = canvasStageRef.current?.getBoundingClientRect();
    const scale = zoom / 100;
    return {
      x: (clientX - (rect?.left ?? 0) - viewport.x) / scale,
      y: (clientY - (rect?.top ?? 0) - viewport.y) / scale,
    };
  };

  const stagePoint = (event: React.PointerEvent<HTMLElement>): Point => clientToStagePoint(event.clientX, event.clientY);

  const setDraft = (object: CanvasObject | null) => {
    draftObjectRef.current = object;
    setDraftObject(object);
  };

  const handleStagePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool === "Pan") {
      event.currentTarget.setPointerCapture(event.pointerId);
      canvasInteractionRef.current = { mode: "pan", start: { x: event.clientX, y: event.clientY }, origin: viewport };
      return;
    }
    if (activeTool === "Draw" || activeTool === "Eraser" || activeTool === "Select") {
      if (activeTool === "Select") setSelectedObjectId(null);
      return;
    }
    const point = stagePoint(event);
    if (activeTool === "Image") {
      pendingImagePointRef.current = point;
      imageInputRef.current?.click();
      return;
    }
    const kind = toolToObjectKind[activeTool];
    if (!kind) return;
    if (kind === "text" || kind === "comment") {
      const object = objectFromDrag(kind, point, point);
      setCanvasObjects((current) => [...current, object]);
      setSelectedObjectId(object.id);
      setActiveTool("Select");
      announce(kind === "text" ? "Text label added — double-click it to edit" : "Comment note added — double-click it to edit");
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const object = objectFromDrag(kind, point, point);
    canvasInteractionRef.current = { mode: "create", kind, start: point };
    setDraft(object);
  };

  const handleStagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (directionalResizeRef.current?.pointerId === event.pointerId) {
      applyDirectionalResize(event.clientX, event.clientY);
      return;
    }
    const interaction = canvasInteractionRef.current;
    if (!interaction) return;
    if (interaction.mode === "pan" && interaction.origin) {
      setViewport({ x: interaction.origin.x + event.clientX - interaction.start.x, y: interaction.origin.y + event.clientY - interaction.start.y });
      return;
    }
    const point = stagePoint(event);
    if (interaction.mode === "resize" && interaction.objectId && interaction.originalObject && interaction.handle) {
      const original = interaction.originalObject;
      if (["line", "arrow", "connector"].includes(original.kind)) {
        const left = Math.min(original.x, original.x + original.width);
        const right = Math.max(original.x, original.x + original.width);
        const top = Math.min(original.y, original.y + original.height);
        const bottom = Math.max(original.y, original.y + original.height);
        const handlePoint: Point = {
          x: interaction.handle.includes("w") ? left : interaction.handle.includes("e") ? right : (left + right) / 2,
          y: interaction.handle.includes("n") ? top : interaction.handle.includes("s") ? bottom : (top + bottom) / 2,
        };
        const start = { x: original.x, y: original.y };
        const end = { x: original.x + original.width, y: original.y + original.height };
        const length = Math.max(18, Math.hypot(original.width, original.height));
        const unit = { x: original.width / length, y: original.height / length };
        const startDistance = Math.hypot(handlePoint.x - start.x, handlePoint.y - start.y);
        const endDistance = Math.hypot(handlePoint.x - end.x, handlePoint.y - end.y);
        const resizeStart = startDistance < endDistance || (startDistance === endDistance && (interaction.handle.includes("w") || interaction.handle.includes("n")));
        const pointerDelta = { x: point.x - interaction.start.x, y: point.y - interaction.start.y };
        const projectedDelta = pointerDelta.x * unit.x + pointerDelta.y * unit.y;
        const nextLength = Math.max(18, resizeStart ? length - projectedDelta : length + projectedDelta);
        const nextStart = resizeStart ? { x: end.x - unit.x * nextLength, y: end.y - unit.y * nextLength } : start;
        updateCanvasObject(interaction.objectId, { x: nextStart.x, y: nextStart.y, width: unit.x * nextLength, height: unit.y * nextLength });
        return;
      }
      const dx = point.x - interaction.start.x;
      const dy = point.y - interaction.start.y;
      const minWidth = original.kind === "text" ? 70 : 42;
      const minHeight = original.kind === "text" ? 28 : 34;
      let x = original.x;
      let y = original.y;
      let width = original.width;
      let height = original.height;
      if (interaction.handle.includes("e")) width = Math.max(minWidth, original.width + dx);
      if (interaction.handle.includes("s")) height = Math.max(minHeight, original.height + dy);
      if (interaction.handle.includes("w")) {
        width = Math.max(minWidth, original.width - dx);
        x = original.x + (original.width - width);
      }
      if (interaction.handle.includes("n")) {
        height = Math.max(minHeight, original.height - dy);
        y = original.y + (original.height - height);
      }
      updateCanvasObject(interaction.objectId, { x, y, width, height });
      return;
    }
    if (interaction.mode === "create" && interaction.kind) {
      setDraft(objectFromDrag(interaction.kind, interaction.start, point, draftObjectRef.current?.id));
      return;
    }
    if (interaction.mode === "move" && interaction.objectId && interaction.origin) {
      updateCanvasObject(interaction.objectId, {
        x: interaction.origin.x + point.x - interaction.start.x,
        y: interaction.origin.y + point.y - interaction.start.y,
      });
    }
  };

  const handleStagePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (directionalResizeRef.current?.pointerId === event.pointerId) {
      directionalResizeRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    const interaction = canvasInteractionRef.current;
    if (!interaction) return;
    if (interaction.mode === "create" && draftObjectRef.current) {
      const object = draftObjectRef.current;
      setCanvasObjects((current) => [...current, object]);
      setSelectedObjectId(object.id);
      setActiveTool("Select");
      announce(`${object.kind === "arrow" ? "Arrow" : object.kind[0].toUpperCase() + object.kind.slice(1)} added to canvas`);
      setDraft(null);
    }
    canvasInteractionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleStageWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      zoomBy(event.deltaY > 0 ? -10 : 10);
      return;
    }
    setViewport((current) => ({ x: current.x - event.deltaX, y: current.y - event.deltaY }));
  };

  const handleObjectPointerDown = (event: React.PointerEvent<HTMLDivElement>, object: CanvasObject) => {
    event.stopPropagation();
    if ((event.target as HTMLElement).isContentEditable) {
      setSelectedObjectId(object.id);
      return;
    }
    if (activeTool === "Eraser") {
      removeCanvasObject(object.id);
      announce("Canvas object erased");
      return;
    }
    if (activeTool !== "Select") return;
    setSelectedObjectId(object.id);
    const point = stagePoint(event);
    canvasInteractionRef.current = { mode: "move", start: point, objectId: object.id, origin: { x: object.x, y: object.y } };
    canvasStageRef.current?.setPointerCapture(event.pointerId);
  };

  const handleResizePointerDown = (event: React.PointerEvent<HTMLElement>, object: CanvasObject, handle: ResizeHandle) => {
    event.preventDefault();
    event.stopPropagation();
    if (object.locked) {
      announce("This object is locked");
      return;
    }
    setSelectedObjectId(object.id);
    canvasInteractionRef.current = { mode: "resize", start: stagePoint(event), objectId: object.id, handle, originalObject: { ...object } };
    canvasStageRef.current?.setPointerCapture(event.pointerId);
  };

  const handleDirectionalResizePointerDown = (event: React.PointerEvent<HTMLElement>, object: CanvasObject, handle: ResizeHandle) => {
    event.preventDefault();
    event.stopPropagation();
    if (object.locked) {
      announce("This object is locked");
      return;
    }
    const original = { ...object };
    const start = { x: original.x, y: original.y };
    const end = { x: original.x + original.width, y: original.y + original.height };
    const length = Math.max(18, Math.hypot(original.width, original.height));
    const unit = { x: original.width / length, y: original.height / length };
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    const handlePoint: Point = {
      x: handle.includes("w") ? left : handle.includes("e") ? right : (left + right) / 2,
      y: handle.includes("n") ? top : handle.includes("s") ? bottom : (top + bottom) / 2,
    };
    const startDistance = Math.hypot(handlePoint.x - start.x, handlePoint.y - start.y);
    const endDistance = Math.hypot(handlePoint.x - end.x, handlePoint.y - end.y);
    const resizeStart = startDistance < endDistance || (startDistance === endDistance && (handle.includes("w") || handle.includes("n")));

    setSelectedObjectId(object.id);
    directionalResizeRef.current = { object: original, handle, pointerStart: stagePoint(event), start, end, unit, length, resizeStart, pointerId: event.pointerId };
    canvasStageRef.current?.setPointerCapture(event.pointerId);
  };

  const applyDirectionalResize = (clientX: number, clientY: number) => {
    const interaction = directionalResizeRef.current;
    if (!interaction) return;
    const current = clientToStagePoint(clientX, clientY);
    const delta = { x: current.x - interaction.pointerStart.x, y: current.y - interaction.pointerStart.y };
    const projectedDelta = delta.x * interaction.unit.x + delta.y * interaction.unit.y;
    const nextLength = Math.max(18, interaction.resizeStart ? interaction.length - projectedDelta : interaction.length + projectedDelta);
    const nextStart = interaction.resizeStart ? { x: interaction.end.x - interaction.unit.x * nextLength, y: interaction.end.y - interaction.unit.y * nextLength } : interaction.start;
    updateCanvasObject(interaction.object.id, { x: nextStart.x, y: nextStart.y, width: interaction.unit.x * nextLength, height: interaction.unit.y * nextLength });
  };

  const handleObjectDoubleClick = (object: CanvasObject) => {
    const label = document.querySelector(`[data-object-label="${object.id}"]`) as HTMLElement | null;
    label?.focus();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const point = pendingImagePointRef.current;
    event.target.value = "";
    if (!file || !point) return;
    const reader = new FileReader();
    reader.onload = () => {
      const object: CanvasObject = { id: objectId(), kind: "image", x: point.x, y: point.y, width: 180, height: 122, src: String(reader.result), ...objectStyleDefaults("image") };
      setCanvasObjects((current) => [...current, object]);
      setSelectedObjectId(object.id);
      setActiveTool("Select");
      announce("Image added to canvas");
    };
    reader.readAsDataURL(file);
  };

  const renderCanvasObject = (object: CanvasObject, isDraft = false) => {
    const selected = selectedObjectId === object.id && !isDraft;
    const className = `canvas-object canvas-object--${object.kind} ${selected ? "canvas-object--selected" : ""} ${isDraft ? "canvas-object--draft" : ""}`;
    const objectStyle = {
      backgroundColor: object.fill,
      borderColor: object.stroke,
      opacity: object.opacity,
      color: object.textColor,
      fontSize: `${object.fontSize}px`,
      fontWeight: object.fontWeight,
      fontStyle: object.fontStyle,
      textDecoration: object.textDecoration,
      textAlign: object.textAlign,
      "--object-stroke": object.stroke,
      "--object-fill": object.fill,
    } as React.CSSProperties;
    const eventProps = isDraft
      ? {}
      : {
          onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => handleObjectPointerDown(event, object),
          onDoubleClick: () => handleObjectDoubleClick(object),
        };
    if (object.kind === "line" || object.kind === "arrow" || object.kind === "connector") {
      const length = Math.max(18, Math.hypot(object.width, object.height));
      const angle = (Math.atan2(object.height, object.width) * 180) / Math.PI;
      const left = Math.min(object.x, object.x + object.width);
      const top = Math.min(object.y, object.y + object.height) - 9;
      const boundsWidth = Math.max(18, Math.abs(object.width));
      const boundsHeight = Math.max(18, Math.abs(object.height) + 18);
      const startX = object.width >= 0 ? object.x - left : object.x + object.width - left;
      const startY = object.height >= 0 ? object.y - top : object.y + object.height - top;
      return (
        <div key={object.id} className={`directional-bounds ${selected ? "directional-bounds--selected" : ""}`} style={{ left, top, width: boundsWidth, height: boundsHeight }}>
          <div role="button" tabIndex={0} aria-label={`Canvas ${object.kind}`} className={className} style={{ ...objectStyle, left: startX, top: startY - 9, width: length, transform: `rotate(${angle}deg)`, transformOrigin: "0 50%" }} {...eventProps}>
            <span />
          </div>
          {selected && !object.locked && (
            <>
              {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as ResizeHandle[]).map((handle) => (
                <i key={handle} className={`object-handle object-handle--${handle}`} onPointerDown={(event) => handleDirectionalResizePointerDown(event, object, handle)} />
              ))}
            </>
          )}
        </div>
      );
    }
    return (
      <div key={object.id} role="button" tabIndex={0} aria-label={`Canvas ${object.kind}`} className={className} style={{ ...objectStyle, left: object.x, top: object.y, width: object.width, height: object.height }} {...eventProps}>
        {object.kind === "image" && object.src && <img src={object.src} alt="Canvas upload" />}
        {object.kind === "table" && <span className="table-cells"><i /><i /><i /><i /><i /><i /></span>}
        {object.kind !== "image" && object.kind !== "table" && (
          <span
            className="object-label"
            data-object-label={object.id}
            contentEditable={!isDraft && selected}
            suppressContentEditableWarning
            onPointerDown={(event) => event.stopPropagation()}
            onBlur={(event) => updateCanvasObject(object.id, { text: event.currentTarget.textContent?.trim() || "" })}
          >
            {object.text ?? ""}
          </span>
        )}
        {selected && !object.locked && !["line", "arrow", "connector"].includes(object.kind) && (
          <>
            {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as ResizeHandle[]).map((handle) => (
              <i key={handle} className={`object-handle object-handle--${handle}`} onPointerDown={(event) => handleResizePointerDown(event, object, handle)} />
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <main className="studio-shell drawio-sketch-page answerly-drawio-studio">
      <header className="studio-header">
        <button type="button" className="back-button" onClick={() => router.push(returnTo)} aria-label="Back">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="brand-cluster">
          <div className="brand-mark flex items-center justify-center" role="img" aria-label="Answerly">
            <Sparkles size={18} strokeWidth={2} color="#c9a6ff" />
          </div>
          <span className="brand-name"><i />Answerly</span>
          <span className="header-divider" />
          <span className="studio-name">Type 13: Draw.io Studio</span>
          <span className="header-divider header-divider--desktop" />
          <label className="document-name">
            <input
              aria-label="Document name"
              value={documentName}
              onChange={(event) => setDocumentName(event.target.value)}
            />
            <FileText size={14} />
          </label>
        </div>

        <div className="header-actions">
          <LanguageToggle />
          <ThemeToggle />
          <button className="use-button" onClick={addToQuestion} aria-label="Add diagram to question">
            <Check size={15} /> Add to Question
          </button>
          <button className="mobile-menu" onClick={() => announce("Use the studio controls below on smaller screens")} aria-label="Open mobile menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <section className="studio-body">
        <div className="editor-commandbar" aria-label="Diagram commands">
          <nav className="editor-menu" aria-label="Draw.io menus">
            {Object.entries(editorMenuItems).map(([menu, items]) => (
              <div className="editor-menu-group" key={menu}>
                <button className="editor-menu-trigger" aria-expanded={openMenu === menu} onClick={() => setOpenMenu((current) => current === menu ? null : menu)}>{menu}</button>
                {openMenu === menu && <div className="editor-menu-popover" role="menu">{items.map((item) => <button key={item.label} role="menuitem" onClick={() => runEditorCommand(item.command)}>{item.label}</button>)}</div>}
              </div>
            ))}
          </nav>
          <div className="editor-command-actions">
            <button className="icon-action" onClick={() => nativeEditorRef.current?.undo()} aria-label="Undo"><Undo2 size={17} /></button>
            <button className="icon-action" onClick={() => nativeEditorRef.current?.redo()} aria-label="Redo"><Redo2 size={17} /></button>
            <div className="zoom-select"><button onClick={() => zoomBy(-10)} aria-label="Zoom out"><ZoomOut size={14} /></button><span>{zoom}%</span><button onClick={() => zoomBy(10)} aria-label="Zoom in"><ZoomIn size={14} /></button></div>
            <button className="editor-action" onClick={saveDiagram}><Save size={15} /> Save</button>
            <div className="editor-menu-group">
              <button className="editor-action" aria-expanded={openMenu === "Export"} onClick={() => setOpenMenu((current) => current === "Export" ? null : "Export")}><Download size={15} /> Export <ChevronDown size={13} /></button>
              {openMenu === "Export" && <div className="editor-menu-popover editor-menu-popover--right" role="menu">{(["PNG", "SVG", "PDF"] as const).map((format) => <button key={format} role="menuitem" onClick={() => exportDiagram(format)}>Export {format}</button>)}</div>}
            </div>
          </div>
        </div>
        <aside className="tool-rail" aria-label="Drawing tools">
          {studioTools.map((tool) => (
            <ToolButton
              key={tool.label}
              tool={tool}
              active={activeTool === tool.label}
              onClick={() => selectTool(tool.label)}
            />
          ))}
        </aside>

        <aside className="shape-library" aria-label="Shape library">
          <div className="library-heading">
            <span>Shapes</span>
            <span className="sidebar-scroll-buttons"><button onClick={() => scrollSidebar("shapes", "up")} aria-label="Scroll Shapes up"><ArrowUp size={14} /></button><button onClick={() => scrollSidebar("shapes", "down")} aria-label="Scroll Shapes down"><ArrowDown size={14} /></button><button onClick={() => announce("Shape library options opened")} aria-label="More shape options"><MoreHorizontal size={18} /></button></span>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input aria-label="Search shapes" placeholder="Type / to search" />
          </label>

          <div className="shape-scroll" ref={shapeScrollRef} tabIndex={0} aria-label="Scrollable Shapes panel">
            <section className="scratchpad-section">
              <div className="scratchpad-heading"><span>Scratchpad</span><span className="scratchpad-actions"><button aria-label="Add scratchpad item" onClick={() => announce("Scratchpad item ready to receive a shape")}><Plus size={13} /></button><button aria-label="Edit scratchpad" onClick={() => announce("Scratchpad edit mode selected")}><Pencil size={13} /></button><button aria-label="Clear scratchpad" onClick={() => announce("Scratchpad is empty")}><X size={13} /></button></span></div>
              <button className="scratchpad-drop" onClick={() => announce("Drag any left-panel shape here to reuse it")}>Drag elements here</button>
            </section>
            {shapeCategories.map((category) => (
              <section className="shape-group" key={category.label}>
                <div className="shape-group-title">
                  <span>{category.label}</span>
                  <ChevronDown size={14} />
                </div>
                <div className="shape-grid">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={`${category.label}-${item.label}`} onClick={() => insertLibraryShape(item)} aria-label={`Add ${item.label}`} title={item.label}>
                        {item.preview ? <StencilPreview variant={item.preview} /> : <Icon size={28} strokeWidth={1.35} />}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="library-links">
              {secondaryLibraries.map((library) => {
                const LibraryIcon = library.icon;
                const expanded = openLibraryGroups.includes(library.label);
                return (
                  <section className={`library-expandable ${expanded ? "is-expanded" : ""}`} key={library.label}>
                    <button aria-expanded={expanded} onClick={() => toggleLibraryGroup(library.label)}>
                      <LibraryIcon size={16} /> <span>{library.label}</span> <ChevronDown size={14} />
                    </button>
                    {expanded && <div className="library-link-grid">{library.items.map((item) => {
                      const ItemIcon = item.icon;
                      return <button key={item.label} className="library-shape-button" onClick={() => insertLibraryShape(item)} aria-label={`Add ${item.label}`} title={item.label}>{item.preview ? <StencilPreview variant={item.preview} /> : <ItemIcon size={22} />}</button>;
                    })}</div>}
                  </section>
                );
              })}
            </div>

            <button className="more-shapes-button" onClick={() => setOpenLibraryGroups(secondaryLibraries.map((library) => library.label))}>+ More Shapes</button>

            <section className="quick-templates">
              <div className="template-heading"><span>Teaching starts</span><Plus size={15} /></div>
              {templates.map((template) => (
                <button key={template.title} className="template-card" onClick={() => insertTemplate(template.title)}>
                  <StencilPreview variant={template.preview} />
                  <span>{template.title}</span>
                </button>
              ))}
            </section>
          </div>
        </aside>

        <section className="workspace" aria-label="Drawing workspace">
          <div className="workspace-topline">
            <div className="mode-indicator"><span className="active-dot" /> {activeTool} tool <span className="mode-divider" /> Shape the explanation · Type 13: Draw.io Studio</div>
            <div className="workspace-quick-actions">
              {(activeTool === "Draw" || activeTool === "Eraser") && <button className="clear-drawing" disabled={!inkCount} onClick={clearInk}><Trash2 size={14} /> Clear ink</button>}
              {selectedObjectId && <button className="clear-drawing" onClick={() => { removeCanvasObject(selectedObjectId); announce("Selected object deleted"); }}><Trash2 size={14} /> Delete object</button>}
              <button className="canvas-option" onClick={() => announce("Canvas comments are empty")}> <MessageSquare size={15} /> 0 comments</button>
            </div>
          </div>
          <div className={`canvas-wrap tldraw-engine ${gridVisible ? "show-grid" : "hide-grid"} ${pageView ? "show-page-view" : "hide-page-view"}`} style={{ "--drawio-page-background": pageBackgroundVisible ? pageBackground : "transparent", "--page-viewport-x": `${Math.round(((sketchScroll.x - 50) / 50) * 180)}px`, "--page-viewport-y": `${Math.round(((sketchScroll.y - 50) / 50) * 130)}px` } as React.CSSProperties} aria-label="Native diagram editor canvas">
            <div className="canvas-page-viewport" aria-label="Diagram page viewport">
            <Tldraw persistenceKey="answerly-drawio-studio-native-canvas-v2" options={nativeEditorOptions} onMount={(editor) => {
              nativeEditorRef.current = editor;
              editor.sideEffects.registerBeforeChangeHandler("camera", keepCameraRecordFinite);
              editor.user.updateUserPreferences({ isSnapMode: snapEnabled });
              if (repairLegacyCanvasViewport(editor)) announce("Your existing sketch was kept and returned to a stable canvas position");
              const camera = editor.getCamera();
              if (hasSafeNativeCamera(editor)) {
                const z = camera.z < 0.5 ? 1 : camera.z;
                if (z !== camera.z) editor.setCamera({ x: camera.x, y: camera.y, z });
                setZoom(Math.round(z * 100));
                setZoomInput(String(Math.round(z * 100)));
              }
              const sync = () => {
                syncNativeDirectionalFrame(editor);
                syncCanvasZoom(editor);
                syncEditorPages(editor);
              };
              editor.store.listen(sync);
              sync();
            }} />
            {nativeRelationFrame && <div className="native-relation-frame" style={{ left: nativeRelationFrame.left, top: nativeRelationFrame.top, width: nativeRelationFrame.width, height: nativeRelationFrame.height }} aria-label="Shape relation handles">
              {(["n", "e", "s", "w"] as RelationDirection[]).map((direction) => <button key={direction} className={`native-relation-handle native-relation-handle--${direction}`} aria-label={`Create relation ${direction}`} title="Drag to another shape to connect" onPointerDown={(event) => startNativeRelation(event, direction)}><MoveRight size={13} strokeWidth={2.5} /></button>)}
            </div>}
            {nativeDirectionalFrame && <div className="native-directional-frame" style={{ left: nativeDirectionalFrame.left, top: nativeDirectionalFrame.top, width: nativeDirectionalFrame.width, height: nativeDirectionalFrame.height }} aria-label="Arrow resize frame">
              {framedResizeHandles.map((handle) => <button key={handle} className={`native-frame-handle native-frame-handle--${handle}`} aria-label={`Resize arrow ${handle}`} onPointerDown={(event) => startNativeFrameResize(event, handle)} onPointerUp={finishNativeFrameResize} onPointerCancel={finishNativeFrameResize} />)}
              <button className="native-arrow-control native-arrow-control--rotate" aria-label="Rotate arrow" title="Rotate arrow" onPointerDown={(event) => startNativeArrowControl(event, "rotate")} onPointerUp={finishNativeArrowControl} onPointerCancel={finishNativeArrowControl}><RotateCcw size={10} strokeWidth={2.3} /></button>
              <button className="native-arrow-control native-arrow-control--adjust" aria-label="Adjust arrow bend" title="Adjust arrow bend" onPointerDown={(event) => startNativeArrowControl(event, "adjust")} onPointerUp={finishNativeArrowControl} onPointerCancel={finishNativeArrowControl} />
            </div>}
            </div>
            <label className="sketch-scrollbar sketch-scrollbar--horizontal" aria-label="Horizontal sketch scroll"><span>↔</span><input type="range" min="0" max="100" value={sketchScroll.x} onChange={(event) => scrollSketch("x", Number(event.target.value))} /></label>
            <label className="sketch-scrollbar sketch-scrollbar--vertical" aria-label="Vertical sketch scroll"><span>↕</span><input type="range" min="0" max="100" value={sketchScroll.y} onChange={(event) => scrollSketch("y", Number(event.target.value))} /></label>
            <div className="native-canvas-hint">Arrow endpoints snap to nearby shapes within {nativeEndpointSnapDistance}px; outside that safe zone, they remain free. Directional resizing is capped at {maximumDirectionalExtent.toLocaleString()}px to keep the canvas stable.</div>
          </div>
        </section>

        {rightPanelOpen && (
          <aside className="inspector" aria-label="Format inspector">
            <div className="inspector-heading">
              <span>Format</span>
              <span className="sidebar-scroll-buttons"><button onClick={() => scrollSidebar("format", "up")} aria-label="Scroll Format up"><ArrowUp size={14} /></button><button onClick={() => scrollSidebar("format", "down")} aria-label="Scroll Format down"><ArrowDown size={14} /></button><button onClick={() => setRightPanelOpen(false)} aria-label="Close inspector"><X size={16} /></button></span>
            </div>
            <div className="format-tabs">
              {(["Diagram", "Style", "Text", "Arrange"] as const).map((tab) => <button key={tab} className={formatTab === tab ? "active" : ""} onClick={() => setFormatTab(tab)}>{tab}</button>)}
            </div>
            <div className="inspector-scroll" ref={inspectorScrollRef} tabIndex={0} aria-label="Scrollable Format panel">
              <div className={`inspector-context ${hasFormatSelection ? "inspector-context--active" : ""}`}>{formatSelectionLabel}</div>
              {formatTab === "Diagram" && !hasFormatSelection && <>
                <section className="format-section format-section--active diagram-settings-section">
                  <div className="section-mini-title">View</div>
                  <label className="diagram-setting"><input type="checkbox" checked={gridVisible} onChange={(event) => setGridVisible(event.target.checked)} /> <span>Grid</span><span className="setting-value">10 pt</span></label>
                  <label className="diagram-setting"><input type="checkbox" checked={pageView} onChange={(event) => setPageView(event.target.checked)} /> <span>Page View</span></label>
                  <label className="diagram-setting"><input type="checkbox" checked={pageBackgroundVisible} onChange={(event) => setPageBackgroundVisible(event.target.checked)} /> <span>Background</span><input aria-label="Page background color" className="diagram-color-input" type="color" value={pageBackground} onChange={(event) => setPageBackground(event.target.value)} disabled={!pageBackgroundVisible} /></label>
                </section>
                <section className="format-section format-section--active diagram-settings-section">
                  <div className="section-mini-title">Options</div>
                  <label className="diagram-setting"><input type="checkbox" checked={connectionArrows} onChange={(event) => setConnectionArrows(event.target.checked)} /> <span>Connection Arrows</span></label>
                  <label className="diagram-setting"><input type="checkbox" checked={snapEnabled} onChange={(event) => setNativeSnapping(event.target.checked)} /> <span>Connection Points</span></label>
                  <label className="diagram-setting"><input type="checkbox" checked={guidesVisible} onChange={(event) => setGuidesVisible(event.target.checked)} /> <span>Guides</span></label>
                </section>
                <section className="format-section format-section--active diagram-settings-section">
                  <label className="paper-size-setting"><span>Paper Size</span><select aria-label="Paper size" value={pagePreset} onChange={(event) => setPagePreset(event.target.value)}><option value="4 / 3">4 / 3</option><option value="16 / 9">16 / 9</option><option value="A4">A4</option></select></label>
                  <button className="format-wide-action" onClick={() => document.querySelector<HTMLInputElement>("[aria-label='Document name']")?.focus()}>Edit diagram title</button>
                  <button className="format-wide-action" onClick={() => { setPageBackground("#161616"); setGridVisible(true); setPageView(true); }}>Reset page settings</button>
                </section>
              </>}
              {formatTab === "Style" && <>
                <section className={`format-section ${hasFormatSelection ? "format-section--active" : "format-section--disabled"}`}>
                  <div className="drawio-color-grid">{["black", "grey", "violet", "blue", "green", "orange", "red", "yellow"].map((color) => <button key={color} className={`drawio-color drawio-color--${color}`} disabled={!hasFormatSelection} title={`Line ${color}`} onClick={() => updateFormatSelection({ color })} />)}</div>
                  <div className="style-toggle-row"><label><input type="checkbox" checked={nativeSelectedShape ? nativeSelectedShape.props?.fill !== "none" : Boolean(selectedObject?.fill !== "transparent")} onChange={(event) => updateFormatSelection({ fill: event.target.checked ? "solid" : "none" })} disabled={!hasFormatSelection} /> Fill</label><button className="select-chip" onClick={() => updateFormatSelection({ fill: "solid" })} disabled={!hasFormatSelection}>Automatic <ChevronDown size={13} /></button></div>
                  <div className="style-toggle-row"><label><input type="checkbox" defaultChecked disabled={!hasFormatSelection} /> Gradient</label><button className="select-chip" onClick={() => announce("Gradient controls are prepared for compatible shapes")} disabled={!hasFormatSelection}>None <ChevronDown size={13} /></button></div>
                </section>
                <section className={`format-section ${hasFormatSelection ? "format-section--active" : "format-section--disabled"}`}>
                  <div className="section-mini-title">Line</div>
                  <div className="property-row"><span>Line</span><button className="select-chip" onClick={() => updateFormatSelection({ dash: "solid" })} disabled={!hasFormatSelection}><Minus size={25} /><ChevronDown size={13} /></button><button className="select-chip" onClick={() => updateFormatSelection({ color: "black" })} disabled={!hasFormatSelection}>1 pt <ChevronDown size={13} /></button></div>
                  <div className="property-row opacity"><span>Opacity</span><span className="select-chip">{Math.round(((nativeSelectedShape?.opacity as number | undefined) ?? selectedObject?.opacity ?? 1) * 100)}%</span><input aria-label="Shape opacity" type="range" min="10" max="100" value={Math.round(((nativeSelectedShape?.opacity as number | undefined) ?? selectedObject?.opacity ?? 1) * 100)} onChange={(event) => updateFormatSelection({}, { opacity: Number(event.target.value) / 100 })} disabled={!hasFormatSelection} /></div>
                </section>
                <section className="format-section compact-action-section"><button className="format-wide-action" onClick={() => announce("Style copied")}>Copy Style</button><button className="format-wide-action" onClick={() => announce("Default style saved")}>Set as Default Style</button></section>
              </>}
              {formatTab === "Text" && <section className={`format-section ${hasFormatSelection ? "format-section--active" : "format-section--disabled"}`}>
                <div className="font-row"><button className="font-select" onClick={() => updateFormatSelection({ font: "sans" })} disabled={!hasFormatSelection}>Helvetica <ChevronDown size={13} /></button><button className="select-chip" onClick={() => updateFormatSelection({ size: "m" })} disabled={!hasFormatSelection}>14 <ChevronDown size={13} /></button><button className="select-chip" onClick={() => updateFormatSelection({ labelColor: "black" })} disabled={!hasFormatSelection}>A</button></div>
                <div className="format-buttons"><button onClick={() => announce("Bold applies to supported native text")} disabled={!hasFormatSelection}><Bold size={15} /></button><button onClick={() => announce("Italic applies to supported native text")} disabled={!hasFormatSelection}><Italic size={15} /></button><button onClick={() => announce("Underline applies to supported native text")} disabled={!hasFormatSelection}><Underline size={15} /></button><button onClick={() => updateFormatSelection({ align: "start" })} disabled={!hasFormatSelection}><AlignLeft size={15} /></button><button onClick={() => updateFormatSelection({ align: "middle" })} disabled={!hasFormatSelection}><AlignCenter size={15} /></button><button onClick={() => updateFormatSelection({ align: "end" })} disabled={!hasFormatSelection}><AlignRight size={15} /></button></div>
                <div className="text-layout-grid"><button disabled={!hasFormatSelection} onClick={() => announce("Top alignment selected")}>Top</button><button disabled={!hasFormatSelection} onClick={() => announce("Middle alignment selected")}>Middle</button><button disabled={!hasFormatSelection} onClick={() => announce("Bottom alignment selected")}>Bottom</button></div>
              </section>}
              {formatTab === "Arrange" && <section className="format-section format-section--active">
                {nativeTableSelection && <><div className="section-mini-title">Table</div><div className="table-dimension-summary">{nativeTableRows} rows × {nativeTableColumns} columns</div><div className="table-structure-grid"><span>Rows</span><button aria-label="Remove table row" disabled={nativeTableRows <= 1} onClick={() => updateNativeTableStructure("rows", nativeTableRows - 1)}>−</button><input key={`table-rows-${nativeTableSelection.id}`} aria-label="Table row count" type="number" min="1" max="12" defaultValue={nativeTableRows} onBlur={(event) => updateNativeTableStructure("rows", Number(event.target.value))} /><button aria-label="Add table row" disabled={nativeTableRows >= 12} onClick={() => updateNativeTableStructure("rows", nativeTableRows + 1)}>+</button><span>Columns</span><button aria-label="Remove table column" disabled={nativeTableColumns <= 1} onClick={() => updateNativeTableStructure("columns", nativeTableColumns - 1)}>−</button><input key={`table-columns-${nativeTableSelection.id}`} aria-label="Table column count" type="number" min="1" max="12" defaultValue={nativeTableColumns} onBlur={(event) => updateNativeTableStructure("columns", Number(event.target.value))} /><button aria-label="Add table column" disabled={nativeTableColumns >= 12} onClick={() => updateNativeTableStructure("columns", nativeTableColumns + 1)}>+</button></div></>}
                <div className="section-mini-title">Selection</div>
                <div className="selection-readout">{nativeSelectionCount ? `${nativeSelectionCount} native shape${nativeSelectionCount === 1 ? "" : "s"} selected` : "Select shapes with Shift + click"}</div>
                <div className="selection-actions"><button onClick={() => nativeEditorRef.current?.selectAll()}><Check size={14} /> Select all</button><button disabled={!nativeSelectionCount} onClick={() => nativeEditorRef.current?.setSelectedShapes([])}><X size={14} /> Clear</button></div>
                <div className="section-mini-title">Group</div>
                <div className="selection-actions"><button disabled={!hasNativeMultiSelection} onClick={groupNativeSelection}><Layers3 size={14} /> Group</button><button disabled={!nativeSelectionHasGroup} onClick={ungroupNativeSelection}><Copy size={14} /> Ungroup</button></div>
                <div className="section-mini-title">Order</div><div className="arrange-grid">{(["To Front", "Forward", "Backward", "To Back"] as const).map((item) => <button key={item} onClick={() => arrangeFormatSelection(item)} disabled={!nativeSelectionCount && !selectedObject}><Copy size={15} />{item}</button>)}</div>
                <div className="section-mini-title">Align</div><div className="native-align-grid"><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("left")}><AlignLeft size={15} />Left</button><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("center-horizontal")}><AlignCenter size={15} />Center</button><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("right")}><AlignRight size={15} />Right</button><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("top")}><ArrowUp size={15} />Top</button><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("center-vertical")}><Circle size={14} />Middle</button><button disabled={!hasNativeMultiSelection} onClick={() => alignNativeSelection("bottom")}><ArrowDown size={15} />Bottom</button></div>
                <div className="section-mini-title">Distribute</div><div className="selection-actions"><button disabled={nativeSelectionCount < 3} onClick={() => distributeNativeSelection("horizontal")}>Horizontal</button><button disabled={nativeSelectionCount < 3} onClick={() => distributeNativeSelection("vertical")}>Vertical</button></div>
                {hasSingleFormatSelection && <button className="lock-button" onClick={() => nativeSelectedShape ? updateFormatSelection({}, { isLocked: !nativeSelectedShape.isLocked }) : selectedObject ? updateSelectedObject({ locked: !selectedObject.locked }) : undefined}><Lock size={14} /> {nativeSelectedShape?.isLocked || selectedObject?.locked ? "Unlock" : "Lock"}</button>}
              </section>}

              <section className="format-section layers-section">
                <div className="layers-title"><span>Layers</span><button onClick={() => announce("New layer created")}><Plus size={16} /></button></div>
                {["Flowchart", "Labels", "Background"].map((layer) => (
                  <button key={layer} className={`layer-row ${activeLayer === layer ? "active-layer" : ""}`} onClick={() => setActiveLayer(layer)}>
                    <Eye size={15} /><Layers3 size={14} /><span>{layer}</span>{layer !== "Labels" && <Lock size={13} />}<MoreHorizontal size={15} />
                  </button>
                ))}
              </section>
            </div>
          </aside>
        )}
        {!rightPanelOpen && <button className="restore-inspector" onClick={() => setRightPanelOpen(true)} aria-label="Open format inspector"><PanelRight size={18} /></button>}
      </section>

      <footer className="status-bar">
        <div className="page-status" aria-label="Diagram pages"><button className="page-add-button" onClick={addEditorPage} aria-label="Add page"><Plus size={15} /><span>Add Page</span></button><span className="status-divider" />{editorPages.map((page) => <button key={page.id} className={`page-tab ${page.id === activePageId ? "active-page-tab" : ""}`} onClick={() => switchEditorPage(page.id)} title={`Open ${page.name}`}>{page.name}</button>)}<button className="page-more-button" onClick={addEditorPage} title="Add another page" aria-label="Add another page"><Plus size={14} /></button></div>
        <div className="canvas-status"><span>Canvas: 1600 × 1200 px</span><span className="status-divider" /><span className="active-page-readout">Editing: {editorPages.find((page) => page.id === activePageId)?.name ?? "Page 1"}</span><button className="status-toggle" onClick={() => setGridVisible((value) => !value)}>Grid <span className={gridVisible ? "toggle active" : "toggle"}><i /></span></button><button className="status-toggle" onClick={() => setNativeSnapping(!snapEnabled)}>Snap <span className={snapEnabled ? "toggle active" : "toggle"}><i /></span></button></div>
        <div className="zoom-status"><button onClick={() => zoomBy(-10)} aria-label="Zoom out"><ZoomOut size={16} /></button><label className="canvas-zoom-input"><input aria-label="Canvas zoom percentage" type="number" min="25" max="400" step="1" value={zoomInput} onChange={(event) => setZoomInput(event.target.value)} onBlur={(event) => setCanvasZoomPercent(Number(event.target.value))} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /><span>%</span></label><button onClick={() => zoomBy(10)} aria-label="Zoom in"><ZoomIn size={16} /></button><button onClick={fitCanvas} aria-label="Fit canvas"><RotateCcw size={16} /></button></div>
        <div className="export-status"><span>Export as:</span>{["PNG", "SVG", "PDF"].map((type) => <button key={type} onClick={() => announce(`${type} export prepared`)}>{type}</button>)}</div>
      </footer>
    </main>
  );
}
