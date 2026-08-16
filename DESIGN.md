# DESIGN.md

The design system for YourRank. This document is the source of truth for the
product's visual identity and information architecture. It documents what the
code actually ships, not an aspirational future state.

Read this together with `PRODUCT.md` (what the product is and who it serves)
and `AGENTS.md` (how to work in the repo).

---

## 1. Product shape

YourRank is **one account with three peer products**:

| Product | Surface | Who |
| --- | --- | --- |
| **Sites** | `/dashboard` | The streamer builds and operates a public leaderboard/community site. |
| **Telegram** | `/bot/dashboard` | The streamer runs a Telegram bot (replies, offers, broadcasts). |
| **Credits & Shop** | `/dashboard/rewards/*` | Viewers earn credits from Kick channel-point activity and spend them in the board shop. |

These three are peers under one signed-in account. The public, viewer-facing
side of Sites and Credits is a **separate surface** (`/[:slug]/*`) with its own
branding — see §3.

**IA rules that must hold:**

- The signed-in shell exposes the three products as a product switcher
  (`Sites / Telegram / Credits & Shop`) plus Account and Help access. There is
  exactly one Account destination family.
- No dead ends: every signed-in destination has an obvious way back or onward.
  Leaf pages render a breadcrumb trail (`crumbsHtml`) so the user always knows
  where they are. A one-item trail renders nothing because it is the product
  home.
- **Help lives inside the app rail for signed-in streamers**, not as a marketing
  dead end. A signed-in streamer keeps their app chrome, account identity, and a
  path back to the dashboard. Anonymous Help remains outside the authenticated
  v4 visual world.
- Two-click principle: primary operator tasks should be reachable in roughly two
  actions from the product home, using smart defaults over configuration.
- Features are grouped, not hidden. The authenticated rail must keep all major
  dashboard, editor, analytics, credits, settings, and help destinations visible
  and discoverable.

---

## 2. Authenticated dashboard thesis

The signed-in leaderboard experience now uses the **Creator Run-Sheet workspace**
(seed `562938e8`, Operate mode):

> A non-technical streamer should see what is live, what needs attention, and the
> next useful action without understanding the system architecture.

This replaces the generic dark tile dashboard. The dashboard is not a metrics
wall; it is an operating workspace for streamers preparing and running a live
community board.

**Shipped first viewport:**

- Fixed branded rail on the left.
- One high-contrast site command bar: current site, public path, availability,
  create-site action, and a real Publish/Unpublish command are aligned as two
  stable groups instead of scattered across the header. Publishing is never
  represented as a settings toggle.
- A compact Overview heading leads into one 12-column launch run-sheet. Status,
  the next action, progress, and the three setup steps share one divided surface
  instead of competing hero and checklist cards.
- Verification is consolidated into the launch run-sheet on Overview; other
  routes use one compact notice instead of a full-width warning card.
- A concise divided KPI band and one asymmetric activity surface follow
  immediately. Recent Activity and Top Players use a shared outer boundary with
  an internal divider rather than separate floating cards.
- Primary actions live inside the launch module or the relevant section, not
  beside a generic page title or on a separate dead-end screen.

The contract is embedded in authenticated shell markup in
`apps/leaderboard/src/pages/dashboard-shell.jsx` and `shared/dashboard-chrome.ts`.

---

## 3. Surfaces and boundaries

YourRank has three visual surfaces that intentionally do different jobs:

1. **Authenticated leaderboard workspace** (`/dashboard`, `/dashboard/*`,
   `/dashboard/rewards/*`, signed-in Help). Light Creator Run-Sheet workspace
   styled by `apps/leaderboard/src/assets/dashboard-v4.css`, scoped to
   `.v3-dash[data-auth-workspace]`.
2. **Legacy/base operator layer**. `dashboard-v3.css` remains underneath as the
   compatibility/base layer for older dashboard markup and non-v4 app surfaces.
   V4 overrides it only when the authenticated shell sets
   `data-auth-workspace="true"`.
3. **Public viewer surface** (`/[:slug]/*`). Streamer-branded board pages —
   leaderboard, shop, games, board credits — keep their own public identity and
   per-board accent.

Marketing/public homepage surfaces are not part of the authenticated v4 scope and
must not be restyled as a side effect of dashboard work. Anonymous Help is not
v4-auth styled.

---

## 4. Color

### Authenticated Creator Run-Sheet palette

