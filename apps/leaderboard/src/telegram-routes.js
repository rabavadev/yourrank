export const LEGACY_TELEGRAM_REDIRECTS = Object.freeze({
  "/dashboard/telegram": "/bot/dashboard",
  "/dashboard/telegram/overview": "/bot/dashboard",
  "/dashboard/bot/setup": "/bot/dashboard",
  "/dashboard/telegram/bots": "/bot/bots",
  "/dashboard/telegram/commands": "/bot/commands",
  "/dashboard/telegram/offers": "/bot/offers",
  "/dashboard/telegram/broadcasts": "/bot/broadcasts",
});

export function legacyTelegramRedirect(pathname) {
  return LEGACY_TELEGRAM_REDIRECTS[pathname] || "";
}
