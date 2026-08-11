// Route table: maps HTTP paths and methods to handler functions.
// Consumed by router.js, which registers each entry on the Hono app.
// (:slug/:id are Hono path params, read via c.req.param() in router.js.)

// withHandler wraps every route in a safety-net try/catch so an unexpected
// throw never kills the Worker invocation without a response.
import { withHandler } from "./middleware/handler.js";

import {
  handleSignup, handleLogin, handleLogout, handleMe, handleForgot, handleReset,
  handleVerifyEmail, handleResendVerification, handleDemoLogin
} from "./handlers/auth.js";
import {
  handleChangePassword, handleListSessions, handleRevokeOtherSessions, handleExportData
} from "./handlers/security.js";
import {
  handleTelegramLink, handleTelegramUnlink, handleTelegramStatus
} from "./handlers/telegram-link.js";
import {
  handleStats, handleHeatmap, handleTrackCopy, handleTrackScroll, handleGetSite, handleListBoards,
  handleCreateBoard, handleDuplicateBoard, handleArchive, handleArchiveDelete, handleRestoreArchive, handlePutSite,
  handleFinishSetup, handlePutTheme, handleDeleteSite, handleSetActive, handleNotifyTest, handleDomainVerify, handleExportStats,
  handleExportPlayers
} from "./handlers/sites.js";
import { handleTrial } from "./handlers/billing.js";
import { handleReferrals } from "./handlers/referrals.js";
import { handleLead } from "./handlers/leads.js";
import { handleAttribution, handleAttributionExport, handlePostback, handleRotatePostbackKey, handleRevokePostbackKey } from "./handlers/attribution.js";
import {
  handleAccountPostbacks,
  handleAccountPostbacksRotate,
  handleAccountPostbacksRevoke,
  handleAccountPostbacksTest,
  handleAccountConversions,
  handleAccountConnectedAccounts,
} from "./handlers/account.js";
import { handleContact } from "./handlers/contact.js";
import { handleCspReport } from "./handlers/csp-report.js";
import { handleLog } from "./handlers/log.js";
import { handleScores } from "./handlers/scores.js";
import { handleQuickAdd } from "./handlers/quick-add.js";
import { handleKickWebhook } from "./handlers/kick-webhook.js";
import {
  handleKickAuthStart,
  handleKickAuthCallback,
  handleKickAuthDisconnect,
} from "./handlers/kick-auth.js";
import {
  handleCreditsStatus,
  handleCreditsConnect,
  handleCreditsSaveReward,
  handleCreditsCreateReward,
  handleCreditsDeleteReward,
  handleCreditsSaveShopItem,
  handleCreditsDeleteShopItem,
  handleCreditsUpdateRedemption,
  handleCreditsAnalytics,
  handleCreditsViewerHistory,
  handleCreditsAdjustBalance,
  handleCreditsReconcile,
  handlePublicCredits,
  handleCreditsViewerAuth,
} from "./handlers/credits.js";
import { handleCreditsBlockViewer } from "./handlers/credits-block.js";
import {
  handleKickViewerAuthStart,
  handleKickViewerAuthCallback,
  handleDiscordViewerAuthStart,
  handleDiscordViewerAuthCallback,
  handleViewerLogout,
} from "./handlers/viewer-auth.js";
import {
  handleViewerMe,
  handleViewerSite,
  handleViewerRedeem,
} from "./handlers/viewer-dashboard.js";
import {
  handleGamesConfig,
  handleGamesBet,
  handleGamesMinesReveal,
  handleGamesMinesCashout,
  handleGamesHistory,
  handleGamesFairness,
  handleGamesFairnessRotate,
} from "./handlers/games.js";
import { handleApiDocs, handleOpenApiJson } from "./handlers/docs.js";
import { handleCheckout, handleCheckoutLifetime, handleIpn, handleCancel, handleUserPayments, handlePendingPayment, handleAccountUsage } from "./billing.js";
import {
  handleOverview, handleUsers, handleLeads, handlePayments, handleAction,
  handleSupportMessages, handleSupportReply, handleAudit,
  handle2faEnable, handle2faVerify, handle2faRecovery, handle2faStatus, handle2faDisable,
  handleFeatureFlags, handleFeatureFlagOverride,
  handleGetIdentity, handleUpdateIdentity
} from "./admin.js";
import {
  handleBackupHealth, handleRecordBackupVerification, handleListBackupVerifications
} from "./handlers/backup.js";
import {
  handlePublicStandings, handlePublicPlayers, handlePublicStream, handlePublicRank, handlePublicData, handlePublicStats
} from "./handlers/public.js";

