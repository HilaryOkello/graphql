# Neobrutalist UI Style Guide: LoCK iN

**Project Goal:** To create a simple, light, responsive, and visually striking Neobrutalist UI for Lock in, including a login page and statistic graphs. The UI will feature a dark mode and a blue/green color theme using Tailwind CSS.

---

## 1. Core Philosophy: "Honest Digitalism"

Our Neobrutalist approach embraces:

*   **Simplicity:** UI elements are simple with subtle animations and tons of whitespace
*   **Clarity:** Information is presented directly and unambiguously.
*   **Structure:** A clear, often grid-based layout with generous whitespace.

---

## 2. Color Palette (Tailwind CSS)

A limited palette to maintain simplicity and impact.

### Light Mode (Softer):

*   **Background:** `bg-slate-200` (A slightly darker, softer light gray)
*   **Card/Container Background:** `bg-slate-50` (Off-white, clearly distinct from page background)
*   **Primary Text:** `text-slate-700` (Dark gray, not pure black, for softer contrast)
*   **Secondary Text/Subtle Elements:** `text-slate-500`
*   **Primary Action Color (Blue):** `bg-blue-600`, `text-blue-600` (Still vibrant for actions)
    *   Hover/Active: `bg-blue-700`
*   **Accent Color (Green):** `bg-green-500`, `text-green-500` (Still vibrant for highlights)
    *   Hover/Active: `bg-green-600`
*   **Borders:** `border-slate-700` (Matching primary text for defined but not harsh edges)

### Dark Mode (Softer):

*   **Background:** `bg-slate-900` (Very dark blue-gray, not pure black)
*   **Card/Container Background:** `bg-slate-800` (Slightly lighter for differentiation)
*   **Primary Text:** `text-slate-300` (Light gray, not pure white, for softer contrast)
*   **Secondary Text/Subtle Elements:** `text-slate-500`
*   **Primary Action Color (Blue):** `bg-blue-500`, `text-blue-500`
    *   Hover/Active: `bg-blue-600`
*   **Accent Color (Green):** `bg-green-500`, `text-green-500`
    *   Hover/Active: `bg-green-600`
*   **Borders:** `border-slate-600`


## 3. Typography

*   **Headings (h1, h2, h3):**
    *   Font: A geometric Sans-Serif like **Inter, Montserrat, or Poppins**.
    *   Weight: `font-bold` or `font-extrabold`.
    *   Case: Often `uppercase` for major headings or section titles for impact.
    *   Example: `text-2xl font-bold uppercase text-slate-900 dark:text-slate-100`
*   **Body Text & UI Elements:**
    *   Font: A clean Sans-Serif (like Inter) or a **Monospace font** like **JetBrains Mono, Fira Code, or IBM Plex Mono** for a more "digital" feel. Monospace is highly recommended for data display.
    *   Weight: `font-normal` or `font-medium`.
    *   Example: `text-base font-mono text-slate-900 dark:text-slate-100`
*   **Line Height:** `leading-relaxed` or `leading-normal` for readability.

---

## 4. Layout & Spacing

*   **Grid System:** Utilize CSS Grid and Flexbox.
*   **Responsiveness:** Mobile-first.
*   **Whitespace:** Generous padding and margins (`p-4`, `p-6`, `p-8`, `m-4`, `gap-6`).
*   **Overall page padding:** `p-4 sm:p-6 md:p-8`.
*   **"One Screen View":** Compact layout of cards/blocks.

---

## 5. Interactivity & Feedback

*   **Hover States:** Subtle changes (e.g., background darken, border color change, shadow shift/removal). Transitions should be quick (`duration-150`).
*   **Focus States:** Clear visual indication for keyboard navigation, especially for interactive elements like buttons and inputs (Tailwind's `focus:ring` can be adapted, or use `focus:border-blue-600`).
*   **Loading States:** If data fetching takes time, use simple text loaders ("Loading...") or very basic skeletal loaders within the cards.

---

## 9. Accessibility (A11y)

*   Ensure sufficient color contrast (WCAG AA minimum).
*   Keyboard navigable.
*   Semantic HTML.
*   ARIA attributes where necessary (e.g., for custom components or dynamic content).
*   Focus indicators must be clear.

---