| Token | Value | Role |
| --- | --- | --- |
| `--v4-canvas` | `#F5F7FB` | Cool-gray app background. |
| `--v4-surface` | `#FFFFFF` | Main cards/modules. |
| `--v4-surface-soft` | `#F8FAFC` | Soft inset areas. |
| `--v4-ink` | `#172033` | Primary text on light surfaces. |
| `--v4-ink-soft` | `#667085` | Secondary explanatory text. |
| `--v4-line` | `#E5E7EB` | Card borders and separators. |
| `--v4-navy` | `#101C33` | Fixed production rail. |
| `--v4-navy-raised` | `#182843` | Active/raised rail states. |
| `--v4-cobalt` | `#315CFF` | Primary product action. |

Cobalt `#315CFF` is the single product action color for the authenticated
leaderboard workspace and shared controls. It is confident and operational, not a
random blue/purple gradient system.

### Authenticated status colors

V4 uses darker status colors for text on the light dashboard surface:

- success `#1F8A68`, soft fill `#EAF7F2`
- warning `#B76A12`, soft fill `#FFF6E8`
- danger `#B42318`, soft fill `#FFF0EE`

Status should read as a cue, not decoration. Use narrow cue bands, badges, dots,
and concise text labels. Do not use thick rainbow borders or decorative glows.

### Public board accent is a separate axis

A board's public pages are branded to the **streamer's** color, not the product
cobalt. `site-render.js` resolves `--yr-accent: var(--yr-color-board-accent)` at
runtime and computes `--yr-accent-ink` for contrast. This axis must stay
independent of the operator accent.

---

## 5. Typography

- **Authenticated leaderboard workspace:** uses the existing dashboard font stack
  (`--v3-sans`, `--v3-mono`) so the v4 layer can ship as a focused CSS/shell
  replacement without introducing a new font-loading path. Type is made distinct
  through hierarchy: compact rail labels, high-contrast module headings, tabular
  numeric KPIs, and plain-language labels for non-technical streamers.
- **Marketing stream-day scoreboard:** Archivo Expanded (display), Inter (body),
  and JetBrains Mono (figures and labels), scoped under `.landing-page` and
  shared by the pricing, FAQ, and reviews sheets through `landing.css`.
  Marketing uses a near-achromatic Court Black / Deck / Well palette with
  cobalt actions, a tally-red on-air cue, amber scoreboard figures, and mint
  fulfilled states. Its signature is the live board in the homepage hero:
  split-flap word changes, a reordering standings list, and a countdown.
- **Public board:** Fira Sans / Fira Code loaded by `site-render.js`, with the
  board's own accent applied on top.

Copy should name what users understand: Players, Look & feel, Share your site,
Past winners, Rewards shop, How viewers earn. Avoid exposing implementation
terms in navigation.

---

## 6. Layout and navigation

### Fixed authenticated rail

`DashboardShell` and `dashboardChromeHtml` render a fixed left rail for signed-in
app surfaces:

- Expanded width: `272px`.
- Collapsed desktop width: `80px` via `data-side-collapsed="true"`.
- Collapse state persists in `localStorage` under `yr-side-collapsed`.
- Brand at the top: YourRank / Creator workspace.
- Grouped feature navigation in the middle.
- Product switcher for Sites, Telegram, Credits & Shop.
- Profile menu at the bottom via `.lb-side-profile`.
- Mobile rail becomes a drawer with Escape close, focus return, and focus trap.

The rail may collapse, but features must remain reachable and recognizable via
icons, titles, active states, and the grouped structure. Do not delete feature
links to make the UI look simpler.

### Workspace grid

The authenticated content area uses a 12-column CSS grid with a `24px` gutter:

```css
.v3-dash[data-auth-workspace] .lb-bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}
```

Modules span columns; they must not rely on structural absolute positioning.
Desktop layouts can use asymmetric 8/4 or 7/5 splits. Tablet and mobile stack
into fewer columns with the same spacing rhythm.

### Overview hierarchy

The Overview is a run-sheet, not a dump:

- `section[data-page="home"]` is itself a 12-column grid with a `24px` gap.
- The heading is compact and does not compete with launch readiness.
- One bordered launch run-sheet uses a 7/5 internal split: status and next action
  on the left, progress and interactive setup rows on the right. The internal
  divider replaces nested card borders. After publishing, the checklist
  collapses and status uses the full row without growing into a sparse hero.
