// Route table: maps HTTP paths and methods to handler functions.
// Consumed by router.js, which registers each entry on the Hono app.
// (:slug/:id are Hono path params, read via c.req.param() in router.js.)

// withHandler wraps every route in a safety-net try/catch so an unexpected
// throw never kills the Worker invocation without a response.
import { withHandler } from "./middleware/handler.js";

import {
  handleSignup, handleLogin, handleLogout, handleMe, handleForgot, handleReset
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
import { handleContact } from "./handlers/contact.js";
import { handleListTickets, handleGetTicket, handleCreateTicket } from "./handlers/support.js";
import { handleCspReport } from "./handlers/csp-report.js";
import { handleLog } from "./handlers/log.js";
import { handleScores } from "./handlers/scores.js";
import { handleQuickAdd } from "./handlers/quick-add.js";
import { handleApiDocs, handleOpenApiJson } from "./handlers/docs.js";
import { handleCheckout, handleCheckoutLifetime, handleIpn, handleCancel } from "./billing.js";
import {
  handleOverview, handleUsers, handleLeads, handlePayments, handleAction,
  handleSupportMessages, handleSupportReply,
  handle2faEnable, handle2faVerify, handle2faRecovery, handle2faStatus, handle2faDisable,
  handleFeatureFlags, handleFeatureFlagOverride
} from "./admin.js";
import {
  handlePublicStandings, handlePublicPlayers, handlePublicStream, handlePublicRank, handlePublicData, handlePublicStats
} from "./handlers/public.js";

export const ROUTES = [
  // Auth routes (CSRF-exempt: callers may not have a CSRF cookie yet)
  { path: "/api/auth/signup", method: "POST", handler: withHandler(handleSignup) },
  { path: "/api/auth/login", method: "POST", handler: withHandler(handleLogin) },
  { path: "/api/auth/me", method: "GET", handler: withHandler(handleMe) },
  { path: "/api/auth/forgot", method: "POST", handler: withHandler(handleForgot) },
  { path: "/api/auth/reset", method: "POST", handler: withHandler(handleReset) },
  
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
  { path: "/api/support", method: "GET", handler: withHandler(handleListTickets) },
  { path: "/api/support", method: "POST", handler: withHandler(handleCreateTicket) },
  { path: "/api/support/:id", method: "GET", handler: withHandler(handleGetTicket) },
  { path: "/api/track/copy", method: "POST", handler: withHandler(handleTrackCopy) },
  { path: "/api/track/scroll", method: "POST", handler: withHandler(handleTrackScroll) },
  { path: "/api/scores", method: "POST", handler: withHandler(handleScores) },
  
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
  { path: "/api/billing/trial", method: "POST", handler: withHandler(handleTrial) },
  { path: "/api/billing/cancel", method: "POST", handler: withHandler(handleCancel) },
  { path: "/api/billing/ipn", method: "POST", handler: withHandler(handleIpn) },
  
  // Bot lifecycle is owned by the bot Worker; obsolete leaderboard routes removed (C-06).

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
  
  // Admin routes
  { path: "/api/admin/overview", method: "GET", handler: withHandler(handleOverview) },
  { path: "/api/admin/users", method: "GET", handler: withHandler(handleUsers) },
  { path: "/api/admin/leads", method: "GET", handler: withHandler(handleLeads) },
  { path: "/api/admin/payments", method: "GET", handler: withHandler(handlePayments) },
  { path: "/api/admin/support", method: "GET", handler: withHandler(handleSupportMessages) },
  { path: "/api/admin/support/reply", method: "POST", handler: withHandler(handleSupportReply) },
  { path: "/api/admin/action", method: "POST", handler: withHandler(handleAction) },
  { path: "/api/admin/features", method: "GET", handler: withHandler(handleFeatureFlags) },
  { path: "/api/admin/features", method: "POST", handler: withHandler(handleFeatureFlags) },
  { path: "/api/admin/features/override", method: "POST", handler: withHandler(handleFeatureFlagOverride) },
  { path: "/api/admin/2fa/enable", method: "POST", handler: withHandler(handle2faEnable) },
  { path: "/api/admin/2fa/verify", method: "POST", handler: withHandler(handle2faVerify) },
  { path: "/api/admin/2fa/recovery", method: "POST", handler: withHandler(handle2faRecovery) },
  { path: "/api/admin/2fa/status", method: "GET", handler: withHandler(handle2faStatus) },
  { path: "/api/admin/2fa/disable", method: "POST", handler: withHandler(handle2faDisable) },
];
