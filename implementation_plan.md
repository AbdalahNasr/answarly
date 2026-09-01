# Answerly — Cleanup & Refactor Plan (new-version branch)

Goal: reduce spaghetti risk before adding more question types, without breaking the studio/canvas features. Ordered by priority — do top to bottom, each item is independently shippable.

## Design Rule (non-negotiable)
- Do not break the current UI or visual identity.
- Keep the current design language, layout rhythm, spacing, glassmorphism styling, color palette, typography, and component behavior intact.
- Refactors must be additive and backward-compatible; they should improve structure without changing the way the app already looks and feels.
- If a cleanup task or new feature requires a visual change, it must stay within the existing design system and should be treated as a separate, approved UI pass.
- The current app design is the baseline; all technical work must preserve it.

---

## 1. Dead dependency removal (zero risk, do first)
- Remove `sequelize`, `sequelize-cli`, `pg`, `pg-hstore` from `package.json` — no usages found anywhere in `app/`, `lib/`, `server/`. Confirmed dead. (Postgres migration is a future project — see item 6 — re-add properly when that actually starts, don't keep unused scaffolding around in the meantime.)
- Remove `bcryptjs` — only `bcrypt` is imported anywhere (`server/services/auth.service.ts`, `passwordReset.service.ts`, `user.filesystem.service.ts`). `bcrypt` + `SALT_ROUNDS = 10` is correct as-is, no change needed there.
- Delete `controllers/feedbackController.ts`, `routes/feedbackRoutes.ts`, `services/feedbackService.ts` — all three are 0 bytes, unused Express-style scaffolding left over from before the app settled on Next.js API routes. Delete the three empty folders too if nothing else lives in them.
- Run `npm prune` / reinstall after trimming `package.json` and confirm `npm run build` still passes.

## 2. Question schema — introduce type discriminators

Current state: one flat `question.model.ts` with every type's fields (`blankTemplate`, `matchPairs`, `orderItems`, `latex`, `diagramLabels`, ...) sitting optionally on every document. Model currently lists 12 types but you're at 14 in practice — schema is already behind. This is the main thing that gets worse with every new type if left as-is.

- Define a lean base schema: `text`, `category`, `difficulty`, `media`, `contentLayout`, `createdBy`, timestamps — fields every question type actually needs.
- Convert type-specific fields into Mongoose discriminators, one per question type (or grouped by family — see item 3). Each discriminator only carries its own fields; no more optional soup on unrelated types.
- Migrate existing documents: write a one-off script to tag existing docs with their discriminator key so nothing already in Mongo breaks.
- Update `lib/questions.ts` and any direct `Question.find/create` calls to use the discriminator model per type instead of the flat model.

## 3. Group question types into families (do this before/alongside #2)

You mentioned new types are UI-level extensions of existing types (video, studio/diagram shapes based on subject) rather than fully new data shapes. Before writing 14+ discriminators, map which types actually share a data shape vs. which only differ in rendering:

- List all 14 current types + planned kid-focused types, and for each note: (a) what data it stores, (b) what UI renders it.
- Group types that share storage shape (e.g. "diagram label" and "graph reading" might both just be "image + labeled points") — these become one discriminator with a `variant` or `renderMode` field, not two full discriminators.
- Types that are purely new rendering of existing data (subject-themed diagram skins, etc.) don't need new schema at all — just new components reading the same shape.

> This step is what actually prevents the "infinite hell" — most new types should be new components, not new schema.

## 4. Split the studio components (careful — don't break canvas logic)

`drawio-studio.tsx` (965 lines), `image-annotation-editor.tsx` (468 lines), `visual-diagram-editor.tsx` (189 lines) — legitimately complex canvas/diagram tools, not the same problem as #2/#3. Don't rewrite logic, only extract.

- Before touching anything: add/confirm a manual test checklist (draw shape, move shape, save, reload, export) so regressions are obvious.
- Extract pure UI panels (toolbars, property inspectors, color pickers) into their own components first — lowest risk, no canvas-state coupling usually.
- Extract canvas event handlers into custom hooks (`useCanvasDrawing`, `useShapeSelection`, etc.) one at a time, re-testing the checklist after each extraction.
- Leave the core canvas render loop for last, and only touch it if a hook extraction forces it.

## 5. Housekeeping
- Consolidate the 13 root-level status docs (`00-START-HERE.md`, `IMPLEMENTATION_COMPLETE.md`, `FINAL_REPORT.md`, `VERIFICATION_SUMMARY.md`, `NEXT_STEPS.md`, `TODO.md`, etc.) into a single `docs/` folder with one living `README.md` / `STATUS.md`. Archive or delete the rest — they're mostly point-in-time snapshots from earlier sessions.
- Confirm `build.log` / `build_output.log` are gitignored, not committed artifacts.

## 6. Parked for later (not blocking, don't start yet)
- **Postgres migration** (Mongo → Postgres "when we go to production"). Worth a dedicated plan of its own later: what drives the switch (relations? transactions? hosting cost?), whether it's a full cutover or hybrid, and a real data-migration script — don't start this until the schema in #2/#3 is stable, or you'll be migrating a moving target.
- **Kid-focused question types / parent tracking** — deliberately not in this plan; separate compliance and product decision (age-gating, COPPA/GDPR-K) discussed earlier, not a code cleanup item.

**Suggested order: 1 → 3 → 2 → 4 → 5.** Mapping type families (3) before building discriminators (2) avoids designing schema for types you'll end up merging.

---
---

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
