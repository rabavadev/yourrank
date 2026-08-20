ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS rank_by text NOT NULL DEFAULT 'wagered';

UPDATE public.sites
   SET rank_by = 'wagered'
 WHERE rank_by IS NULL
    OR rank_by NOT IN ('wagered', 'score');

ALTER TABLE public.sites
  DROP CONSTRAINT IF EXISTS sites_rank_by_check;

ALTER TABLE public.sites
  ADD CONSTRAINT sites_rank_by_check CHECK (rank_by IN ('wagered', 'score'));
