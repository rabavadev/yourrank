// ============================================================================
//  URL guards for values that reach href/src attributes.
//
//  Boot metadata is server-rendered, but it still arrives through the DOM, so
//  every link and image URL is validated against an allow-list before it is
//  rendered. Anything unexpected (javascript:, data:, protocol-relative //host)
//  falls back to a safe value rather than being patched up.
// ============================================================================

/** Site-relative path: a single leading slash, no scheme, no protocol-relative form. */
const SAFE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%?#[\]]*$/;

/** Same as SAFE_PATH, plus absolute https URLs for externally hosted images. */
const SAFE_IMAGE = /^https:\/\/[A-Za-z0-9\-._~%]+(?::\d+)?(?:\/[A-Za-z0-9\-._~!$&'()*+,;=:@/%?#[\]]*)?$/;

export function safePath(value: unknown, fallback: string): string {
  return typeof value === "string" && SAFE_PATH.test(value) ? value : fallback;
}

export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return SAFE_PATH.test(value) || SAFE_IMAGE.test(value) ? value : null;
}
