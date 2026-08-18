---
name: YourRank Connected Suite
description: A quiet, high-contrast operating language for Sites, Telegram, and Credits & Shop.
colors:
  primary: "#2200FF"
  primary-hover: "#1B00CC"
  production-chrome: "#121111"
  production-chrome-raised: "#232323"
  ink: "#191919"
  ink-muted: "#5C5C5C"
  ink-faint: "#6B6B6B"
  field: "#FFFFFF"
  surface: "#FCFCFC"
  surface-inset: "#EFEFEF"
  line: "rgba(0, 0, 0, 0.12)"
  line-soft: "rgba(0, 0, 0, 0.08)"
  success: "#1F8A68"
  warning: "#B76A12"
  danger: "#B42318"
typography:
  display:
    fontFamily: "Inter, Fira Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter, Fira Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, Fira Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, Fira Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, Fira Code, IBM Plex Mono, JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.1em"
rounded:
  control: "2px"
  small: "6px"
  card: "16px"
  pill: "200px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "64px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.field}"
    rounded: "{rounded.control}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "12px 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  status-chip:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: YourRank Connected Suite

## Overview

**Creative North Star: "The Quiet Control Field"**

YourRank uses one calm, high-contrast language to make a connected three-product suite immediately legible. The devin.ai reference supplies material discipline and hierarchy—near-white fields, black type, electric-violet actions, precise dividers, compact controls—while YourRank keeps its own identity, direct language, and product truth.

The system spans three distinct contexts without becoming three visual brands. Marketing explains and demonstrates Sites, Telegram, and Credits & Shop; the operator workspace places a black production rail around a light working field; public streamer sites keep a streamer-selected accent inside the same light material system. Transparent OBS overlays and isolated games remain intentional context-specific exceptions.

The product demonstration and the user's state carry each screen. Decoration stays quiet so the current state, the next action, and the relationship among the three peer products remain obvious.

**Key Characteristics:**

- Near-white reading fields, ink-black type, and electric-violet action cues.
- A black production rail around light operator workspaces.
- Hairline dividers and shared outer boundaries instead of nested card stacks.
- Compact identity, clear purpose, visible action, and readable state in the first viewport.
- Sites, Telegram, and Credits & Shop presented as peer products under one account.

## Colors

The palette is deliberately narrow: violet carries product action, black and near-whites establish hierarchy, and semantic colors report operational state.

### Primary

- **Electric Violet:** Primary calls to action, focus indicators, active product cues, links that need emphasis, and small live-state markers.
- **Deep Violet:** Hover and pressed treatment for violet actions.

### Neutral

- **Production Black:** The signed-in workspace rail and other unmistakable production chrome.
- **Raised Production Black:** Active navigation rows and quiet raised regions inside dark chrome.
- **Ink Black:** Primary text and dark marketing actions.
- **Operational Gray:** Supporting copy and secondary labels that must remain comfortably readable.
- **Metadata Gray:** Quiet labels, timestamps, and compact supporting state.
- **White Field:** The page canvas and input field.
- **Paper Surface:** Cards, sticky bars, reading surfaces, and operator modules.
- **Inset Gray:** Selected rows, muted controls, and shallow inset regions.
- **Hairline / Soft Hairline:** Standard boundaries and lighter internal dividers.

### Tertiary

- **Success Green:** Completed, live, and healthy states.
- **Warning Amber:** Queued, pending, draft, and attention states.
- **Danger Red:** Destructive actions and errors only.

### Named Rules

**The Two Accent Rule.** Electric Violet belongs to YourRank actions and focus; the public `--yr-accent` belongs to the streamer's local identity. Do not replace one with the other.

**The State, Not Decoration Rule.** Success, warning, and danger appear in status text, dots, narrow cue bands, and alerts—not as ornamental card themes.

## Typography

**Display Font:** Inter, falling back to Fira Sans and the system sans stack

**Body Font:** Inter, falling back to Fira Sans and the system sans stack

**Label/Mono Font:** Geist Mono, falling back through Fira Code, IBM Plex Mono, JetBrains Mono, and the system monospace stack

**Character:** Neutral sans typography gives the product a precise, contemporary voice without competing with data. Tight, medium-weight display type creates decisive marketing hierarchy; monospaced type marks real state, numbers, paths, timestamps, and compact metadata.

### Hierarchy

- **Display** (500, fluid 3–5.5rem, 0.98 line-height): Outcome-led marketing hero statements, balanced to short line lengths.
- **Headline** (500, fluid 2.25–3rem, 1.05 line-height): Section transitions and major product explanations.
- **Title** (500, 1.5rem, 1.2 line-height): Module and product-surface titles.
- **Body** (400, 1rem, 1.5 line-height): Product explanation and interface copy; explanatory reading text stays near 65–72 characters per line.
- **Label** (600, 0.6875rem, 0.1em tracking): Uppercase only when the label encodes real product scope, state, time, or data structure.

### Named Rules

**The Plain Speech Rule.** Interface copy names the visible outcome—Players, Commands, Broadcasts, Rewards, Fulfilment—not the underlying infrastructure.

**The Mono Has a Job Rule.** Monospace is reserved for data, state, paths, timestamps, compact labels, and technical metadata; it is not decorative display type.

## Layout

Marketing and product education use a centered reading frame of approximately 1152–1200px with 24px side padding, spacious 64–96px section intervals, and an editorial sequence: compact header, decisive heading, short explanation and action, then a large readable product surface. The first viewport visibly demonstrates the product instead of delaying it behind decorative copy.

