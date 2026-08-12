export async function restoreAutoResetMarker(execute, siteId, previousValue) {
  await execute(
    `UPDATE sites
        SET auto_reset_last_run_at = $2
      WHERE id = $1
        AND auto_reset_last_run_at = ends_at`,
    [siteId, previousValue ?? null]
  );
}
