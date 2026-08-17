// Aggregator: per-page modules re-exported as PAGES

import { loginPage } from "./pages/login.jsx";
import { forgotPage } from "./pages/forgot.js";
import { resetPage } from "./pages/reset.js";
import { signupPage } from "./pages/signup.js";
import { dashboardPage } from "./pages/dashboard.jsx";
import { adminPage } from "./pages/admin.js";
import { admin2faPage } from "./pages/admin-2fa.js";
import { overlayPage } from "./pages/overlay.js";
import { termsPage } from "./pages/terms.js";
import { privacyPage } from "./pages/privacy.js";
import { responsiblePage } from "./pages/responsible.js";
import { refundPage } from "./pages/refund.js";
import { cookiesPage } from "./pages/cookies.js";
import { helpHubPage, helpSupportPage, helpFeedbackPage } from "./pages/help.js";
import { pricingPage } from "./pages/pricing.js";
import { docsPage } from "./pages/docs.js";
import {
  rewardsChannelPage,
  rewardsRulesPage,
  rewardsShopPage,
  rewardsViewersPage,
  rewardsRedemptionsPage,
  rewardsHistoryPage,
} from "./pages/rewards.jsx";
import { settingsUnifiedPage } from "./pages/account.jsx";
import { faqPage } from "./pages/faq.js";
import { reviewsPage } from "./pages/reviews.js";
import { invitePage } from "./pages/invite.jsx";
import { giveawaysPage } from "./pages/giveaways.jsx";

import {
  telegramOverviewRoute,
  telegramBotsRoute,
  telegramCommandsRoute,
  telegramOffersRoute,
  telegramBroadcastsRoute,
} from "./pages/telegram.jsx";

export const PAGES = {
  docs: docsPage,
  login: loginPage,
  forgot: forgotPage,
  reset: resetPage,
  signup: signupPage,
  dashboard: dashboardPage,
  giveaways: giveawaysPage,
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
  helpHub: helpHubPage,
  pricing: pricingPage,
  rewardsChannel: rewardsChannelPage,
  rewardsRules: rewardsRulesPage,
  rewardsShop: rewardsShopPage,
  rewardsViewers: rewardsViewersPage,
  rewardsRedemptions: rewardsRedemptionsPage,
  rewardsHistory: rewardsHistoryPage,
  telegramOverview: telegramOverviewRoute,
  telegramBots: telegramBotsRoute,
  telegramCommands: telegramCommandsRoute,
  telegramOffers: telegramOffersRoute,
  telegramBroadcasts: telegramBroadcastsRoute,
  settingsUnified: settingsUnifiedPage,
  faq: faqPage,
  reviews: reviewsPage,
  invite: invitePage,
};
