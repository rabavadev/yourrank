// Site handlers: get, put, list, create, archive, stats, heatmap, notifications, custom domain
import { requireUser, json, bad, ok, readJson, rateLimit, slugify, clientIp } from "../auth.js";
import { getByUser, getUserSite, getUserSiteById, getUserBoardsList, createBoard, duplicateBoard, createArchive, deleteArchive, deleteBoard, setActiveBoard, updateSiteTheme, invalidateSiteCache, invalidateUserCache, getBoardById, saveSite } from "../site.js";
import { bumpStat, getStats, getHeatmap, getTopReferrers } from "../stats.js";
import { effectivePlan, PLAN_LIMITS, BOARD_LIMITS } from "../billing.js";
import { templateCatalog } from "../templates/index.js";
import { one, exec, query } from "../../../../shared/db.js";
import { logAudit } from "../../../../shared/audit.js";
import { buildTop3Embed, sendDiscordWebhook, sendTelegramMessage } from "../../../../shared/notifications.js";
import { decryptToken, decrypt } from "../../../../shared/crypto.js";
import { PLATFORM_HOST } from "../constants.js";
import { invalidateCustomDomain } from "../middleware/custom-domain.js";

function getTokenEncKey() {
  const hex = (typeof process !== "undefined" && process.env?.TOKEN_ENC_KEY) || "";
  if (hex.length !== 64) throw new Error("TOKEN_ENC_KEY must be 64 hex characters (32 bytes)");
  return hex;
}

async function decryptCredential(blobHex) {
  if (!blobHex) return null;
  try { return await decrypt(blobHex, getTokenEncKey()); } catch { return blobHex; }
}
import { createQueueProducer } from "../../../../shared/queue-producer.js";

export async function handleStats(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  return json({ ok: true, stats: await getStats(env, site.id) });
}

export async function handleExportStats(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  const stats = await getStats(env, site.id);
  const rows = (stats?.days || []).map((d) => [d.day, d.views, d.copies, d.clicks].join(","));
  const csv = "Day,Views,Copies,Clicks\n" + rows.join("\n") + "\n";
  const summary = `Summary,Views,Copies,Clicks\nToday,${stats?.today?.views || 0},${stats?.today?.copies || 0},${stats?.today?.clicks || 0}\nLast 7 days,${stats?.last7?.views || 0},${stats?.last7?.copies || 0},${stats?.last7?.clicks || 0}\nLast 30 days,${stats?.last30?.views || 0},${stats?.last30?.copies || 0},${stats?.last30?.clicks || 0}\n`;
  return new Response(summary + csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": `attachment; filename=yourrank-stats-${site.slug}.csv`,
    },
  });
}

export async function handleExportPlayers(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  const rows = await query(
    "SELECT name, wagered, prize, score, hands, net_profit, win_rate, change FROM players WHERE site_id=$1 ORDER BY sort ASC",
    [site.id]
  );
  const header = "name,wagered,prize,score,hands,net_profit,win_rate,change\n";
  const body = (rows || []).map((p) => [
    JSON.stringify(String(p.name)),
    p.wagered,
    p.prize,
    p.score ?? "",
    p.hands ?? "",
    p.net_profit ?? "",
    p.win_rate ?? "",
    p.change ?? "",
  ].join(",")).join("\n") + (rows?.length ? "\n" : "");
  const csv = header + body;
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": `attachment; filename=yourrank-players-${site.slug}.csv`,
    },
  });
}

export async function handleHeatmap(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("no site", 404);
  const [heatmap, referrers] = await Promise.all([
    getHeatmap(env, site.id),
    getTopReferrers(env, site.id),
  ]);
  return json({ ok: true, heatmap, referrers });
}

export async function handleTrackCopy(request, env, ctx) {
  const ip = clientIp(request);
  if (!(await rateLimit(env, `copy:${ip}`, 60, 60)).ok) return json({ ok: false, error: "Too many requests." }, 429);
  const body = await readJson(request);
  const slug = slugify(body?.slug || "");
  if (!slug) return json({ ok: true });
  if (!(await rateLimit(env, `copy:${slug}:${ip}`, 20, 60)).ok) return json({ ok: false, error: "Too many requests." }, 429);
  const site = await one("SELECT id FROM sites WHERE slug=$1 AND published=true", [slug]);
  if (site) {
    const producer = createQueueProducer(
      env.EVENTS_QUEUE,
      async (event) => {
        if (event.type === "bump") {
          await bumpStat(event.siteId, event.field, event.referer);
        }
      }
    );
    const p = producer.send({ type: "bump", siteId: site.id, field: "copies", referer: null, timestamp: Date.now() });
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p);
    else p.catch((err) => { console.error("[trackCopy] copy enqueue failed:", err); });
  }
  return json({ ok: true });
}

