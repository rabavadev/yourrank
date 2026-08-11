-- Extend the credit ledger so cancelled Kick reward redemptions and streamer
-- balance adjustments can be recorded as append-only reversals.
ALTER TABLE public.credit_ledger
  DROP CONSTRAINT IF EXISTS credit_ledger_type_check;
ALTER TABLE public.credit_ledger
  ADD CONSTRAINT credit_ledger_type_check
  CHECK (type IN ('earn','spend','redeem','revoke','refund'));

-- Index for reversing a specific Kick redemption id (stored in ledger metadata)
-- without mutating existing ledger rows.
CREATE INDEX IF NOT EXISTS idx_credit_ledger_kick_redemption_id
  ON public.credit_ledger ((metadata ->> 'kick_redemption_id'));
