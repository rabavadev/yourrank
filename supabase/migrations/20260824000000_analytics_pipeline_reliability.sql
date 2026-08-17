CREATE TABLE IF NOT EXISTS public.queue_dlq_events (
  message_id TEXT PRIMARY KEY,
  queue_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  body JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  replayed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queue_dlq_events_unreplayed_received
  ON public.queue_dlq_events(received_at)
  WHERE replayed_at IS NULL;

ALTER TABLE public.consumer_heartbeat
  ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_success_at TIMESTAMPTZ;
