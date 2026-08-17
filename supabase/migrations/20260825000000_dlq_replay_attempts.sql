ALTER TABLE public.queue_dlq_events
  ADD COLUMN IF NOT EXISTS replay_attempts INTEGER NOT NULL DEFAULT 0;
