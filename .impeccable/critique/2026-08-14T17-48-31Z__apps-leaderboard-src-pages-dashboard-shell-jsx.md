---
target: dashboard (authenticated workspace)
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
p2_count: 1
timestamp: 2026-08-14T17-48-31Z
slug: apps-leaderboard-src-pages-dashboard-shell-jsx
---
# Design Critique — YourRank Creator Dashboard

## Design Health Score: 33/40 (Good)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent (skeletons, savebar, publish states) — but status split across 4 surfaces with no single source of truth |
| 2 | Match System / Real World | 3 | "Race ends on / Powers the live timer" great; "provably fair", "Postback", "Global Account Scope" leak jargon |
| 3 | User Control and Freedom | 4 | Confirms, dirty-nav Save/Discard/Cancel, Escape closes — only gap: no undo after save |
| 4 | Consistency and Standards | 3 | Tokens disciplined, but v3/v4 layering leaves dead rules, duplicate .ov-player-row, 3 parallel button systems |
| 5 | Error Prevention | 3 | Import preview, disabled-until-valid — but inline-edit table cells have zero field validation |
| 6 | Recognition Rather Than Recall | 3 | All 23 rail links visible — but collapsed rail tooltips promised, never implemented |
| 7 | Flexibility and Efficiency | 3 | ⌘K palette, Ctrl+S, arrow-key table nav great — palette is static 14 commands, no bulk edit |
| 8 | Aesthetic and Minimalist Design | 3 | Quiet bordered cards right — settings/account/share text-and-pill heavy; 3 consecutive PRO-locked cards |
| 9 | Error Diagnosis and Recovery | 4 | empty vs error enforced, full-screen .error-state with Retry, role=alert toasts — best-in-class |
| 10 | Help and Documentation | 3 | Metric glossary, help hub, OBS tips — discovery passive, dense fields get no inline "why" |

Rating: 33/40 = 82.5% = Good.

## Design Specificity Verdict

**Split decision: genuinely authored at the operating core, template-furniture in the surrounding suites.**

Authored for the streamer run-sheet job: the Overview `.ov-command-grid` 7/5 split with status→next-action branching; publish as a real command with truthful confirm ("Anyone with the link will be able to visit it"); streamer vocabulary ("Racers & scores", "Race ends on — Powers the live timer", OBS embed tips, paste-import "we'll figure it out"); click-to-edit preview loop.

Category-interchangeable SaaS furniture: the 23-link generic admin rail; the settings page as ten repeated bold-title + outline-button rows; KPI cards with % deltas, heatmap, share-card grid; PRO-lock pattern appearing 7+ times.

Deterministic scan (detect.mjs): exit 2, 2 findings — `broken-image` at dashboard.jsx:180 is a false positive (hidden JS-populated logo preview); `overused-font` at login.jsx:15 is factual but low severity (Inter is fallback behind Fira Sans).

## Overall Impression

The v4 redesign honors its own thesis on the first screen and the publish/players/share spine — that is rare and real. But the run-sheet stops at the Overview's fold: Settings, Account, Analytics, Credits, and Telegram still render as generic row-and-card furniture, and the rail walls off 23 equal-weight links. The single biggest opportunity: the draft-vs-live mental model — a mid-race streamer must understand that "Save changes" does not mean viewers see it.

## What's Working

1. **The run-sheet Overview is genuinely authored** — status→next-action branching, 3-step checklist that collapses on completion, shared-boundary KPI band instead of floating shadow cards.
2. **State truthfulness + operational safety** — publish/unpublish as real commands with consequence copy, live links gated on actual liveness, empty≠error enforced, beforeunload/dirty-nav guard that respects the operator's work.
3. **The editor↔preview loop** — click-to-edit via postMessage, device tabs, sync strip, spreadsheet-grade table (arrow-key nav, paste import, bulk bar).

## Priority Issues

**[P0] The rail is a 23-link wall that contradicts the run-sheet thesis.** Why: highest scanning cost in the product; streamer can't tell workflow sequence (v4 even hides the editor's numbered 1-5 steps, dashboard-v4.css:1266,1405). Fix: fold Telegram's 5 links into the product switcher, merge Mini-games into Theme & styling, cut COMMUNITY & REWARDS to ≤4 with the Rewards hub as destination, restore an in-editor progress indicator. (Suggested command: $impeccable distill)

**[P0] Draft vs live is a two-action model with scattered truth.** Why: mid-race operator can save but never publish, and the "SYNCED" preview chip implies freshness that doesn't mean live. Fix: when dirty, the publish button becomes "Save & publish"; chip shows "Draft — not on your live page" vs "Live"; one state object drives lb-status, savebar, toast, previewSyncStatus. (Suggested command: $impeccable clarify)

**[P1] Free-plan friction + silent failure in the design flow.** Why: three consecutive PRO-locked cards feel like "everything good costs money"; `applyTheme` silently skips accent for free plans yet the toast says "palette selected" (site.js:797) — a trust break. Fix: one consolidated Pro card, gate visibly at Save time, fix the dishonest toast. (Suggested command: $impeccable clarify)

