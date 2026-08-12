export function serializeWebhookUrl(value, configured) {
  const url = String(value || "").trim();
  return url || (configured ? undefined : null);
}
