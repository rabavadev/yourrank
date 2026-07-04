-- ============================================================
--  Migration: Add plan_tier column to payments table
--
--  CRITICAL FIX: Store explicit plan tier on payment rows instead of
--  reverse-engineering from amount. This prevents:
--  1. Tier misassignment when PRO_PRICE_USD override causes price collisions
--  2. Silent wrong-tier grants when promotional pricing changes
--  3. Fragile -1 fudge factor logic in tier selection
--
--  The column defaults to NULL for existing rows; new payments will
--  include the tier. IPN handler falls back to amount-based lookup
--  for legacy rows without plan_tier.
-- ============================================================

-- Add plan_tier column (matches the plan_tier enum used elsewhere)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_tier plan_tier;

-- Add index for faster lookups by tier
CREATE INDEX IF NOT EXISTS idx_payments_plan_tier ON payments(plan_tier) WHERE plan_tier IS NOT NULL;
