# Design System Specification: Kinetic Precision

## 1. Overview & Creative North Star: "The Kinetic Conductor"
This design system is not a static set of rules; it is a framework for high-speed, high-precision digital movement. The Creative North Star is **The Kinetic Conductor**: an aesthetic that mirrors the streamlined efficiency of modern rail transit. We move away from the "boxy" web by embracing a fluid, editorial approach where information is layered rather than boxed.

The system breaks the "template" look through **Tonal Depth** and **Asymmetric Breathing Room**. We prioritize content over containers. By utilizing a high-contrast palette against deep, obsidian surfaces, we create a UI that feels like a head-up display (HUD) for a high-tech transit hub—authoritative, sleek, and premium.

---

## 2. Color Architecture & Surface Philosophy
The palette is rooted in a "Deep Dark" foundation, using the Trenord Green as a beacon of progress and Trenord Red as a surgical tool for urgency.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited for sectioning.** Boundaries are defined through background shifts using the `surface-container` tokens. 
- To separate a section, transition from `surface` (#141313) to `surface-container-low` (#1C1B1B).
- For internal nesting, move to `surface-container-high` (#2B2A2A). 

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers of smoked glass:
1.  **Base Layer:** `surface` (#141313) — The infinite canvas.
2.  **Section Layer:** `surface-container-low` (#1C1B1B) — Defines broad content areas.
3.  **Interaction Layer:** `surface-container-highest` (#363434) — Used for cards or modals that require immediate focus.

### The "Glass & Gradient" Rule
To inject "soul" into the high-tech aesthetic, use **Glassmorphism** for floating headers or navigation bars. 
- **Token:** `surface-variant` (#363434) at 60% opacity with a `24px` backdrop blur.
- **Signature Texture:** Primary CTAs should not be flat. Apply a subtle linear gradient from `primary` (#84D999) to `primary-container` (#006633) at a 135-degree angle to create a sense of metallic sheen and forward velocity.

---

## 3. Typography: Editorial Authority
We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "High-Tech" feel while maintaining legibility at high speeds.

*   **Display Scale (`display-lg` to `display-sm`):** Reserved for hero metrics or arrival times. Use `-0.04em` letter spacing to create a "tight," custom-font feel.
*   **Headline & Title (`headline-lg` to `title-sm`):** Used for navigation and section headers. These should always be `on-surface` (#E6E1E1) to maintain a premium contrast ratio.
*   **Body & Label (`body-lg` to `label-sm`):** For instructional text. Use `on-surface-variant` (#BFC9BD) for secondary information to create a natural hierarchy without changing font size.

---

## 4. Elevation & Depth: Tonal Layering
We reject traditional drop shadows in favor of **Ambient Light**.

*   **The Layering Principle:** Achieve lift by stacking. A `surface-container-lowest` (#0F0E0E) element placed on a `surface-container-high` (#2B2A2A) background creates a "sunken" interactive well.
*   **Ambient Shadows:** For floating elements (modals/tooltips), use a diffused shadow: `0px 16px 40px rgba(0, 0, 0, 0.4)`. The shadow must never be pure black; it should feel like a deep bloom from the background.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline-variant` (#3F4940) at **15% opacity**. This creates a "glint" on the edge rather than a hard line.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** Gradient of `primary` to `primary-container`. Corner radius: `full` (9999px) for high-action "Pill" shapes.
*   **Secondary:** `surface-container-high` background with `on-surface` text. Corner radius: `0.5rem` (default).
*   **Kinetic State:** On hover, buttons should scale to 102% with a subtle glow using the `surface-tint` (#84D999) token.

### Cards & Lists
*   **The Divider Forbiddance:** Never use line dividers. Separate list items using `spacing-4` (1rem) of vertical white space or a subtle hover state shift to `surface-bright` (#3A3939).
*   **Rounding:** All cards must follow the `xl` (1.5rem) roundedness for outer containers and `DEFAULT` (0.5rem) for inner elements to create a nested, organic feel.

### Status Indicators (The Velocity Logic)
*   **Positive/Progress:** Use `primary` (#84D999). This represents "Go," "On-Time," and "Active."
*   **Alert/Delay:** Use `secondary` (#FFB4AB) or `error` (#FFB4AB). This is reserved exclusively for system friction.
*   **High-Tech Accents:** Use the `tertiary` (#FFB2BA) token for "information-only" chips to distinguish them from actionable items.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical spacing. Align text to a strict left grid while allowing imagery or data visualizations to bleed off the right edge.
*   **Do** use `surface-container-highest` for active states in navigation.
*   **Do** prioritize the 8-pixel grid for all spacing, but feel free to "break" the grid for decorative background elements.

### Don't:
*   **Don't** use 100% white text for long-form body copy. Use `on-surface-variant` (#BFC9BD) to prevent eye strain on the deep dark background.
*   **Don't** use "pure" black (#000000). Always use the `surface` token (#141313) to maintain the "Kinetic" depth.
*   **Don't** use borders. If the design feels "flat," increase the contrast between your `surface-container` tiers instead of adding a stroke.

---

## 7. Spacing & Rhythm
Rhythm is achieved through the **Spacing Scale**. 
*   Use `spacing-12` (3rem) and `spacing-16` (4rem) for major section padding to ensure the UI feels "Editorial" and expansive.
*   Use `spacing-2` (0.5rem) and `spacing-3` (0.75rem) for tight internal component relationships (e.g., icon to text).