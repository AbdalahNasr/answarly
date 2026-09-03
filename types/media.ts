/**
 * Media-related type definitions
 */

/**
 * Text annotation on image - stores position, text, and styling
 */
export interface TextAnnotation {
  id: string; // Unique identifier for the annotation
  text: string;
  x: number; // Position from left (0-100 percentage)
  y: number; // Position from top (0-100 percentage)
  fontSize: number; // Font size in pixels
  color: string; // Hex color (e.g., "#FF0000")
  fontFamily?: string; // Font family name
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  maxWidth?: number; // Max width in pixels for text wrapping
}

/**
 * Drawing annotation on image - stores path and styling
 */
export interface DrawingAnnotation {
  id: string;
  type: "pen" | "rectangle" | "circle" | "line";
  points?: [number, number][]; // For pen - array of coordinates
  x?: number; // For shapes - position
  y?: number;
  width?: number; // For shapes
  height?: number;
  color: string; // Stroke/fill color
  opacity?: number;
  strokeWidth?: number;
}

/**
 * All annotations on an image
 */
export interface Annotation {
  textAnnotations?: TextAnnotation[];
  drawingAnnotations?: DrawingAnnotation[];
}

/**
 * Media item with annotations support
 */
export interface Media {
  url: string;
  type: "image" | "gif";
  position: number;
  caption?: string;
  width?: "full" | "half" | "small" | "auto";
  maxWidth?: number;
  fileName?: string;
  annotations?: Annotation; // New field for storing annotations
}
