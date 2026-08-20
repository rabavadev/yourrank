const RULES = [
  {
    test: (password) => password.length >= 8,
    message: "Password must be at least 8 characters",
  },
  {
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
    message: "Password must include upper and lower case letters",
  },
  {
    test: (password) => /\d/.test(password),
    message: "Password must include a number",
  },
  {
    test: (password) => /[^A-Za-z0-9]/.test(password),
    message: "Password must include a symbol",
  },
];

export function validatePassword(password) {
  const value = String(password || "");
  const failed = RULES.find((rule) => !rule.test(value));
  return failed ? { ok: false, message: failed.message } : { ok: true, message: "" };
}