export async function handleGetSite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const plan = effectivePlan(user);
  let s;
  if (siteId) {
    s = await getUserSiteById(env, user.id, siteId, plan);
  } else {
    s = await getUserSite(env, user.id, plan);
  }
  if (!s) return bad("No site for this account", 404);
  const boards = await getUserBoardsList(env, user.id);
  return json({ ok: true, slug: s.slug, published: s.published, plan: plan, data: s.data, socials: s.socials, notify: s.notify || {}, archives: s.archives, boards, siteId: s.id, customDomain: s.customDomain || "", domainStatus: s.domainStatus || "pending", templates: templateCatalog() });
}

export async function handleListBoards(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  const plan = effectivePlan(user);
  const boards = await getUserBoardsList(env, user.id);
  return json({ ok: true, boards, limits: { boards: BOARD_LIMITS[plan], players: PLAN_LIMITS[plan] }, plan });
}

export async function handleCreateBoard(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `createboard:${user.id}`, 5, 3600)).ok) return bad("Too many requests. Try again later.", 429);
  const body = await readJson(request);
  if (!body) return bad("Invalid request");
  let slug = slugify(body.slug || "");
  if (!slug) return bad("Enter a valid slug for the board URL.");
  const name = String(body.name || "").trim().slice(0, 80) || slug;
  const r = await createBoard(env, user.id, { slug, name, casino: body.casino, code: body.code }, request);
  return r.error
    ? json({ ok: false, error: r.error, code: r.code || "create_failed" }, 400)
    : json({ ok: true, id: r.id, slug: r.slug });
}

// POST /api/site/archive — { label?, clear: "wagers"|"players"|"none" }
export async function handleArchive(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `archive:${user.id}`, 10, 3600)).ok) return bad("Too many archive actions. Try again later.", 429);
  const body = (await readJson(request)) || {};
  const r = await createArchive(env, user.id, { label: body.label, clear: body.clear, siteId: body.siteId }, request);
  return r.error ? bad(r.error, 400) : json({ ok: true, label: r.label });
}

// POST /api/site/archive/delete — { id }
export async function handleArchiveDelete(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  const body = (await readJson(request)) || {};
  if (!body.id) return bad("id required");
  const site = await getByUser(env, user.id);
  const r = await deleteArchive(env, user.id, body.id);
  if (!r.error) {
    await logAudit({
      actorId: user.id,
      action: "archive_delete",
      entityType: "site",
      entityId: site?.id || body.id,
      request,
      details: { board_id: site?.id || null, board_slug: site?.slug || null, archive_id: body.id },
    });
  }
  return r.error ? bad(r.error, 400) : json({ ok: true });
}

export async function handlePutSite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  // BE-008: Rate-limit site saves (30 req/min per user) to prevent abuse.
  if (!(await rateLimit(env, `save-site:${user.id}`, 30, 60)).ok) return bad("Too many saves. Try again shortly.", 429);
  const payload = await readJson(request);
  if (!payload) return bad("Invalid request");
  const r = await saveSite(env, user, payload, payload.siteId || null, request);
  return r.error ? bad(r.error, 400) : json({ ok: true, updatedAt: r.updatedAt, slug: r.slug });
}

export async function handlePutTheme(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `save-theme:${user.id}`, 30, 60)).ok) return bad("Too many theme changes. Try again shortly.", 429);
  const payload = await readJson(request);
  if (!payload) return bad("Invalid request");
  const r = await updateSiteTheme(env, user, payload, request);
  return r.error ? bad(r.error, 400) : json({ ok: true, branding: r.branding });
}

// DELETE /api/site — { siteId }
export async function handleDeleteSite(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `delete-site:${user.id}`, 10, 60)).ok) return bad("Too many delete actions. Try again later.", 429);
  const body = await readJson(request);
  if (!body || !body.siteId) return bad("siteId required");
  const r = await deleteBoard(env, user.id, body.siteId, request);
  return r.error ? bad(r.error, 400) : json({ ok: true });
}

// POST /api/site/active — { siteId }
export async function handleSetActive(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `set-active:${user.id}`, 30, 60)).ok) return bad("Too many requests. Try again later.", 429);
  const body = await readJson(request);
  if (!body || !body.siteId) return bad("siteId required");
  const r = await setActiveBoard(env, user.id, body.siteId, request);
  return r.error ? bad(r.error, 400) : json({ ok: true });
}