- The real Publish/Unpublish command calls the site API. In the editor it includes
  unsaved changes through the existing save path; on Overview it updates status,
  activity, site links, and notifications without a detour.
- KPI row is a compact strip: one white bordered module divided into concise KPI
  cells, not three floating shadow cards competing for attention.
- Main activity uses one asymmetric 8/4 surface. Recent Activity and Top Players
  are divided sections, and confirmed-empty states stay short, explanatory, and
  actionable rather than enforcing chart-sized minimum heights.
- Quick actions stay close to the moment where the streamer needs them.

---

## 7. Geometry, spacing, and elevation

- Authenticated card/module radius: `12px`.
- Small control radius: `8px`.
- Content gap: `24px`.
- Module padding: generally `18–24px`, dropping to `18–20px` on small screens.
- Card/module border: `1px solid #E5E7EB`; use internal dividers when adjacent
  information belongs to one workflow.
- Card rest shadow: `0 1px 2px rgba(16, 24, 40, 0.06)`, used only when elevation
  communicates separation. Overview bands rely on borders and alignment.
- Overlay shadow: `0 16px 48px rgba(16, 24, 40, 0.18)`.

Elevation is functional. Cards are bordered and quiet; menus and drawers can rise
above the page. Avoid glassmorphism, meaningless gradients, arbitrary glows, and
excessively rounded AI-dashboard tiles.

---

## 8. Components and states

Shared primitives live in `ui.css` and are the **one definition** used by both
Workers for buttons (`.btn` / `.yr-ui button`), badges, dialogs (`.modal`),
tables (`.tbl-scroll`), and empty/error states (`.empty` / `.empty--error` /
`.error-state`). Add shared component styles there, not in per-Worker sheets.

Authenticated v4 modules wrap standalone features in clean cards:

- white surface
- 12px radius
- subtle border
- restrained shadow
- clear heading + supporting copy
- visible hover/focus states for clickable elements

Key interaction contracts:

- **Empty vs error are different.** "You have nothing yet" (`.empty`, dashed)
  must never be shown when a load failed (`.empty--error`, solid danger border).
- **Loading is branded and announced.** The Dashboard opens with the dark-navy
  YourRank mark, a restrained cobalt progress line, and rotating workspace copy.
  Remote card/table values use layout-matching light skeletons so dimensions do
  not jump when data arrives. Dashboard and Credits initial loaders retain
  `role="status"`, `aria-live="polite"`, and `aria-busy="true"`.
- **Feedback:** async actions surface through the toast (`#status`,
  `role="status"`) or inline `.err[role="alert"]`.
- **Touch targets** are 44px minimum on coarse pointers / narrow screens.
- Tabs and client navigation must update `aria-current="page"` so the streamer
  can tell where they are after navigation.

---

## 9. Accessibility and responsive behavior

- Every page opens with a skip link; `.sr-only` lives in `ui.css` so it exists on
  marketing pages too.
- Active navigation uses `aria-current="page"`.
- Focus states are visible and consistent.
- The mobile drawer traps focus, closes with Escape, and returns focus to the
  opener.
- Small screens hide non-essential topbar labels before controls collide.
- The dashboard must handle loading, empty, error, signed-out, long text, large
  datasets, tablet, and mobile states — not only the ideal state.

---

## 10. Guardrails

- `dashboard-v4.css` must stay scoped to `.v3-dash[data-auth-workspace]` or
  `body:has(.v3-dash[data-auth-workspace])` so public/homepage/anonymous surfaces
  do not inherit authenticated styling.
- Do not use `position: absolute` for v4 structural layout.
- Do not edit generated `packages/shared/dist/*.js` directly. Edit `packages/shared/src/*.ts`, then run
  `bun run --cwd packages/shared build`.
- Never remove or hide signed-in feature routes to simplify the rail. Simplify by
  grouping, labeling, progressive disclosure, and better hierarchy.
- Public homepage and viewer-facing pages are outside this authenticated
  dashboard redesign unless a task explicitly targets them.
- Run `bun run lint`, `bun run typecheck`, and `bun run test` before committing.

---

*Redesign direction seed: Creator Run-Sheet workspace, seed `562938e8`, Operate
mode. Current verdict: authenticated dashboard ships as a light, fixed-rail,
12-column workspace with cobalt actions and navy production chrome; v3 remains a
legacy/base layer underneath the scoped v4 system.*
