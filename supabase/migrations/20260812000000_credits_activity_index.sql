CREATE INDEX idx_credit_ledger_site_viewer_created_id
  ON public.credit_ledger(site_viewer_id, created_at DESC, id DESC);