The authenticated workspace uses a fixed 272px production rail, a compact top bar, and a 12-column light working field. Sites, Telegram, and Credits & Shop remain reachable from the same product switcher; site or bot context stays visibly local. Comparable operational data uses divided rows, tables, and 8/4 or 12-column modules rather than isolated metric tiles.

At narrow widths, marketing navigation becomes a disclosed menu while the primary Start free action remains visible. Operator and public rails become drawers, page padding contracts to 12–24px, multi-column layouts stack, and wide tables scroll inside their own container. Touch targets reach 44px on coarse pointers and mobile layouts remain usable at 320px.

**The First Viewport Rule.** Every primary route starts with compact identity, one decisive purpose, a visible next action, and enough real or explicitly illustrative product state to understand the surface.

**The One Suite Rule.** Global product switching, account, and help remain consistent; local site and bot context never disappears in the name of simplification.

## Elevation & Depth

The system is flat by default. White and near-white surfaces separate through hairline borders, shared outer boundaries, internal dividers, and tonal shifts. Cards and product previews rest without shadow. Elevation is reserved for temporary overlays, menus, and brief interactive lift; the standard overlay shadow is a soft black 16px/48px spread, while focus is expressed with a violet outline rather than depth.

### Shadow Vocabulary

- **Overlay:** A broad, soft shadow for dialogs and floating menus; never for ordinary cards.
- **Action hover:** A small violet-tinted lift on shared primary controls; it disappears on active and disabled states.

### Named Rules

**The Hairline Before Shadow Rule.** Use boundaries and tonal layering for structure; add shadow only when a surface temporarily sits above the page or an action is responding to interaction.

## Shapes

Geometry is restrained and role-based. Primary actions and compact controls are nearly square; fields and small identity marks receive a gentle curve; cards and substantial reading surfaces use the larger soft corner; pills are limited to statuses and compact navigation. Adjacent information in one workflow shares an outer boundary and internal dividers rather than accumulating nested rounded containers.

**The Restrained Geometry Rule.** Corners communicate scale and role: near-square actions, small-radius fields, large-radius modules, and pills only for genuinely compact status or navigation objects.

## Components

### Buttons

- **Shape:** Primary and marketing actions use a near-square corner; standard marketing actions retain a 44px minimum target.
- **Primary:** Electric Violet with white text and compact 12px × 20px padding.
- **Dark:** Ink Black with a near-white label for the persistent header action.
- **Secondary / Ghost:** White or transparent with Ink Black text and a hairline border.
- **Hover / Focus / Active:** Primary actions deepen to Deep Violet, shared operator actions may lift by 1px, focus receives a visible violet ring, and active controls settle rather than float.
- **Disabled / Busy:** Preserve the component footprint, lower opacity, remove lift, change the cursor, and expose busy state semantically.

### Chips

- **Style:** Compact status and navigation chips use the pill radius, short padding, and either an inset neutral fill or a semantic border/text pairing.
- **State:** Live, pending, completed, and unavailable remain textually explicit; color never carries the state alone.

### Cards / Containers

- **Corner Style:** Soft card corner for marketing previews, operator modules, auth panels, and public viewer containers.
- **Background:** Paper Surface on a White Field, with Inset Gray for selected or recessed regions.
- **Shadow Strategy:** Flat at rest; use the Elevation rules only for temporary layers.
- **Border:** Soft Hairline around the outer module; Hairline or Soft Hairline dividers within it.
- **Internal Padding:** Usually 24px, expanding to 28–32px for spacious marketing and authentication surfaces.

### Inputs / Fields

- **Style:** White field, readable Ink Black text, visible label, Hairline border, small corner, and a 44px target where practical.
- **Focus:** Border shifts to Electric Violet with a visible two-pixel violet outline or soft violet focus ring.
- **Error / Disabled:** Error copy stays adjacent to the field and uses a semantic alert treatment; disabled fields remain legible and visibly unavailable.

### Navigation

Marketing navigation is compact and quiet, with muted default text, ink hover, explicit current-page state, a persistent primary action, and a disclosed mobile menu. Operator navigation lives in Production Black, uses text plus line icons, and marks the active destination with Raised Production Black and a narrow violet inset cue. The cross-product switcher always exposes Sites, Telegram, and Credits & Shop.

### Divided Data Surface

Leaderboard rows, reward catalogs, KPI bands, workflow steps, and operational tables share one outer boundary and separate comparable items with hairlines. Labels and numbers use the mono role only where it improves scanning; overflow stays inside the surface on small screens.

### Named Rules

**The State Before Action Rule.** When state affects a decision, show the truthful state immediately beside or before the action—published before Publish site, draft before Send, queued before Complete.

## Do's and Don'ts

### Do:

- **Do** keep Sites, Telegram, and Credits & Shop visible as peer products under one account.
- **Do** let real user data or clearly labeled synthetic product demonstrations carry the visual hierarchy.
- **Do** use shared outer boundaries, internal dividers, and readable state before introducing another container.
- **Do** preserve visible focus, semantic status announcements, reduced-motion behavior, and 44px touch targets where practical.
- **Do** keep public streamer accent separate from YourRank's product-action violet.

### Don't:

- **Don't** introduce decorative gradients, glass effects, glow fields, or floating metric-card walls into normal product surfaces.
- **Don't** use semantic colors as decoration or communicate state by color alone.
- **Don't** hide the primary action or product switcher when the layout collapses.
- **Don't** turn mono labels, uppercase captions, or numbered markers into decoration; each must encode actual state, scope, sequence, or data.
- **Don't** invent testimonials, customer logos, metrics, billing promises, or performance claims that the product evidence does not support.