// POST /api/site/duplicate — { siteId }
export async function handleDuplicateBoard(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (!(await rateLimit(env, `duplicate-board:${user.id}`, 10, 3600)).ok) return bad("Too many duplicate actions. Try again later.", 429);
  const body = await readJson(request);
  if (!body || !body.siteId) return bad("siteId required");
  const r = await duplicateBoard(env, user.id, body.siteId, request);
  return r.error ? bad(r.error, 400) : json({ ok: true, id: r.id, slug: r.slug });
}

// POST /api/site/notify/test — send a test Discord or Telegram notification.
export async function handleNotifyTest(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  if (effectivePlan(user) === "free") return bad("Notifications are a Pro feature. Upgrade to unlock.", 403);

  const body = await readJson(request);
  if (!body) return bad("Invalid request");
  const channel = String(body.channel || "").trim(); // "discord" or "telegram"

  const site = await getByUser(env, user.id);
  if (!site) return bad("No site found", 404);

  if (channel === "discord") {
    let webhookUrl = body.webhook_url ? String(body.webhook_url).trim() : null;
    if (!webhookUrl) {
      try { webhookUrl = await decryptCredential(site.discord_webhook_url_enc); } catch { webhookUrl = null; }
    }
    if (!webhookUrl) return bad("No Discord webhook URL configured.");
    if (!/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+/.test(webhookUrl) &&
        !/^https:\/\/discordapp\.com\/api\/webhooks\/\d+\/.+/.test(webhookUrl)) {
      return bad("That doesn't look like a valid Discord webhook URL.");
    }
    const embed = buildTop3Embed(site.name || "Your Site", "TestPlayer", 1, 99999);
    embed.title = "🧪 Test Notification";
    embed.description = "Your Discord webhook is set up correctly!";
    embed.fields.push({ name: "Status", value: "✅ Notifications are working.", inline: false });
    const result = await sendDiscordWebhook(webhookUrl, embed);
    return result.ok ? json({ ok: true, message: "Test message sent to Discord!" }) : bad(result.error || "Failed to send.", 502);
  }

  if (channel === "telegram") {
    const chatId = String(body.chat_id || site.telegram_chat_id || "").trim();
    if (!chatId) return bad("No Telegram chat ID configured.");
    // Find bot token — BUG-DB-008: bot_token doesn't exist on users. Tokens live in bots table (encrypted).
    const bot = await one("SELECT token_encrypted FROM bots WHERE owner_id=$1 AND status='active' ORDER BY created_at DESC LIMIT 1", [user.id]);
    if (!bot?.token_encrypted) return bad("No Telegram bot connected. Set up your bot first.");
    const botToken = await decryptToken(Buffer.from(bot.token_encrypted));
    const text = `🧪 *Test Notification*\n\nYour Telegram notifications for *${site.name || "Your Site"}* are working!`;
    const result = await sendTelegramMessage(botToken, chatId, text);
    return result.ok ? json({ ok: true, message: "Test message sent to Telegram!" }) : bad(result.error || "Failed to send.", 502);
  }

  return bad("Unknown channel. Use 'discord' or 'telegram'.");
}

