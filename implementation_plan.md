# Expand Answerly Question Types: 4 → 12

Extend the question system by adding 8 new types while keeping the existing 4 intact.

**Existing types (keep):** `multiple_choice`, `true_false`, `code_snippet`, `open_ended`
**New types (add):** `listening`, `fill_in_blank`, `match_pairs`, `ordering`, `math_equation`, `graph_chart`, `diagram_label`, `image_mcq`

---

## New Dependencies

| Package | Purpose | Size |
|---------|---------|------|
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | Drag-and-drop for Match Pairs & Ordering | ~50KB gz |
| `katex` + `@types/katex` | LaTeX rendering for Math/Equation type | ~300KB (CSS+fonts) |

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities katex
npm install -D @types/katex
```

---

## Proposed Changes

### 1. Data Layer

---

#### [MODIFY] [question.model.ts](file:///d:/Next.js-projects/answarly/server/models/question.model.ts)

**Expand the `type` enum** and add new type-specific fields to both interface and schema:

```diff
 type: {
   type: String,
-  enum: ["multiple_choice", "true_false", "code_snippet", "open_ended"],
+  enum: [
+    "multiple_choice", "true_false", "code_snippet", "open_ended",
+    "listening", "fill_in_blank", "match_pairs", "ordering",
+    "math_equation", "graph_chart", "diagram_label", "image_mcq"
+  ],
   default: "multiple_choice",
 },
