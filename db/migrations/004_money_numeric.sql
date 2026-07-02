-- ============================================================
--  Migration 004 — Fix money columns: DOUBLE PRECISION → NUMERIC
--
--  DOUBLE PRECISION (IEEE 754 float8) has ~15 significant digits
--  but rounds binary fractions, causing silent precision loss on
--  monetary values (e.g. 0.1 + 0.2 ≠ 0.3). NUMERIC(15,2) stores
--  exact decimal values with 2-digit fractional precision.
--
--  Run once against the existing database.
-- ============================================================

ALTER TABLE players ALTER COLUMN wagered TYPE NUMERIC(15,2);
ALTER TABLE players ALTER COLUMN prize   TYPE NUMERIC(15,2);
