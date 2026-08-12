// Aggregator: per-page modules re-exported as PAGES

import { landingPage } from "./pages/landing.js";
import { LoginPage } from "./pages/login.jsx";
import { forgotPage } from "./pages/forgot.js";
import { resetPage } from "./pages/reset.js";
import { signupPage } from "./pages/signup.js";
import { dashboardConfig, DashboardContent } from "./pages/dashboard.jsx";
import { adminPage } from "./pages/admin.js";
import { admin2faPage } from "./pages/admin-2fa.js";
import { overlayPage } from "./pages/overlay.js";
import { termsPage } from "./pages/terms.js";
import { privacyPage } from "./pages/privacy.js";
import { responsiblePage } from "./pages/responsible.js";
import { refundPage } from "./pages/refund.js";
import { cookiesPage } from "./pages/cookies.js";
import { helpSupportPage, helpFeedbackPage } from "./pages/help.js";
import { pricingPage } from "./pages/pricing.js";
import { docsPage } from "./pages/docs.js";
import {
  RewardsChannelPage,
  RewardsRulesPage,
  RewardsShopPage,
  RewardsViewersPage,
  RewardsRedemptionsPage,
  RewardsHistoryPage,
} from "./pages/rewards.jsx";
import {
  rewardsChannelConfig,
  rewardsRulesConfig,
  rewardsShopConfig,
  rewardsViewersConfig,
  rewardsRedemptionsConfig,
  rewardsHistoryConfig,
} from "./pages/rewards.jsx";
import {
  AccountProfilePage,
  AccountPlanPage,
  AccountPostbacksPage,
  AccountConnectedPage,
  AccountDataPage,
} from "./pages/account.jsx";
import {
  accountProfileConfig,
  accountPlanConfig,
  accountPostbacksConfig,
  accountConnectedConfig,
  accountDataConfig,
} from "./pages/account.jsx";
import { faqPage } from "./pages/faq.js";
import { reviewsPage } from "./pages/reviews.js";

export const PAGES = {
  index: landingPage,
  docs: docsPage,
  login: { Component: LoginPage },
  forgot: forgotPage,
  reset: resetPage,
  signup: signupPage,
  dashboard: { config: dashboardConfig, Component: DashboardContent },
  admin: adminPage,
  admin2fa: admin2faPage,
  overlay: overlayPage,
  terms: termsPage,
  privacy: privacyPage,
  responsible: responsiblePage,
  refund: refundPage,
  cookies: cookiesPage,
  helpSupport: helpSupportPage,
  helpFeedback: helpFeedbackPage,
  pricing: pricingPage,
  rewardsChannel: { config: rewardsChannelConfig, Component: RewardsChannelPage },
  rewardsRules: { config: rewardsRulesConfig, Component: RewardsRulesPage },
  rewardsShop: { config: rewardsShopConfig, Component: RewardsShopPage },
  rewardsViewers: { config: rewardsViewersConfig, Component: RewardsViewersPage },
  rewardsRedemptions: { config: rewardsRedemptionsConfig, Component: RewardsRedemptionsPage },
  rewardsHistory: { config: rewardsHistoryConfig, Component: RewardsHistoryPage },
  accountProfile: { config: accountProfileConfig, Component: AccountProfilePage },
  accountPlan: { config: accountPlanConfig, Component: AccountPlanPage },
  accountPostbacks: { config: accountPostbacksConfig, Component: AccountPostbacksPage },
  accountConnected: { config: accountConnectedConfig, Component: AccountConnectedPage },
  accountData: { config: accountDataConfig, Component: AccountDataPage },
  faq: faqPage,
  reviews: reviewsPage,
};
