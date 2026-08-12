-- Keep Telegram redeliveries from replaying bot replies and side effects.
CREATE TABLE IF NOT EXISTS public.telegram_webhook_updates (
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  update_id BIGINT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (bot_id, update_id)
);

CREATE INDEX IF NOT EXISTS idx_telegram_webhook_updates_received_at
  ON public.telegram_webhook_updates (received_at);

ALTER TABLE public.telegram_webhook_updates ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.telegram_webhook_updates FROM anon, authenticated;
GRANT ALL ON TABLE public.telegram_webhook_updates TO service_role;
