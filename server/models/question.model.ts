// server/models/question.model.ts
import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./category.model";

export interface ITextAnnotation {
  id: string;
  text: string;
  x: number; // Position percentage (0-100)
  y: number; // Position percentage (0-100)
  fontSize: number;
  color: string; // Hex color
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  maxWidth?: number;
}

export interface IDrawingAnnotation {
  id: string;
  type: "pen" | "rectangle" | "circle" | "line";
  points?: [number, number][];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  opacity?: number;
  strokeWidth?: number;
}

export interface IAnnotations {
  textAnnotations?: ITextAnnotation[];
  drawingAnnotations?: IDrawingAnnotation[];
}

export interface IMedia {
  url: string;
  type: "image" | "gif";
  position: number;
  caption?: string;
  width?: "full" | "half" | "small" | "auto"; // Image width/sizing
  maxWidth?: number; // Max width in pixels (optional)
  annotations?: IAnnotations; // Image annotations metadata (not merged with image)
}

export interface IContentLayout {
  showHeading?: boolean;
  showDescription?: boolean;
  headingPosition?: "before" | "after";
  descriptionPosition?: "before" | "after";
}

export interface IQuestion extends Document {
  text: string;
  options?: string[]; // Multiple choice answers
  correctAnswer?: string; // Can be an option or a key
  keywords?: string[]; // Keywords for open-ended question evaluation
  category: ICategory["_id"]; // Reference to any level category
  reason?: string;
  difficulty?: "easy" | "medium" | "hard";
  type?:
    | "multiple_choice"
    | "true_false"
    | "code_snippet"
    | "open_ended"
    | "listening"
    | "fill_in_blank"
    | "match_pairs"
    | "ordering"
    | "math_equation"
    | "graph_chart"
    | "diagram_label"
    | "image_mcq";
  audioUrl?: string;
  listeningAnswerFormat?: "mcq" | "open";
  blankTemplate?: string;
  blankAnswers?: string[];
  matchPairs?: Array<{ left: string; right: string }>;
  orderItems?: string[];
  latex?: string;
  diagramLabels?: Array<{ x: number; y: number; label: string }>;
  createdBy?: string; // Reference to user who created the question
  heading?: string; // Question heading/title
  description?: string; // Question description/context
  media?: IMedia[]; // Media items (images/GIFs)
  contentLayout?: IContentLayout; // Layout configuration
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    options: { type: [String] }, // Made optional for different question types
    correctAnswer: { type: String }, // Made optional for different question types
    keywords: { type: [String] }, // Keywords for open-ended question evaluation
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    reason: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: {
      type: String,
      enum: [
        "multiple_choice",
        "true_false",
        "code_snippet",
        "open_ended",
        "listening",
        "fill_in_blank",
        "match_pairs",
        "ordering",
        "math_equation",
        "graph_chart",
        "diagram_label",
        "image_mcq",
      ],
      default: "multiple_choice",
    },
    audioUrl: { type: String },
    listeningAnswerFormat: { type: String, enum: ["mcq", "open"] },
    blankTemplate: { type: String },
    blankAnswers: { type: [String] },
    matchPairs: [
      {
        left: { type: String },
        right: { type: String },
      },
    ],
    orderItems: { type: [String] },
    latex: { type: String },
    diagramLabels: [
      {
        x: { type: Number },
        y: { type: Number },
        label: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Reference to user
    heading: { type: String, trim: true }, // Question heading/title
    description: { type: String, trim: true }, // Question description/context
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "gif"], required: true },
        position: { type: Number, required: true },
        caption: { type: String, trim: true },
        width: { type: String, enum: ["full", "half", "small", "auto"], default: "auto" },
        maxWidth: { type: Number, default: 800 },
        annotations: {
          textAnnotations: [
            {
              id: { type: String, required: true },
              text: { type: String, required: true },
              x: { type: Number, required: true },
              y: { type: Number, required: true },
              fontSize: { type: Number, default: 16 },
              color: { type: String, default: "#000000" },
              fontFamily: { type: String, default: "Arial" },
              fontWeight: { type: String, enum: ["normal", "bold"], default: "normal" },
              textAlign: { type: String, enum: ["left", "center", "right"], default: "left" },
              maxWidth: { type: Number, default: 200 },
            },
          ],
          drawingAnnotations: [
            {
              id: { type: String, required: true },
              type: { type: String, enum: ["pen", "rectangle", "circle", "line"], required: true },
              points: { type: [[Number]] },
              x: { type: Number },
              y: { type: Number },
              width: { type: Number },
              height: { type: Number },
              color: { type: String, required: true },
              opacity: { type: Number, default: 1 },
              strokeWidth: { type: Number, default: 2 },
            },
          ],
        },
      },
    ],
    contentLayout: {
      showHeading: { type: Boolean, default: true },
      showDescription: { type: Boolean, default: true },
      headingPosition: { type: String, enum: ["before", "after"], default: "before" },
      descriptionPosition: { type: String, enum: ["before", "after"], default: "before" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