```

**New fields:**

| Field | Type | Used by |
|-------|------|---------|
| `audioUrl` | `String` | listening |
| `listeningAnswerFormat` | `enum: ["mcq","open_ended"]` | listening |
| `blankTemplate` | `String` | fill_in_blank |
| `blankAnswers` | `[String]` | fill_in_blank |
| `matchPairs` | `[{ left: String, right: String }]` | match_pairs |
| `orderItems` | `[String]` | ordering (correct order) |
| `latex` | `String` | math_equation |
| `diagramLabels` | `[{ id: String, text: String, x: Number, y: Number }]` | diagram_label |

> [!NOTE]
> `graph_chart` and `image_mcq` reuse existing `media[]` for the image and `options[]`/`correctAnswer` for answers — no new fields needed. `diagram_label` uses a positioned-label array overlaid on the existing `media[]` image.

---

#### [MODIFY] [questions.ts](file:///d:/Next.js-projects/answarly/lib/questions.ts)

```diff
-export type QuestionType = 'multiple_choice' | 'code_snippet' | 'true_false' | 'open_ended'
+export type QuestionType =
+  | 'multiple_choice' | 'code_snippet' | 'true_false' | 'open_ended'
+  | 'listening' | 'fill_in_blank' | 'match_pairs' | 'ordering'
+  | 'math_equation' | 'graph_chart' | 'diagram_label' | 'image_mcq'
```

Add new optional fields to the [Question](file:///d:/Next.js-projects/answarly/lib/questions.ts#5-17) type matching the model.

---

#### [MODIFY] [questions.ts](file:///d:/Next.js-projects/answarly/lib/api/questions.ts)

Update [CreateQuestionPayload](file:///d:/Next.js-projects/answarly/lib/api/questions.ts#1-12) with the expanded type union and new optional fields.

---

#### [MODIFY] [answer-evaluator.ts](file:///d:/Next.js-projects/answarly/lib/answer-evaluator.ts)

Add 3 new evaluation functions (reusing existing [calculateSimilarity](file:///d:/Next.js-projects/answarly/lib/answer-evaluator.ts#104-144)):

- **`evaluateBlankAnswer()`** — Per-blank exact match, then Levenshtein fallback. Score = avg across blanks.
- **`evaluateMatchPairs()`** — Score = (correct matches / total) × 100.
- **`evaluateOrdering()`** — Score based on items-in-correct-position count.

> `math_equation`, `graph_chart`, `diagram_label`, and `image_mcq` reuse existing MCQ/open-ended evaluation — no new evaluators needed.

---

### 2. API Routes

---

#### [MODIFY] [route.ts](file:///d:/Next.js-projects/answarly/app/api/questions/route.ts)

Add POST validation for each new type:

| Type | Required fields |
|------|----------------|
| `listening` | `audioUrl`, + `options`/`correctAnswer` if MCQ format |
| `fill_in_blank` | `blankTemplate` (must contain `___`), `blankAnswers` (count must match blanks) |
| `match_pairs` | `matchPairs` (≥ 2 pairs) |
| `ordering` | `orderItems` (≥ 2 items) |
| `math_equation` | `latex`, `correctAnswer` |
| `graph_chart` | `media` (≥ 1), `correctAnswer` |
| `diagram_label` | `media` (≥ 1), `diagramLabels` (≥ 1) |
| `image_mcq` | `media` (≥ 1), `options` (≥ 2), `correctAnswer` |

#### [NEW] [route.ts](file:///d:/Next.js-projects/answarly/app/api/questions/audio/route.ts)

Audio upload to Cloudinary:
- Accept `multipart/form-data` with audio file (MP3, WAV, OGG; max 25MB)
- Upload with `resource_type: "video"` (Cloudinary convention for audio)
- Return `{ audioUrl: "https://res.cloudinary.com/..." }`

---

### 3. Components — Creator Form

---

#### [MODIFY] [add-question-form.tsx](file:///d:/Next.js-projects/answarly/components/add-question-form.tsx)

Add type-specific form sections (all styled with glassmorphism: `rounded-xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10`):

| # | Type | Creator Form UI |
|---|------|----------------|
| 5 | **Listening** | Audio file upload button → Cloudinary → preview `<audio>` player. Answer format toggle (MCQ ↔ Open-ended). Conditional: MCQ options or textarea. |
| 6 | **Fill in Blank** | Textarea for template with `___` syntax guide. Auto-count blanks → generate answer inputs per blank. |
| 7 | **Match Pairs** | Dynamic table: left + right text inputs per row. "Add Pair" / remove buttons. Min 2 pairs. |
| 8 | **Ordering** | Dynamic list: text inputs for steps in correct order. "Add Item" / remove / reorder. Note: "Shuffled for students". |
| 9 | **Math/Equation** | LaTeX input textarea + live KaTeX preview. Correct answer input + KaTeX preview. |
| 10 | **Graph/Chart** | Image upload (reuse existing media upload) + question text + correct answer field. |
| 11 | **Diagram Label** | Image upload + click-to-place labels on the image. Each label: position (x,y%) + correct text. |
| 12 | **Image MCQ** | Image upload + MCQ option inputs (reuse existing MCQ option fields). |

Update the type `<Select>` dropdown from 4 → 12 items.
Add new state variables and extend `canSubmit` validation.

---

### 4. Components — Student Quiz View

---

#### [MODIFY] [quiz-question.tsx](file:///d:/Next.js-projects/answarly/components/quiz-question.tsx)

Add rendering sections for each new type:

| # | Type | Student Quiz UI |
|---|------|----------------|
| 5 | **Listening** | Glassmorphism audio player card + MCQ buttons or open-ended textarea below |
| 6 | **Fill in Blank** | Template text rendered with inline glassmorphism `<input>` fields at each `___` |
| 7 | **Match Pairs** | Two-column layout: fixed left terms, draggable right definitions (`@dnd-kit`). Glassmorphism drag cards with subtle shadow on drag. |
| 8 | **Ordering** | Sortable list via `@dnd-kit/sortable`. Glassmorphism list items with grip handle, lift animation. |
| 9 | **Math/Equation** | KaTeX-rendered equation display + answer input with live KaTeX preview |
| 10 | **Graph/Chart** | Image/chart display (via `MediaPlayer`) + open-ended or MCQ answer area |
| 11 | **Diagram Label** | Image with positioned empty input overlays at each label point. Glassmorphism floating inputs. |
| 12 | **Image MCQ** | Image display (via `MediaPlayer`) + MCQ option buttons (reuse existing MCQ rendering) |

Extend [QuizValue](file:///d:/Next.js-projects/answarly/components/quiz-question.tsx#14-19) type:
```ts
| { blanks?: string[] }
| { matches?: Record<string, string> }
| { order?: string[] }
| { latex?: string }
| { labels?: Record<string, string> }
```

Update `typeBadge` switch with icons for all 8 new types.

---

### 5. Components — Q&A Card View

---

#### [MODIFY] [question-card.tsx](file:///d:/Next.js-projects/answarly/components/question-card.tsx)

Mirror the quiz-question rendering for each new type (same UI patterns, same glassmorphism styling). Update [TypeIcon](file:///d:/Next.js-projects/answarly/components/question-card.tsx#24-36) switch.

---

### 6. Edit Dialog

---

#### [MODIFY] [edit-question-advanced-dialog.tsx](file:///d:/Next.js-projects/answarly/components/edit-question-advanced-dialog.tsx)

Extend to handle type-specific fields:
- **Listening**: Audio URL field + re-upload button + answer format toggle
- **Fill in Blank**: Editable template + blank answers
- **Match Pairs**: Editable pair list
- **Ordering**: Editable item list
- **Math/Equation**: LaTeX editor with live preview
- **Graph/Chart**: Existing media editor (already supported) + answer field
- **Diagram Label**: Existing media editor + label position editor
- **Image MCQ**: Existing media editor + MCQ option fields

---

### 7. i18n

---

#### [MODIFY] [i18n.tsx](file:///d:/Next.js-projects/answarly/components/i18n.tsx)

Add a `questionTypes` section to [Dict](file:///d:/Next.js-projects/answarly/components/i18n.tsx#8-50) with EN/AR labels:

| Key | English | Arabic |
|-----|---------|--------|
| `multiple_choice` | Multiple Choice | اختيار من متعدد |
| `true_false` | True / False | صح / خطأ |
| `code_snippet` | Code Snippet | مقتطف كود |
| `open_ended` | Open Ended | إجابة مفتوحة |
| `listening` | Listening | استماع |
| `fill_in_blank` | Fill in the Blank | املأ الفراغ |
| `match_pairs` | Match the Pairs | وصّل الأزواج |
| `ordering` | Ordering | ترتيب |
| `math_equation` | Math / Equation | رياضيات / معادلة |
| `graph_chart` | Graph / Chart Reading | قراءة رسم بياني |
| `diagram_label` | Diagram Labeling | تسمية الرسم التوضيحي |
| `image_mcq` | Image-Based MCQ | اختيار متعدد بالصورة |

Update all components to use `dict.questionTypes[type]` instead of `type.replace("_", " ")`.

---

## Implementation Order

| Phase | Files | Effort |
|-------|-------|--------|
| 1. Dependencies | [package.json](file:///d:/Next.js-projects/answarly/package.json) | Install @dnd-kit + katex |
| 2. Data layer | [question.model.ts](file:///d:/Next.js-projects/answarly/server/models/question.model.ts), [lib/questions.ts](file:///d:/Next.js-projects/answarly/lib/questions.ts), [lib/api/questions.ts](file:///d:/Next.js-projects/answarly/lib/api/questions.ts) | Types + schema |
| 3. Evaluator | [answer-evaluator.ts](file:///d:/Next.js-projects/answarly/lib/answer-evaluator.ts) | 3 new grading functions |
| 4. API routes | [app/api/questions/route.ts](file:///d:/Next.js-projects/answarly/app/api/questions/route.ts), `app/api/questions/audio/route.ts` [NEW] | Validation + upload |
| 5. i18n | [i18n.tsx](file:///d:/Next.js-projects/answarly/components/i18n.tsx) | Type labels EN/AR |
| 6. Creator form | [add-question-form.tsx](file:///d:/Next.js-projects/answarly/components/add-question-form.tsx) | 8 new form sections |
| 7. Quiz view | [quiz-question.tsx](file:///d:/Next.js-projects/answarly/components/quiz-question.tsx) | 8 new student renderers |
| 8. Card view | [question-card.tsx](file:///d:/Next.js-projects/answarly/components/question-card.tsx) | 8 new card renderers |
| 9. Edit dialog | [edit-question-advanced-dialog.tsx](file:///d:/Next.js-projects/answarly/components/edit-question-advanced-dialog.tsx) | Type-specific editing |

---

## Verification Plan

### Build
- `npm run build` — no TypeScript errors

### Browser Testing
1. Open add-question form → verify all 12 types in dropdown
2. Create one question per new type → verify form validation
3. Take a quiz with new types → verify rendering + interaction
4. Check Q&A view → verify cards render correctly
5. Test drag-and-drop on mobile viewport
6. Verify KaTeX equation rendering
7. Test audio player in Listening type
8. Verify glassmorphism styling consistency across all new types
