# HANDOFF — Redesign the Notebook Onboarding "Question" Screen (Frontend Polish Task)

> Pass this entire file to Mimo v2.5 in a new session of this project. It contains full context; no prior conversation needed.

---

## 1. Project & Stack

- **Project**: Mythrix — a research-notebook web app (users create "notebooks"/projects to collect sources and generate insights).
- **Stack**: Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, TypeScript, Tailwind CSS v4 (utility classes + CSS custom properties in `src/app/globals.css`), lucide-react icons, Supabase (@supabase/ssr).
- **IMPORTANT**: This is a custom Next.js version. Read `node_modules/next/dist/docs/` before writing Next-specific code. Do not change server actions or data flow.
- **Working directory**: `D:\Projects\Mythrix`
- **Verify with**: `npm run build` (must pass; includes type checking).

## 2. The Task

Redesign the **question screens** of the "New Notebook" onboarding flow so they feel like a **disciplined, premium product design** — NOT generic AI slop. The wipe/entry animation, layout shell, and all functionality are **already built and must be kept**. You are restyling the *content layer* (headline, helper copy, input, buttons, preview) and improving the micro-details.

### Files you will edit
- `src/components/onboarding/notebook-onboarding.tsx` — the full-page takeover (main file)
- `src/app/globals.css` — only if you need new keyframes/utility classes
- Do **NOT** touch: `onboarding-provider.tsx`, `src/lib/actions/notebooks.ts`, any Supabase code, the wipe-transition logic, the trigger buttons in `topnav.tsx` / `notebook-grid.tsx`.

## 3. What Already Exists (keep all of this working)

1. **Wipe entry**: clicking "New Notebook" (topnav pill or notebooks page) makes a white circle grow from the button (`clip-path: circle()`) and cover the viewport, then **dissolves** into a dark liquid-glass page. This is good — keep it.
2. **Flow**: 3 steps → Name → Description → Color, then creating spinner → success ring+check → auto-close + `router.refresh()`.
3. **Exit**: faster reverse wipe (460ms vs 640ms enter). Keep.
4. **State machine**: `stage` ("wipe" | "content" | "closing"), `step`, `title`, `description`, `color`, `busy`, `created`, `error`, `leaving`. Keep.
5. **Accessibility**: `prefers-reduced-motion` support, scroll lock, Escape/Enter keys. Keep.
6. **Design system already in use** (match these, they're the product's language):
   - Page bg: `radial-gradient(125% 125% at 50% 10%, #16161e 45%, #6d28d9 140%)`
   - Glass surfaces: `bg-white/[0.04]`–`[0.06]`, borders `border-white/[0.1]`–`[0.12]`
   - Accent: `#7c5cff`; focus ring `focus:ring-[#7c5cff]/10`, border `focus:border-[#7c5cff]/60`
   - Primary CTA: white pill (`bg-white text-black rounded-full`) — the dashboard's signature button
   - Typography: Geist (`style={{ fontFamily: "Geist, sans-serif" }}`), mono for indices (`font-mono`, Geist Mono)
   - Notebook color palette: `["#63e", "#2563eb", "#0d9488", "#059669", "#d97706", "#dc2626", "#db2777", "#7c3aed"]`

## 4. What's Wrong (the user's complaint, verbatim in spirit)

The question page "reeks of generic AI slop":
- Copy feels like filler marketing text (e.g. "A short note to remind you why you started it.").
- Layout is the cliché centered-one-input-at-a-time wizard.
- Generic icon-in-a-box eyebrows, `01 · NAME` mono labels are overused boilerplate.
- The whole thing looks like 1000 other AI-generated onboarding flows.

## 5. What the User Actually Wants

A **sophisticated, disciplined, characterful** design. Think: Linear, Arc, Raycast, Vercel, Framer — products where onboarding feels *considered*. Specifically:

1. **Copy** — rewrite all step copy. Short, confident, specific, zero filler. No "You can rename it anytime from the project settings." No generic encouragement. Examples of the tone: ask the real question with editorial precision; use concrete, product-specific wording. A little voice/character is welcome — but no emojis, no exclamation spam, no corporate cheerleading.
2. **Layout** — keep the 2-column structure (question + live preview) but make it feel designed: stronger typographic hierarchy, intentional whitespace, better alignment/rhythm. Consider: question as a large editorial headline, helper text small and quiet, input minimal.
3. **Live preview** — the right-side "Live preview" notebook card is a good idea and must stay, but make it look *better than the real product*: craft it as a beautiful product shot. It should feel like a mockup, not a card. (It updates live with title/description/color — keep that behavior.)
4. **Micro-interactions** — polish the step transitions. Current: blur-slide-exit (160ms) + word-by-word reveal on enter. Keep the spirit, improve the craft: consistent easing, correct stagger, nothing feels clunky.
5. **Iconography** — lucide icons at consistent stroke (1.5–1.75). No generic "sparkles". Choose icons with meaning.
6. **Typography** — Geist. Use size/weight/letter-spacing contrast for hierarchy. Mono only where it earns it (small indices/labels).
7. **Buttons** — keep white pill primary + ghost secondary. Fine-tune padding, size, hover states.

## 6. Hard Constraints

- No new dependencies (no framer-motion, no new packages). Use CSS transitions/keyframes already present or add minimal keyframes to `globals.css`.
- Keep every prop, state variable, handler, and the server-action call identical — only presentational/JSX/CSS changes.
- Must keep `prefers-reduced-motion` handling (skip animations entirely).
- Must keep the wipe-in/dissolve and wipe-out choreography timing (don't rework the wipe itself).
- Text/input values still bind to `title`, `description`, `color` — don't rename.
- Build must pass: `npm run build`.

## 7. Do This First

1. Read `src/components/onboarding/notebook-onboarding.tsx` fully.
2. Read `src/components/notebooks/notebook-grid.tsx` (the notebook card the preview mimics — match/beat it).
3. Read `src/app/globals.css` (existing keyframes: wordReveal, fadeSlideUp, stepExit, ringPop, checkPop, orbDrift).
4. Read `src/components/ui/topnav.tsx` to absorb the product's visual language (pill topbar, glass chips).

Then redesign the content layer in `notebook-onboarding.tsx`. Show your work: before/after copy, and what you changed in the JSX.

## 8. Deliverable

- Updated `src/components/onboarding/notebook-onboarding.tsx` (+ optional `globals.css` additions).
- Brief summary: copy rewrite rationale, layout changes, micro-interaction changes.
- `npm run build` passing.
