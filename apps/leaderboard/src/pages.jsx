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
import { contactPage } from "./pages/contact.js";
import { pricingPage } from "./pages/pricing.js";
import { docsPage } from "./pages/docs.js";
import { verifyEmailPage } from "./pages/verify-email.js";
import {
  RewardsChannelPage,
  RewardsRewardsPage,
  RewardsMapsPage,
  RewardsShopPage,
  RewardsViewersPage,
  RewardsRedemptionsPage,
  RewardsHistoryPage,
} from "./pages/rewards.jsx";
import {
  rewardsChannelConfig,
  rewardsRewardsConfig,
  rewardsMapsConfig,
  rewardsShopConfig,
  rewardsViewersConfig,
  rewardsRedemptionsConfig,
  rewardsHistoryConfig,
} from "./pages/rewards.jsx";
import { accountPage } from "./pages/account.js";
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
  contact: contactPage,
  pricing: pricingPage,
  verifyEmail: verifyEmailPage,
  rewardsChannel: { config: rewardsChannelConfig, Component: RewardsChannelPage },
  rewardsRewards: { config: rewardsRewardsConfig, Component: RewardsRewardsPage },
  rewardsMaps: { config: rewardsMapsConfig, Component: RewardsMapsPage },
  rewardsShop: { config: rewardsShopConfig, Component: RewardsShopPage },
  rewardsViewers: { config: rewardsViewersConfig, Component: RewardsViewersPage },
  rewardsRedemptions: { config: rewardsRedemptionsConfig, Component: RewardsRedemptionsPage },
  rewardsHistory: { config: rewardsHistoryConfig, Component: RewardsHistoryPage },
  account: accountPage,
  faq: faqPage,
  reviews: reviewsPage,
};
