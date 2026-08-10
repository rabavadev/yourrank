-- Task 17: last synced timestamps for Telegram command menu and Kick channel connection.
ALTER TABLE public.bots
  ADD COLUMN IF NOT EXISTS last_command_sync_at timestamp with time zone;

ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS kick_channel_linked_at timestamp with time zone;
