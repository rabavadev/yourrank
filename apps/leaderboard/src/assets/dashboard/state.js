// Shared mutable state for the dashboard modules.
export const state = {
  SLUG: null,
  EXTRA: {},
  ME: null,
  ACTIVE_SITE_ID: null,
  SITE_UPDATED_AT: null,
  PUBLISHED_AT: null,
  BOARDS: [],
  TEMPLATE_CATALOG: [],
  CURRENT_BRANDING: { template: "classic", accentA: null, accentB: null },
  PUBLISHED: false,
  IS_DRAFT: false,
  THEME_SAVING: false,
  LOGO: undefined, // undefined = unchanged, null = remove, string = new data URI
  _dirty: false,
  pageReqId: document.querySelector('meta[name="request-id"]')?.content || "",
};

// Single source of truth for "is this board actually reachable by visitors".
// A published board is still not live while the owner's email is unconfirmed,
// so every surface (badge, banner, share step, toasts) must derive from this.
export function boardStatus() {
  const emailVerified = state.ME ? state.ME.emailVerified !== false : true;
  const published = !!state.PUBLISHED;
  const live = published && emailVerified;
  let key = "draft";
  if (published) key = live ? "published" : "pending";
  else if (!state.IS_DRAFT) key = "unpublished";
  return { live, published, emailVerified, key };
}
