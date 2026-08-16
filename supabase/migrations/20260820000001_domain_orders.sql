-- In-app domain purchases and lifecycle tracking table.
CREATE TABLE IF NOT EXISTS public.domain_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  domain TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'namecheap',
  provider_order_id TEXT,
  amount_paid INTEGER NOT NULL,
  wholesale_cost INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'transferred', 'cancelled')),
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '1 year',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_orders_user_id ON public.domain_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_orders_site_id ON public.domain_orders(site_id);
CREATE INDEX IF NOT EXISTS idx_domain_orders_expires_at ON public.domain_orders(expires_at);
