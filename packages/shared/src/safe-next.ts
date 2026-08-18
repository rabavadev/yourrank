const UNSAFE_SCHEME = /^[a-z][a-z\d+.-]*:/i;

export function isSafeNextPath(value: unknown): value is string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    value[1] !== "\\" &&
    !/[\u0000-\u001f\u007f\s]/.test(value) &&
    !UNSAFE_SCHEME.test(value);
}

export function safeNextPath(value: unknown, fallback = "/dashboard"): string {
  return isSafeNextPath(value) ? value : fallback;
}
