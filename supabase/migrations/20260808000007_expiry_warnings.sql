-- Track expiry warning emails so users are not spammed.
CREATE TABLE IF NOT EXISTS expiry_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('upcoming','expired')),
  sent_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_expiry_warnings_user_kind_sent
  ON expiry_warnings(user_id, kind, sent_at desc);
