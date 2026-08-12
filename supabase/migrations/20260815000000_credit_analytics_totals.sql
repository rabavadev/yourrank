-- Maintain exact site-level credit analytics aggregates so request paths do
-- not rescan the append-only ledger and redemption history.

CREATE TABLE IF NOT EXISTS public.site_credit_aggregates (
    site_id uuid PRIMARY KEY REFERENCES public.sites(id) ON DELETE CASCADE,
    total_earned bigint NOT NULL DEFAULT 0,
    total_spent bigint NOT NULL DEFAULT 0,
    total_balance bigint NOT NULL DEFAULT 0,
    redemptions_pending bigint NOT NULL DEFAULT 0,
    redemptions_fulfilled bigint NOT NULL DEFAULT 0,
    redemptions_cancelled bigint NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_credit_aggregates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_role_all_site_credit_aggregates ON public.site_credit_aggregates;
CREATE POLICY service_role_all_site_credit_aggregates
    ON public.site_credit_aggregates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Backfill from source tables before installing maintenance triggers. The
-- correlated aggregates avoid multiplying ledger and redemption rows.
INSERT INTO public.site_credit_aggregates (
    site_id,
    total_earned,
    total_spent,
    total_balance,
    redemptions_pending,
    redemptions_fulfilled,
    redemptions_cancelled
)
SELECT
    s.id,
    COALESCE((
        SELECT SUM(CASE
            WHEN cl.type = 'earn' THEN cl.amount
            WHEN cl.type = 'refund' THEN -cl.amount
            ELSE 0
        END)
        FROM public.credit_ledger cl
        JOIN public.site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = s.id
          AND cl.type IN ('earn', 'refund')
    ), 0),
    COALESCE((
        SELECT SUM(CASE
            WHEN cl.type = 'spend' THEN cl.amount
            WHEN cl.type = 'revoke' THEN -cl.amount
            ELSE 0
        END)
        FROM public.credit_ledger cl
        JOIN public.site_viewers sv ON sv.id = cl.site_viewer_id
        WHERE sv.site_id = s.id
          AND cl.type IN ('spend', 'revoke')
    ), 0),
    COALESCE((
        SELECT SUM(sv.balance)
        FROM public.site_viewers sv
        WHERE sv.site_id = s.id
    ), 0),
    COALESCE((
        SELECT COUNT(*)
        FROM public.redemptions r
        JOIN public.site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id = s.id AND r.status = 'pending'
    ), 0),
    COALESCE((
        SELECT COUNT(*)
        FROM public.redemptions r
        JOIN public.site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id = s.id AND r.status = 'fulfilled'
    ), 0),
    COALESCE((
        SELECT COUNT(*)
        FROM public.redemptions r
        JOIN public.site_viewers sv ON sv.id = r.site_viewer_id
        WHERE sv.site_id = s.id AND r.status = 'cancelled'
    ), 0)
FROM public.sites s
ON CONFLICT (site_id) DO UPDATE SET
    total_earned = EXCLUDED.total_earned,
    total_spent = EXCLUDED.total_spent,
    total_balance = EXCLUDED.total_balance,
    redemptions_pending = EXCLUDED.redemptions_pending,
    redemptions_fulfilled = EXCLUDED.redemptions_fulfilled,
    redemptions_cancelled = EXCLUDED.redemptions_cancelled,
    updated_at = now();

CREATE OR REPLACE FUNCTION public.maintain_site_credit_ledger_aggregate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_site_id uuid;
    v_earned_delta bigint := 0;
    v_spent_delta bigint := 0;
BEGIN
    SELECT site_id INTO v_site_id
      FROM public.site_viewers
     WHERE id = COALESCE(NEW.site_viewer_id, OLD.site_viewer_id);

    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.type = 'earn' THEN v_earned_delta := NEW.amount;
        ELSIF NEW.type = 'refund' THEN v_earned_delta := -NEW.amount;
        ELSIF NEW.type = 'spend' THEN v_spent_delta := NEW.amount;
        ELSIF NEW.type = 'revoke' THEN v_spent_delta := -NEW.amount;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.type = 'earn' THEN v_earned_delta := v_earned_delta - OLD.amount;
        ELSIF OLD.type = 'refund' THEN v_earned_delta := v_earned_delta + OLD.amount;
        ELSIF OLD.type = 'spend' THEN v_spent_delta := v_spent_delta - OLD.amount;
        ELSIF OLD.type = 'revoke' THEN v_spent_delta := v_spent_delta + OLD.amount;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'earn' THEN v_earned_delta := -OLD.amount;
        ELSIF OLD.type = 'refund' THEN v_earned_delta := OLD.amount;
        ELSIF OLD.type = 'spend' THEN v_spent_delta := -OLD.amount;
        ELSIF OLD.type = 'revoke' THEN v_spent_delta := OLD.amount;
        END IF;
    END IF;

    IF v_site_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    INSERT INTO public.site_credit_aggregates (site_id, total_earned, total_spent)
    VALUES (v_site_id, v_earned_delta, v_spent_delta)
    ON CONFLICT (site_id) DO UPDATE SET
        total_earned = site_credit_aggregates.total_earned + EXCLUDED.total_earned,
        total_spent = site_credit_aggregates.total_spent + EXCLUDED.total_spent,
        updated_at = now();
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_site_credit_balance_aggregate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old_site_id uuid;
    v_new_site_id uuid;
    v_old_balance bigint := 0;
    v_new_balance bigint := 0;
BEGIN
    IF TG_OP <> 'INSERT' THEN
        v_old_site_id := OLD.site_id;
        v_old_balance := COALESCE(OLD.balance, 0);
    END IF;
    IF TG_OP <> 'DELETE' THEN
        v_new_site_id := NEW.site_id;
        v_new_balance := COALESCE(NEW.balance, 0);
    END IF;

    IF v_old_site_id IS NOT NULL THEN
        INSERT INTO public.site_credit_aggregates (site_id, total_balance)
        VALUES (v_old_site_id, -v_old_balance)
        ON CONFLICT (site_id) DO UPDATE SET
            total_balance = site_credit_aggregates.total_balance + EXCLUDED.total_balance,
            updated_at = now();
    END IF;
    IF v_new_site_id IS NOT NULL THEN
        INSERT INTO public.site_credit_aggregates (site_id, total_balance)
        VALUES (v_new_site_id, v_new_balance)
        ON CONFLICT (site_id) DO UPDATE SET
            total_balance = site_credit_aggregates.total_balance + EXCLUDED.total_balance,
            updated_at = now();
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.maintain_site_redemption_aggregate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_site_id uuid;
    v_pending_delta bigint := 0;
    v_fulfilled_delta bigint := 0;
    v_cancelled_delta bigint := 0;
BEGIN
    SELECT site_id INTO v_site_id
      FROM public.site_viewers
     WHERE id = COALESCE(NEW.site_viewer_id, OLD.site_viewer_id);

    IF TG_OP <> 'INSERT' THEN
        IF OLD.status = 'pending' THEN v_pending_delta := v_pending_delta - 1;
        ELSIF OLD.status = 'fulfilled' THEN v_fulfilled_delta := v_fulfilled_delta - 1;
        ELSIF OLD.status = 'cancelled' THEN v_cancelled_delta := v_cancelled_delta - 1;
        END IF;
    END IF;
    IF TG_OP <> 'DELETE' THEN
        IF NEW.status = 'pending' THEN v_pending_delta := v_pending_delta + 1;
        ELSIF NEW.status = 'fulfilled' THEN v_fulfilled_delta := v_fulfilled_delta + 1;
        ELSIF NEW.status = 'cancelled' THEN v_cancelled_delta := v_cancelled_delta + 1;
        END IF;
    END IF;

    IF v_site_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    INSERT INTO public.site_credit_aggregates (
        site_id, redemptions_pending, redemptions_fulfilled, redemptions_cancelled
    )
    VALUES (v_site_id, v_pending_delta, v_fulfilled_delta, v_cancelled_delta)
    ON CONFLICT (site_id) DO UPDATE SET
        redemptions_pending = site_credit_aggregates.redemptions_pending + EXCLUDED.redemptions_pending,
        redemptions_fulfilled = site_credit_aggregates.redemptions_fulfilled + EXCLUDED.redemptions_fulfilled,
        redemptions_cancelled = site_credit_aggregates.redemptions_cancelled + EXCLUDED.redemptions_cancelled,
        updated_at = now();
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS maintain_site_credit_ledger_aggregate ON public.credit_ledger;
CREATE TRIGGER maintain_site_credit_ledger_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.credit_ledger
FOR EACH ROW EXECUTE FUNCTION public.maintain_site_credit_ledger_aggregate();

DROP TRIGGER IF EXISTS maintain_site_credit_balance_aggregate ON public.site_viewers;
CREATE TRIGGER maintain_site_credit_balance_aggregate
AFTER INSERT OR UPDATE OF site_id, balance OR DELETE ON public.site_viewers
FOR EACH ROW EXECUTE FUNCTION public.maintain_site_credit_balance_aggregate();

DROP TRIGGER IF EXISTS maintain_site_redemption_aggregate ON public.redemptions;
CREATE TRIGGER maintain_site_redemption_aggregate
AFTER INSERT OR UPDATE OF site_viewer_id, status OR DELETE ON public.redemptions
FOR EACH ROW EXECUTE FUNCTION public.maintain_site_redemption_aggregate();