export const ROUTES = [
  // Auth routes (CSRF-exempt: callers may not have a CSRF cookie yet)
  { path: "/auth/demo", method: "GET", handler: withHandler(handleDemoLogin) },
  { path: "/api/auth/signup", method: "POST", handler: withHandler(handleSignup) },
  { path: "/api/auth/login", method: "POST", handler: withHandler(handleLogin) },
  { path: "/api/auth/me", method: "GET", handler: withHandler(handleMe) },
  { path: "/api/auth/forgot", method: "POST", handler: withHandler(handleForgot) },
  { path: "/api/auth/reset", method: "POST", handler: withHandler(handleReset) },
  { path: "/api/auth/verify", method: "POST", handler: withHandler(handleVerifyEmail) },
  { path: "/api/auth/resend-verification", method: "POST", handler: withHandler(handleResendVerification) },
  
  // Authenticated auth routes (CSRF required)
  { path: "/api/auth/logout", method: "POST", handler: withHandler(handleLogout) },
  { path: "/api/auth/change-password", method: "POST", handler: withHandler(handleChangePassword) },
  { path: "/api/auth/sessions", method: "GET", handler: withHandler(handleListSessions) },
  { path: "/api/auth/sessions/revoke-others", method: "POST", handler: withHandler(handleRevokeOtherSessions) },

  // Data export
  { path: "/api/account/export", method: "GET", handler: withHandler(handleExportData) },
  
  // Telegram identity linking
  { path: "/api/auth/telegram/link", method: "POST", handler: withHandler(handleTelegramLink) },
  { path: "/api/auth/telegram/unlink", method: "POST", handler: withHandler(handleTelegramUnlink) },
  { path: "/api/auth/telegram/status", method: "GET", handler: withHandler(handleTelegramStatus) },
  
  // Site routes
  { path: "/api/site", method: "GET", handler: withHandler(handleGetSite) },
  { path: "/api/site", method: "PUT", handler: withHandler(handlePutSite) },
  { path: "/api/site/finish", method: "POST", handler: withHandler(handleFinishSetup) },
  { path: "/api/site/theme", method: "POST", handler: withHandler(handlePutTheme) },
  { path: "/api/site", method: "DELETE", handler: withHandler(handleDeleteSite) },
  { path: "/api/site/list", method: "GET", handler: withHandler(handleListBoards) },
  { path: "/api/site/create", method: "POST", handler: withHandler(handleCreateBoard) },
  { path: "/api/site/duplicate", method: "POST", handler: withHandler(handleDuplicateBoard) },
  { path: "/api/site/archive", method: "POST", handler: withHandler(handleArchive) },
  { path: "/api/sites/:id/quick-add", method: "POST", handler: withHandler(handleQuickAdd) },
  { path: "/api/site/archive/delete", method: "POST", handler: withHandler(handleArchiveDelete) },
  { path: "/api/site/archive/restore", method: "POST", handler: withHandler(handleRestoreArchive) },
  { path: "/api/site/active", method: "POST", handler: withHandler(handleSetActive) },
  { path: "/api/site/stats/export", method: "GET", handler: withHandler(handleExportStats) },
  { path: "/api/site/players/export", method: "GET", handler: withHandler(handleExportPlayers) },
  { path: "/api/site/stats", method: "GET", handler: withHandler(handleStats) },
  { path: "/api/site/stats/heatmap", method: "GET", handler: withHandler(handleHeatmap) },
  { path: "/api/site/notify/test", method: "POST", handler: withHandler(handleNotifyTest) },
  { path: "/api/site/domain/verify", method: "POST", handler: withHandler(handleDomainVerify) },
  
  // Public routes (CSRF-exempt)
  { path: "/api/lead", method: "POST", handler: withHandler(handleLead) },
  { path: "/api/contact", method: "POST", handler: withHandler(handleContact) },
  { path: "/api/track/copy", method: "POST", handler: withHandler(handleTrackCopy) },
  { path: "/api/track/scroll", method: "POST", handler: withHandler(handleTrackScroll) },
  { path: "/api/scores", method: "POST", handler: withHandler(handleScores) },
  
  // Kick integration webhooks (CSRF-exempt)
  { path: "/webhooks/kick", method: "POST", handler: withHandler(handleKickWebhook) },

  // Kick OAuth
  { path: "/auth/kick", method: "GET", handler: withHandler(handleKickAuthStart) },
  { path: "/auth/kick/callback", method: "GET", handler: withHandler(handleKickAuthCallback) },
  { path: "/api/kick/disconnect", method: "POST", handler: withHandler(handleKickAuthDisconnect) },

  // Credits / shop dashboard API
  { path: "/api/credits/status", method: "GET", handler: withHandler(handleCreditsStatus) },
  { path: "/api/credits/connect", method: "POST", handler: withHandler(handleCreditsConnect) },
  { path: "/api/credits/rewards/create", method: "POST", handler: withHandler(handleCreditsCreateReward) },
  { path: "/api/credits/rewards", method: "POST", handler: withHandler(handleCreditsSaveReward) },
  { path: "/api/credits/rewards/:id", method: "DELETE", handler: withHandler(handleCreditsDeleteReward) },
  { path: "/api/credits/shop", method: "POST", handler: withHandler(handleCreditsSaveShopItem) },
  { path: "/api/credits/shop/:id", method: "DELETE", handler: withHandler(handleCreditsDeleteShopItem) },
  { path: "/api/credits/redemptions/:id", method: "POST", handler: withHandler(handleCreditsUpdateRedemption) },
  { path: "/api/credits/analytics", method: "GET", handler: withHandler(handleCreditsAnalytics) },
  { path: "/api/credits/viewer/history", method: "GET", handler: withHandler(handleCreditsViewerHistory) },
  { path: "/api/credits/viewers/:id/balance", method: "POST", handler: withHandler(handleCreditsAdjustBalance) },
  { path: "/api/credits/reconcile", method: "GET", handler: withHandler(handleCreditsReconcile) },
  { path: "/api/credits/viewers/:id/block", method: "POST", handler: withHandler(handleCreditsBlockViewer) },

  // Public credits / shop API (CSRF-exempt, read-only balance lookup)
  { path: "/api/public/credits", method: "GET", handler: withHandler(handlePublicCredits) },

  // Viewer auth (Kick / Discord)
  { path: "/api/viewer/auth/kick", method: "GET", handler: withHandler(handleKickViewerAuthStart) },
  { path: "/api/viewer/auth/kick/callback", method: "GET", handler: withHandler(handleKickViewerAuthCallback) },
  { path: "/api/viewer/auth/discord", method: "GET", handler: withHandler(handleDiscordViewerAuthStart) },
  { path: "/api/viewer/auth/discord/callback", method: "GET", handler: withHandler(handleDiscordViewerAuthCallback) },
  { path: "/api/viewer/logout", method: "POST", handler: withHandler(handleViewerLogout) },

  // Viewer dashboard API
  { path: "/api/viewer/me", method: "GET", handler: withHandler(handleViewerMe) },
  { path: "/api/viewer/site", method: "GET", handler: withHandler(handleViewerSite) },
  { path: "/api/viewer/redeem", method: "POST", handler: withHandler(handleViewerRedeem) },

  // Streamer viewer-auth toggles
  { path: "/api/credits/viewer-auth", method: "POST", handler: withHandler(handleCreditsViewerAuth) },

  // Originals games (viewer-facing; POSTs are CSRF-protected by router.js)
  { path: "/api/games/config", method: "GET", handler: withHandler(handleGamesConfig) },
  { path: "/api/games/bet", method: "POST", handler: withHandler(handleGamesBet) },
  { path: "/api/games/mines/reveal", method: "POST", handler: withHandler(handleGamesMinesReveal) },
  { path: "/api/games/mines/cashout", method: "POST", handler: withHandler(handleGamesMinesCashout) },
  { path: "/api/games/history", method: "GET", handler: withHandler(handleGamesHistory) },
  { path: "/api/games/fairness", method: "GET", handler: withHandler(handleGamesFairness) },
  { path: "/api/games/fairness/rotate", method: "POST", handler: withHandler(handleGamesFairnessRotate) },

  // Public API routes (CSRF-exempt)
  { path: "/api/docs", method: "GET", handler: withHandler(handleApiDocs) },
  { path: "/api/openapi.json", method: "GET", handler: withHandler(handleOpenApiJson) },
  { path: "/api/public/:slug/standings", method: "GET", handler: withHandler(handlePublicStandings) },
  { path: "/api/public/:slug/players", method: "GET", handler: withHandler(handlePublicPlayers) },
  { path: "/api/public/:slug/stream", method: "GET", handler: withHandler(handlePublicStream) },
  { path: "/api/public/:slug/rank", method: "GET", handler: withHandler(handlePublicRank) },
  { path: "/api/public/:slug/stats", method: "GET", handler: withHandler(handlePublicStats) },
  { path: "/api/public/:slug", method: "GET", handler: withHandler(handlePublicData) },
  
  // Referrals
  { path: "/api/referrals", method: "GET", handler: withHandler(handleReferrals) },

  // Billing routes
  { path: "/api/billing/checkout", method: "POST", handler: withHandler(handleCheckout) },
  { path: "/api/billing/checkout-lifetime", method: "POST", handler: withHandler(handleCheckoutLifetime) },
  { path: "/api/billing/pending", method: "GET", handler: withHandler(handlePendingPayment) },
  { path: "/api/billing/trial", method: "POST", handler: withHandler(handleTrial) },
  { path: "/api/billing/cancel", method: "POST", handler: withHandler(handleCancel) },
  { path: "/api/account/payments", method: "GET", handler: withHandler(handleUserPayments) },
  { path: "/api/account/usage", method: "GET", handler: withHandler(handleAccountUsage) },
  { path: "/api/billing/ipn", method: "POST", handler: withHandler(handleIpn) },
  
  // Bot lifecycle is owned by the bot Worker; obsolete leaderboard routes removed (C-06).

  // Account
  { path: "/api/account/postbacks", method: "GET", handler: withHandler(handleAccountPostbacks) },
  { path: "/api/account/postbacks/rotate", method: "POST", handler: withHandler(handleAccountPostbacksRotate) },
  { path: "/api/account/postbacks", method: "DELETE", handler: withHandler(handleAccountPostbacksRevoke) },
  { path: "/api/account/postbacks/test", method: "POST", handler: withHandler(handleAccountPostbacksTest) },
  { path: "/api/account/conversions", method: "GET", handler: withHandler(handleAccountConversions) },
  { path: "/api/account/connected-accounts", method: "GET", handler: withHandler(handleAccountConnectedAccounts) },

  // Attribution
  { path: "/api/attribution", method: "GET", handler: withHandler(handleAttribution) },
  { path: "/api/attribution/export", method: "GET", handler: withHandler(handleAttributionExport) },
  { path: "/api/attribution/rotate-key", method: "POST", handler: withHandler(handleRotatePostbackKey) },
  { path: "/api/attribution/postback-key", method: "DELETE", handler: withHandler(handleRevokePostbackKey) },
  { path: "/api/postback", method: "POST", handler: withHandler(handlePostback) },
  
  // CSP violation reporting
  { path: "/api/csp-report", method: "POST", handler: withHandler(handleCspReport) },

  // Client-side error reporting
  { path: "/api/log", method: "POST", handler: withHandler(handleLog) },

  // Backup health (public canary for monitor)
  { path: "/api/health/backup", method: "GET", handler: withHandler(handleBackupHealth) },

  // Admin routes
  { path: "/api/admin/backup-verifications", method: "GET", handler: withHandler(handleListBackupVerifications) },
  { path: "/api/admin/backup-verifications", method: "POST", handler: withHandler(handleRecordBackupVerification) },
  { path: "/api/admin/overview", method: "GET", handler: withHandler(handleOverview) },
  { path: "/api/admin/users", method: "GET", handler: withHandler(handleUsers) },
  { path: "/api/admin/leads", method: "GET", handler: withHandler(handleLeads) },
  { path: "/api/admin/payments", method: "GET", handler: withHandler(handlePayments) },
  { path: "/api/admin/support", method: "GET", handler: withHandler(handleSupportMessages) },
  { path: "/api/admin/support/reply", method: "POST", handler: withHandler(handleSupportReply) },
  { path: "/api/admin/audit", method: "GET", handler: withHandler(handleAudit) },
  { path: "/api/admin/action", method: "POST", handler: withHandler(handleAction) },
  { path: "/api/admin/features", method: "GET", handler: withHandler(handleFeatureFlags) },
  { path: "/api/admin/features", method: "POST", handler: withHandler(handleFeatureFlags) },
  { path: "/api/admin/features/override", method: "POST", handler: withHandler(handleFeatureFlagOverride) },
  { path: "/api/admin/identity", method: "GET", handler: withHandler(handleGetIdentity) },
  { path: "/api/admin/identity", method: "PUT", handler: withHandler(handleUpdateIdentity) },
  { path: "/api/admin/2fa/enable", method: "POST", handler: withHandler(handle2faEnable) },
  { path: "/api/admin/2fa/verify", method: "POST", handler: withHandler(handle2faVerify) },
  { path: "/api/admin/2fa/recovery", method: "POST", handler: withHandler(handle2faRecovery) },
  { path: "/api/admin/2fa/status", method: "GET", handler: withHandler(handle2faStatus) },
  { path: "/api/admin/2fa/disable", method: "POST", handler: withHandler(handle2faDisable) },
];
