// Route table: maps HTTP paths and methods to handler functions
// This centralizes routing logic and separates it from handler implementations

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
  { path: "/api/auth/signup", method: "POST", handler: handleSignup },
  { path: "/api/auth/login", method: "POST", handler: handleLogin },
  { path: "/api/auth/me", method: "GET", handler: handleMe },
  { path: "/api/auth/forgot", method: "POST", handler: handleForgot },
  { path: "/api/auth/reset", method: "POST", handler: handleReset },
  
  // Authenticated auth routes (CSRF required)
  { path: "/api/auth/logout", method: "POST", handler: handleLogout },
  
  // Site routes
  { path: "/api/site", method: "GET", handler: handleGetSite },
  { path: "/api/site", method: "PUT", handler: handlePutSite },
  { path: "/api/site/list", method: "GET", handler: handleListBoards },
  { path: "/api/site/create", method: "POST", handler: handleCreateBoard },
  { path: "/api/site/archive", method: "POST", handler: handleArchive },
  { path: "/api/site/archive/delete", method: "POST", handler: handleArchiveDelete },
  { path: "/api/site/stats", method: "GET", handler: handleStats },
  { path: "/api/site/stats/heatmap", method: "GET", handler: handleHeatmap },
  { path: "/api/site/notify/test", method: "POST", handler: handleNotifyTest },
  { path: "/api/site/domain/verify", method: "POST", handler: handleDomainVerify },
  
  // Public routes (CSRF-exempt)
  { path: "/api/lead", method: "POST", handler: handleLead },
  { path: "/api/track/copy", method: "POST", handler: handleTrackCopy },
  { path: "/api/scores", method: "POST", handler: handleScores },
  
  // Public API routes (CSRF-exempt)
  { path: "/api/public/:slug/standings", method: "GET", handler: handlePublicStandings },
  { path: "/api/public/:slug/players", method: "GET", handler: handlePublicPlayers },
  { path: "/api/public/:slug/rank", method: "GET", handler: handlePublicRank },
  { path: "/api/public/:slug", method: "GET", handler: handlePublicData },
  
  // Billing routes
  { path: "/api/billing/checkout", method: "POST", handler: handleCheckout },
  { path: "/api/billing/checkout-lifetime", method: "POST", handler: handleCheckoutLifetime },
  { path: "/api/billing/trial", method: "POST", handler: handleTrial },
  { path: "/api/billing/ipn", method: "POST", handler: handleIpn },
  
  // Bot routes
  { path: "/api/bot/connect", method: "POST", handler: handleBotConnect },
  
  // Admin routes
  { path: "/api/admin/overview", method: "GET", handler: handleOverview },
  { path: "/api/admin/users", method: "GET", handler: handleUsers },
  { path: "/api/admin/leads", method: "GET", handler: handleLeads },
  { path: "/api/admin/payments", method: "GET", handler: handlePayments },
  { path: "/api/admin/action", method: "POST", handler: handleAction },
  { path: "/api/admin/2fa/enable", method: "POST", handler: handle2faEnable },
  { path: "/api/admin/2fa/verify", method: "POST", handler: handle2faVerify },
  { path: "/api/admin/2fa/status", method: "GET", handler: handle2faStatus },
  { path: "/api/admin/2fa/disable", method: "POST", handler: handle2faDisable },
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
