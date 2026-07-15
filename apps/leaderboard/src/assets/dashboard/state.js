// Shared mutable state for the dashboard modules.
export const state = {
  SLUG: null,
  EXTRA: {},
  ME: null,
  ACTIVE_SITE_ID: null,
  SITE_UPDATED_AT: null,
  BOARDS: [],
  TEMPLATE_CATALOG: [],
  CURRENT_BRANDING: { template: "classic", accentA: null, accentB: null },
  THEME_SAVING: false,
  LOGO: undefined, // undefined = unchanged, null = remove, string = new data URI
  _dirty: false,
  pageReqId: document.querySelector('meta[name="request-id"]')?.content || "",
};
