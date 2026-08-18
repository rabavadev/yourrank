export const LEGACY_TELEGRAM_REDIRECTS = Object.freeze({
  "/bot": "/dashboard/telegram",
  "/bot/dashboard": "/dashboard/telegram",
  "/bot/bots": "/dashboard/telegram/bots",
  "/bot/commands": "/dashboard/telegram/commands",
  "/bot/offers": "/dashboard/telegram/offers",
  "/bot/broadcasts": "/dashboard/telegram/broadcasts",
  "/dashboard/telegram/overview": "/dashboard/telegram",
  "/dashboard/bot/setup": "/dashboard/telegram",
});

export function legacyTelegramRedirect(pathname) {
  return LEGACY_TELEGRAM_REDIRECTS[pathname] || "";
}
