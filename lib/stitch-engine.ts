
import { QuestionType, Difficulty } from "./questions";

export interface StitchOption {
  id: string;
  name: string;
  type: QuestionType;
  defaultData: any;
  template: {
    question: string;
    options?: string[];
    correctAnswer: string;
    difficulty: Difficulty;
  };
}

export const STITCH_OPTIONS: Record<string, StitchOption> = {
  "card-customizable": {
    id: "card-customizable",
    name: "Customizable Design",
    type: "multiple_choice",
    defaultData: { color: "purple" },
    template: {
      question: "Which property makes this Stitch design 'Customizable'?",
      options: ["Fixed Layout", "Dynamic Props", "Static CSS", "Hardcoded Values"],
      correctAnswer: "Dynamic Props",
      difficulty: "medium",
    },
  },
  "card-smooth": {
    id: "card-smooth",
    name: "Smooth Interaction",
    type: "true_false",
    defaultData: { animation: "framer-motion" },
    template: {
      question: "Does this Stitch design use Framer Motion for smooth transitions?",
      correctAnswer: "true",
      difficulty: "easy",
    },
  },
  "card-reliable": {
    id: "card-reliable",
    name: "Reliable Architecture",
    type: "code_snippet",
    defaultData: { lang: "typescript" },
    template: {
      question: "Implement a reliable Stitch component interface in TypeScript.",
      correctAnswer: "interface StitchComponent { id: string; render: () => JSX.Element; }",
      difficulty: "hard",
    },
  },
  "galaxy-background": {
    id: "galaxy-background",
    name: "Atmospheric Galaxy",
    type: "open_ended",
    defaultData: { theme: "dark" },
    template: {
      question: "Describe how the 'Atmospheric Depth' is achieved in this Galaxy design.",
      correctAnswer: "Through the use of layered particles, radial gradients, and parallax mouse movement.",
      difficulty: "medium",
    },
  }
};

export function generateStitchQuestion(optionId: string) {
  const option = STITCH_OPTIONS[optionId];
  if (!option) return null;

  // Standardization validation
  if (!option.template.question || !option.template.correctAnswer) {
    throw new Error(`Invalid Stitch Template for ${optionId}`);
  }

  return {
    ...option.template,
    stitchId: option.id,
    generatedAt: new Date().toISOString(),
    standardized: true,
  };
}
