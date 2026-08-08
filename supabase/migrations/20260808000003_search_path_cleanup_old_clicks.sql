-- Fix SECURITY DEFINER search_path for cleanup_old_clicks.
-- Without an explicit search_path, the function is vulnerable to search-path
-- hijacking when it runs with owner privileges.
CREATE OR REPLACE FUNCTION public.cleanup_old_clicks()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  v_count bigint;
BEGIN
  DELETE FROM click_daily WHERE day < (CURRENT_DATE - INTERVAL '90 days');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  deleted_count := v_count;
  RETURN NEXT;

  RAISE NOTICE 'cleanup_old_clicks: deleted % click_daily rows older than 90 days', v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_clicks() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_clicks() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_clicks() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_clicks() TO service_role;
