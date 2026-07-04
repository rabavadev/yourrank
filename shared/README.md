# Shared Modules

This directory contains modules shared between the leaderboard (JS) and bot (TS) Workers.

Each module exists as both `.js` and `.ts`:
- `.ts` files are the source of truth (used by bot Worker)
- `.js` files are the compiled/maintained versions (used by leaderboard Worker)

When modifying shared code, update BOTH files to keep them in sync.
