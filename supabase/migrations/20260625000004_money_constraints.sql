-- ============================================================
--  Migration 005 — CHECK constraints on money columns
--
--  Ensures wagered and prize can never go negative.  Defence in
--  depth: the app layer already validates, but a raw SQL INSERT
--  or a future code path could bypass it.
--
--  Run once against the existing database.
-- ============================================================

ALTER TABLE players
    ADD CONSTRAINT positive_wagered CHECK (wagered >= 0),
    ADD CONSTRAINT positive_prize   CHECK (prize   >= 0);