// Verify that the domain has a CNAME record pointing to the platform host.
async function verifyCnameToYourrank(domain) {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=CNAME`,
      {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    const answers = Array.isArray(data?.Answer) ? data.Answer : [];
    return answers.some((a) => {
      if (a.type !== 5) return false;
      const target = String(a.data || "").toLowerCase().replace(/\.$/, "");
      return target === PLATFORM_HOST || target.endsWith(`.${PLATFORM_HOST}`);
    });
  } catch (e) {
    console.error("[domain] DNS lookup failed:", String(e?.message || e));
    return false;
  }
}

// POST /api/site/domain/verify — verify custom domain CNAME and provision TLS
// via Cloudflare for SaaS custom hostnames. Pro/Agency only.
export async function handleDomainVerify(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);
    const plan = effectivePlan(user);
    if (plan !== "pro" && plan !== "agency") return bad("Custom domains are a Pro feature.", 403);

    const body = await readJson(request);
    if (!body) return bad("Domain required");

    const siteId = body.siteId || null;
    const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
    if (!site) return bad("No site found", 404);

    const zoneId = env.CF_ZONE_ID;
    const cfToken = env.CF_API_TOKEN;

    // H-12: support explicit removal / replacement lifecycle.
    const remove = body.remove === true || body.remove === "true";
    const rawDomain = String(body.domain || "").trim().toLowerCase();
    if (remove || !rawDomain) {
      const existing = await one(
        "SELECT custom_hostname_id, custom_domain FROM sites WHERE id=$1",
        [site.id]
      );
      if (cfToken && existing?.custom_hostname_id) {
        try {
          await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${existing.custom_hostname_id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${cfToken}` },
              signal: AbortSignal.timeout(15000),
            }
          );
        } catch (e) {
          console.error("[domain] CF delete failed:", String(e?.message || e));
        }
      }
      await exec(
        "UPDATE sites SET custom_domain=NULL, custom_hostname_id=NULL, domain_status='pending', updated_at=now() WHERE id=$1",
        [site.id]
      );
      invalidateSiteCache(env, site.slug);
      invalidateUserCache(env, user.id);
      invalidateCustomDomain(existing?.custom_domain);
      return ok({ status: "removed", message: "Custom domain removed." });
    }

    const domain = rawDomain;
    // Basic domain validation
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domain)) {
      return bad("Invalid domain format.");
    }

    // Verify DNS CNAME before saving or provisioning.
    const hasCname = await verifyCnameToYourrank(domain);
    if (!hasCname) {
      return bad(`We couldn't find a CNAME record for this domain pointing to ${PLATFORM_HOST}. Add the CNAME first, then verify.`, 400);
    }

    if (!cfToken) {
      // Fallback: just save the domain without TLS provisioning
      await exec("UPDATE sites SET custom_domain=$1, custom_hostname_id=NULL, domain_status='pending', updated_at=now() WHERE id=$2", [domain, site.id]);
      invalidateSiteCache(env, site.slug);
      invalidateUserCache(env, user.id);
      invalidateCustomDomain(domain);
      return ok({ status: "saved", message: "Domain saved. TLS automation is not configured — contact support." });
    }

    // H-12: Read current domain state before deciding to reuse, replace, or create.
    const existing = await one(
      "SELECT custom_domain, custom_hostname_id, domain_status FROM sites WHERE id=$1",
      [site.id]
    );

    // If the exact same domain is already active, verify with CF and short-circuit.
    if (domain === existing?.custom_domain && existing?.domain_status === "active" && existing?.custom_hostname_id) {
      try {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${existing.custom_hostname_id}`,
          {
            headers: { "Authorization": `Bearer ${cfToken}`, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(15000),
          }
        );
        const cfData = await cfRes.json();
        if (cfData.success && cfData.result?.ssl?.status === "active") {
          return ok({ status: "active", message: "TLS is active on your custom domain." });
        }
      } catch (e) {
        console.error("[domain] CF status check failed:", String(e?.message || e));
      }
    }

    // If the domain is changing, detach the old hostname first.
    if (domain !== existing?.custom_domain && existing?.custom_hostname_id) {
      try {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames/${existing.custom_hostname_id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${cfToken}` },
            signal: AbortSignal.timeout(15000),
          }
        );
        if (!cfRes.ok) {
          console.warn("[domain] CF old-hostname delete returned non-2xx:", cfRes.status);
        }
      } catch (e) {
        console.error("[domain] CF old-hostname delete failed:", String(e?.message || e));
      }
    }

    // Create a new custom hostname via CF API
    let cfResult;
    try {
      const cfRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${cfToken}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            hostname: domain,
            ssl: { method: "http", type: "dv" },
          }),
        }
      );
      cfResult = await cfRes.json();
    } catch (e) {
      console.error("[domain] CF create failed:", String(e?.message || e));
      return bad("Failed to connect to Cloudflare. Try again.", 502);
    }

    if (!cfResult.success) {
      const errMsg = cfResult.errors?.[0]?.message || "Cloudflare API error";
      console.error("[domain] CF error:", errMsg);
      // Save domain even if CF fails, for manual resolution
      await exec("UPDATE sites SET custom_domain=$1, custom_hostname_id=NULL, domain_status='error', updated_at=now() WHERE id=$2", [domain, site.id]);
      invalidateSiteCache(env, site.slug);
      invalidateUserCache(env, user.id);
      invalidateCustomDomain(existing?.custom_domain, domain);
      return ok({ status: "error", message: errMsg });
    }

    const chId = cfResult.result?.id;
    const chStatus = cfResult.result?.ssl?.status || "pending";
    const dbStatus = chStatus === "active" ? "active" : "pending";

    // Save domain, custom_hostname_id, and status
    await exec(
      "UPDATE sites SET custom_domain=$1, custom_hostname_id=$2, domain_status=$3, updated_at=now() WHERE id=$4",
      [domain, chId, dbStatus, site.id]
    );

    invalidateSiteCache(env, site.slug);
    invalidateUserCache(env, user.id);
    invalidateCustomDomain(existing?.custom_domain, domain);

    return ok({
      status: dbStatus,
      customHostnameId: chId,
      message: dbStatus === "active"
        ? "TLS is active on your custom domain!"
        : `TLS provisioning started. Point a CNAME for your domain to ${PLATFORM_HOST}, then check back in a few minutes.`,
    });
  } catch (e) {
    console.error("[domain] verify failed:", String(e?.message || e));
    return bad("Domain verification failed. Try again.", 500);
  }
}
