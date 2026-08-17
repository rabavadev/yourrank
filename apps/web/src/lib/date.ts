export function localDateTimeToUtc(isoLocal: string, offsetMinutes: number): string | undefined {
  const trimmed = String(isoLocal ?? "").trim();
  if (!trimmed) return undefined;
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return trimmed;
  const [, year, month, day, hour, minute] = m;
  const localMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  return new Date(localMs + Number(offsetMinutes) * 60_000).toISOString();
}
