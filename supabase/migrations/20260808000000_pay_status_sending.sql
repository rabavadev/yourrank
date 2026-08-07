-- NOWPayments IPNs can carry payment_status='sending' (funds broadcasting to
-- the payout address — a non-terminal pending state). The pay_status enum was
-- missing it, so `UPDATE payments SET status='sending'` raised
-- invalid-input-value-for-enum and the IPN handler answered 500, causing
-- NOWPayments to retry-storm.
--
-- 'sending' is pending: the leaderboard IPN handler only grants credit for
-- 'confirmed'/'finished' and already answers 200 for any other status.
ALTER TYPE public.pay_status ADD VALUE IF NOT EXISTS 'sending';
