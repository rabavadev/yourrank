// Route table: maps HTTP paths and methods to handler functions
// This centralizes routing logic and separates it from handler implementations

// withHandler wraps every route in a safety-net try/catch so an unexpected
// throw never kills the Worker invocation without a response.
import { withHandler } from "./middleware/handler.js";

import {
  handleSignup, handleLogin, handleLogout, handleMe, handleForgot, handleReset
} from "./handlers/auth.js";
import {
  handleStats, handleHeatmap, handleTrackCopy, handleGetSite, handleListBoards,
  handleCreateBoard, handleArchive, handleArchiveDelete, handlePutSite,
  handleNotifyTest, handleDomainVerify
} from "./handlers/sites.js";
import { handleTrial } from "./handlers/billing.js";
import { handleLead } from "./handlers/leads.js";
import { handleBotConnect } from "./handlers/bot.js";
import { handleScores } from "./handlers/scores.js";
import { handleCheckout, handleCheckoutLifetime, handleIpn } from "./billing.js";
import {
  handleOverview, handleUsers, handleLeads, handlePayments, handleAction,
  handle2faEnable, handle2faVerify, handle2faStatus, handle2faDisable
} from "./admin.js";
import {
  handlePublicStandings, handlePublicPlayers, handlePublicRank, handlePublicData
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
  
  // Site routes
  { path: "/api/site", method: "GET", handler: withHandler(handleGetSite) },
  { path: "/api/site", method: "PUT", handler: withHandler(handlePutSite) },
  { path: "/api/site/list", method: "GET", handler: withHandler(handleListBoards) },
  { path: "/api/site/create", method: "POST", handler: withHandler(handleCreateBoard) },
  { path: "/api/site/archive", method: "POST", handler: withHandler(handleArchive) },
  { path: "/api/site/archive/delete", method: "POST", handler: withHandler(handleArchiveDelete) },
  { path: "/api/site/stats", method: "GET", handler: withHandler(handleStats) },
  { path: "/api/site/stats/heatmap", method: "GET", handler: withHandler(handleHeatmap) },
  { path: "/api/site/notify/test", method: "POST", handler: withHandler(handleNotifyTest) },
  { path: "/api/site/domain/verify", method: "POST", handler: withHandler(handleDomainVerify) },
  
  // Public routes (CSRF-exempt)
  { path: "/api/lead", method: "POST", handler: withHandler(handleLead) },
  { path: "/api/track/copy", method: "POST", handler: withHandler(handleTrackCopy) },
  { path: "/api/scores", method: "POST", handler: withHandler(handleScores) },
  
  // Public API routes (CSRF-exempt)
  { path: "/api/public/:slug/standings", method: "GET", handler: withHandler(handlePublicStandings) },
  { path: "/api/public/:slug/players", method: "GET", handler: withHandler(handlePublicPlayers) },
  { path: "/api/public/:slug/rank", method: "GET", handler: withHandler(handlePublicRank) },
  { path: "/api/public/:slug", method: "GET", handler: withHandler(handlePublicData) },
  
  // Billing routes
  { path: "/api/billing/checkout", method: "POST", handler: withHandler(handleCheckout) },
  { path: "/api/billing/checkout-lifetime", method: "POST", handler: withHandler(handleCheckoutLifetime) },
  { path: "/api/billing/trial", method: "POST", handler: withHandler(handleTrial) },
  { path: "/api/billing/ipn", method: "POST", handler: withHandler(handleIpn) },
  
  // Bot routes
  { path: "/api/bot/connect", method: "POST", handler: withHandler(handleBotConnect) },
  
  // Admin routes
  { path: "/api/admin/overview", method: "GET", handler: withHandler(handleOverview) },
  { path: "/api/admin/users", method: "GET", handler: withHandler(handleUsers) },
  { path: "/api/admin/leads", method: "GET", handler: withHandler(handleLeads) },
  { path: "/api/admin/payments", method: "GET", handler: withHandler(handlePayments) },
  { path: "/api/admin/action", method: "POST", handler: withHandler(handleAction) },
  { path: "/api/admin/2fa/enable", method: "POST", handler: withHandler(handle2faEnable) },
  { path: "/api/admin/2fa/verify", method: "POST", handler: withHandler(handle2faVerify) },
  { path: "/api/admin/2fa/status", method: "GET", handler: withHandler(handle2faStatus) },
  { path: "/api/admin/2fa/disable", method: "POST", handler: withHandler(handle2faDisable) },
];

export function findRoute(path, method) {
  // First try exact match
  const exactMatch = ROUTES.find(route => route.path === path && route.method === method);
  if (exactMatch) return exactMatch;
  
  // Then try pattern matching for routes with :slug parameters
  const patternMatch = ROUTES.find(route => {
    if (route.method !== method) return false;
    const routePattern = route.path.replace(/:slug/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
  
  if (patternMatch) {
    // Extract the slug from the path
    const slug = path.match(/\/api\/public\/([^/]+)/)?.[1];
    return { ...patternMatch, slug };
  }
  
  return null;
}
