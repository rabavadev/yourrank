// Aggregator: per-page modules re-exported as PAGES

import { landingPage } from "./pages/landing.js";
import { loginPage } from "./pages/login.js";
import { forgotPage } from "./pages/forgot.js";
import { resetPage } from "./pages/reset.js";
import { signupPage } from "./pages/signup.js";
import { dashboardPage } from "./pages/dashboard.js";
import { analyticsPage } from "./pages/analytics.js";
import { billingPage } from "./pages/billing.js";
import { attributionPage } from "./pages/attribution.js";
import { botSetupPage } from "./pages/bot-setup.js";
import { securityPage } from "./pages/security.js";
import { adminPage } from "./pages/admin.js";
import { admin2faPage } from "./pages/admin-2fa.js";
import { setupPage } from "./pages/setup.js";
import { overlayPage } from "./pages/overlay.js";
import { termsPage } from "./pages/terms.js";
import { privacyPage } from "./pages/privacy.js";
import { responsiblePage } from "./pages/responsible.js";
import { refundPage } from "./pages/refund.js";
import { cookiesPage } from "./pages/cookies.js";
import { contactPage } from "./pages/contact.js";
import { pricingPage } from "./pages/pricing.js";

export const PAGES = {
  index: landingPage,
  login: loginPage,
  forgot: forgotPage,
  reset: resetPage,
  signup: signupPage,
  dashboard: dashboardPage,
  analytics: analyticsPage,
  billing: billingPage,
  attribution: attributionPage,
  botSetup: botSetupPage,
  security: securityPage,
  admin: adminPage,
  admin2fa: admin2faPage,
  setup: setupPage,
  overlay: overlayPage,
  terms: termsPage,
  privacy: privacyPage,
  responsible: responsiblePage,
  refund: refundPage,
  cookies: cookiesPage,
  contact: contactPage,
  pricing: pricingPage,
};
