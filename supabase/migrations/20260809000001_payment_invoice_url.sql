-- Store the NOWPayments invoice URL so users can resume checkout after a disconnect,
-- and add abandoned/cancelled statuses for stale or user-cancelled invoices.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS invoice_url text;

ALTER TYPE public.pay_status ADD VALUE IF NOT EXISTS 'abandoned';
ALTER TYPE public.pay_status ADD VALUE IF NOT EXISTS 'cancelled';