**[P1] Choice overload at import/columns/table.** Import menu (5 items), Columns menu (5 checkboxes), toolbar stacking search+sort+columns+import+bulk+quick-add+pagination. Fix: one primary "Paste" CTA with secondary links inside; Columns as preset toggle (Compact/Full) + Advanced disclosure. (Suggested command: $impeccable distill)

**[P2] Accessibility gaps in the "polished" parts.** --v4-ink-mute #8d96a8 and placeholder #98a2b3 fail 4.5:1 contrast; palette has no aria-activedescendant/focus trap and emoji icons get read aloud; .yr-help-drawer missing aria-label; collapsed-rail tooltips commented but not implemented; ⌘K hint is Mac-only copy. Plus detector extras: 6 interactive controls <44px (publish 38px, new-site 36px, command icons 38px), no skip link on authenticated pages, ~90 hardcoded out-of-token colors with Tailwind drift, undefined --v4-font-mono, amber glow dashboard-v4.css:3140. (Suggested command: $impeccable audit)

## Persona Red Flags

**Alex (power user)**: palette is a static 14 commands — no player search, no save&publish, no site switch; no shortcut for publish; single-player removal demands a confirm modal every time; import needs two hops for the fastest path.

**Jordan (first-timer streamer)**: "provably fair", "Postback", "Global Account Scope" jargon; rail presents the whole suite at once; "DANGER ZONE" label is anxiety-inducing; free-plan brand card mixes enabled font selector with locked logo/colors — confusing what's theirs.

**Sam (accessibility)**: --v4-ink-mute/placeholder contrast failures; 10px uppercase status text; palette lacks focus management and aria-label; help drawer without aria-label; collapsed rail becomes icon-only with title-only fallback.

## Minor Observations

- Dead/duplicate CSS: two .ov-player-row definitions (grid :1389 vs flex :3149), v3-table-foot twice — v3/v4 layering accumulating corpses; 46 !important (all override-scoped).
- #ovStepPublish dangling href="#publish" only works via JS wiring.
- Emoji icons (📊👤💡) inside an otherwise Lucide-stroke icon system.
- lb-status default "Checking" styled red — alarm color for neutral state.
- Overview quick-increment chips hidden via display:none after rendering — dead markup shipped.
- After archiving a period, no next-step copy.
- "OPTIONAL" uppercase placeholder inconsistent with sentence-case placeholders.

## Questions to Consider

1. If the thesis is "what's live, what needs attention, next action", why is the topbar's most prominent cluster a site switcher instead of a status console (race countdown, dirty state, publish)?
2. The same work exists as three different sequences (run-sheet 3 steps, hidden editor 1-5 steps, rail 23 links) — which one is the user's actual job?
3. What would a "run-sheet" version of Settings/Account/Danger Zone even look like?

## Modern Dashboard Style Directions

1. **Broadcast-console dark mode (race-day HUD)** — PRODUCT.md itself says operators work "in low-light, multi-screen environments". Navy rail owns the full canvas in an "On air" theme: race-card with live countdown from f_ends, publish bar becomes ON AIR console (red offline / green pulse live — the ov-live-pulse dot exists), standings rows highlight on change, KPI band as live ticker. Preserve light default for daylight ops, the 7/5 command grid, quiet 1px borders, confirm safety.

2. **Command-palette-first workspace** — the ⌘K palette and topbar search already exist and are styled well; make them the spine. Grow palette from 14 static commands to context-aware actions: search players and jump to their row, "Save & publish", "Unpublish", switch site, "Next step". The palette becomes the answer to the 23-item rail: Alex never scans it, Jordan always has a fallback.

3. **Run-sheet editorial / show-card layout** — treat Overview as an episode card for "today's race": hero run-sheet with name/countdown/status/next action; KPI band as divided ticker strip with mini sparklines; Recent Activity as broadcast rundown log (time-stamped, event-typed rows — data already in #ovActivityList); Top Players as podium strip; editor becomes control-room (left rundown, center preview monitor, right inspector).

**Must preserve from v4:** the run-sheet command grid and status honesty; single publish/unpublish command with confirmation; bordered-quiet module system; state discipline (skeletons, empty≠error, retry, aria-live); click-to-edit preview loop; plain-language outcome-named copy.

## Run Notes

- Target slug: apps-leaderboard-src-pages-dashboard-shell-jsx
- Ignore list: none (.impeccable/critique/ignore.md absent)
- Assessment independence: dual sub-agents, no output seen by the other
- CLI detector: ran, exit 2, 2 findings (1 false positive flagged)
- Browser visualization: skipped — requires local Postgres + docker compose + wrangler .dev.vars secrets; win32 environment, exceeds budget
- Overlay injection: not attempted (no live server)
- Live server: none started
