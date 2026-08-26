# Design System Specification: Answerly (High-End Educational Experience)

## 1. Overview & Creative North Star
**The Creative North Star: "The Luminous Scholar"**

This design system moves beyond the "standard SaaS dashboard" to create a high-tech, editorial environment for bilingual learning. We are not building a simple utility; we are building a digital sanctuary for knowledge. The aesthetic rejects the rigid, "boxed-in" layout of traditional education platforms in favor of **Atmospheric Depth** and **Intentional Asymmetry**.

By utilizing deep indigo gradients and fuchsia-to-indigo "energy" accents, we create a sense of focused immersion. The UI feels like it is floating in a vast, dark space—clean, high-tech, and expensive. Every element must feel like a piece of finely crafted glass, where information is separated by light and shadow rather than harsh lines.

---

## 2. Colors & Surface Philosophy

### Color Palette (Material Design Tokens)
*   **Background:** `#0A0B1A` (Midnight Dark)
*   **Primary (Energy):** `#C026D3` (Fuchsia 600)
*   **Secondary (Focus):** `#6366F1` (Indigo 500)
*   **Surface:** `#0A0B1A`
*   **Surface Containers:**
    *   **Lowest:** `#000000` (Pitch black for deep nesting)
    *   **Low:** `#111223` (Standard sectioning)
    *   **High:** `#1d1e32` (Interactive surfaces)
    *   **Highest:** `#23243a` (Hover states and active elements)

**Full Token List:**
- `primary`: `#C026D3` (Tailwind: fuchsia-600)
- `secondary`: `#6366F1` (Tailwind: indigo-500)
- `tertiary`: `#EC4899` (Tailwind: pink-500)
- `error`: `#ff6e84`
- `surface`: `#0A0B1A` (Dim: `#0A0B1A`, Bright: `#1d1e32`, Variant: `#23243a`)
- `outline`: `#747487` (Variant: `#464658`)
- `on_background`: `#e7e6fc`
- `on_surface`: `#e7e6fc`
- `on_surface_variant`: `#aaa9be`

### The "No-Line" Rule
To maintain a premium, high-tech feel, **1px solid borders for sectioning are strictly prohibited.** Do not use borders to separate a sidebar from a main feed or a header from a hero. Instead:
*   Use background color shifts (e.g., a `surface-container-low` sidebar against a `background` main area).
*   Use negative space (Spacing 12 or 16) to define the boundaries of content.

### The "Glass & Gradient" Rule
Floating elements (Modals, Popovers, Floating Action Buttons) must utilize **Glassmorphism**:
*   **Fill:** `surface-variant` at 40% opacity (`#23243a66`).
*   **Blur:** `backdrop-blur-sm` (approx. 4px–8px).
*   **Signature Glow:** Primary actions should never be flat. Use a linear gradient: `from-fuchsia-600 via-indigo-600 to-pink-600` at a 135-degree angle.

---

## 3. Typography: The Editorial Scale

We use **Inter** for English and a matching high-legibility Neo-Naskh or geometric Sans for Arabic (e.g., IBM Plex Sans Arabic) to ensure the bilingual experience feels unified.

*   **Display (lg/md):** 3.5rem / 2.75rem. Used for hero titles. Tighten letter spacing (-0.02em). This is your "Statement" type.
*   **Headline (lg/md/sm):** 2rem to 1.5rem. Used for section headers. Bold and authoritative.
*   **Body (lg/md):** 1rem / 0.875rem. Optimized for long-form educational reading. Use `on-surface-variant` (`#aaa9be`) for secondary body text to reduce eye strain in dark mode.
*   **Arabic Support:** Ensure line-height (leading) for Arabic is increased by 1.2x compared to English to accommodate the script's ascenders and descenders.

---

## 4. Spacing Tokens & Roundness

*   **Spacing Scale Base:** Scale 2
*   **Vertical Padding:** Use 16px (Spacing 4) between component items.
*   **Section Gaps:** Use negative space (Spacing 12 or Spacing 16) to define boundaries.
*   **Roundness (Shapes):** `ROUND_EIGHT`
    *   `rounded-lg` for buttons and typical elements.
    *   `rounded-xl` for larger input fields and UI elements.
    *   `rounded-2xl` for cards and major containers to soften the high-tech edge.

---

## 5. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "web 2.0." For this system, we use **Tonal Stacking**.

*   **The Layering Principle:** Place `surface-container-lowest` cards on top of `surface-container-low` sections. The "lift" comes from the contrast in dark tones, not a black shadow.
*   **Ambient Glows:** When a card is hovered, do not just darken it. Apply a subtle 15% opacity outer glow using the `primary` color (`#C026D3`) with a 40px blur. This creates a "high-tech" active state.
*   **The Ghost Border:** If accessibility requires a border (e.g., Inputs), use `outline-variant` at 20% opacity. It should be felt, not seen.

---

## 6. Component Guidelines (shadcn/ui mapping)

### Buttons
*   **Primary:** Gradient fill (`fuchsia-600` to `pink-600`). `rounded-lg`. White text (`on-primary-fixed`).
*   **Secondary:** Glass effect. `bg-white/5` with a `backdrop-blur`. `rounded-lg`.
*   **Interaction:** On hover, primary buttons should scale to 102% and increase the intensity of the gradient.

### Input Fields & Selects
*   **Visuals:** `rounded-xl`. Fill: `surface-container-high`.
*   **Focus State:** A 2px ring using the `primary` token with a 4px offset to create a "halo" effect.
*   **RTL:** All icons (Search, Chevron) must flip for the Arabic locale.

### Cards & Lists
*   **Structure:** `rounded-2xl`. No dividers between list items. Use 16px (Spacing 4) of vertical padding between items.
*   **Nesting:** If a card contains a list, the card should be `surface-container-low` and the list items should be `surface-container-highest` on hover.

### Progress Sliders (Learning Tracks)
*   **Track:** `surface-container-highest`.
*   **Range:** Gradient fill (`fuchsia-600` to `indigo-600`).
*   **Thumb:** Solid white with a `primary` outer glow.

---

## 7. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. For example, a wide 8-column lesson block paired with a 4-column "Notes" glass card that overlaps the edge.
*   **Do** treat Arabic as a first-class citizen. Ensure the font weight for Arabic appears visually equal to Inter Bold (Arabic often needs to be one weight heavier to look the same).
*   **Do** use the gradient sparingly—only for the most important "Success" or "Action" moments.

### Don’t
*   **Don’t** use pure white (#FFFFFF) for text except in titles. Use `on-surface` (`#e7e6fc`) to prevent "halaction" (text glowing painfully against dark backgrounds).
*   **Don’t** use 1px dividers. If you feel the need for a divider, use an 8px gap of empty space instead.
*   **Don’t** use standard "Rounded-MD." Always lean toward the larger `rounded-2xl` for cards and `rounded-xl` for UI elements to soften the high-tech edge.

---

## 8. Interaction Design (Signature Motion)
*   **The "Reveal":** When navigating between lessons, content should not just "appear." Use a subtle blur-in effect with a vertical slide of 10px.
*   **The "Glow Follow":** On desktop, cards should have a mouse-following radial gradient highlight (5% opacity white) to mimic a flashlight hitting a piece of dark glass.
