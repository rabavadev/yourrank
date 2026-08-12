import { query, exec } from "../../../shared/db.js";
import { logAudit } from "../../../shared/audit.js";

const PAGE_SIZE = 500;
const PART_SIZE = 8 * 1024 * 1024;
const EXPORT_VERSION = "account-export-v1";
const TABLES = [
  "exportedAt", "user", "sites", "players", "archives", "subscriptions",
  "payments", "sessions", "offers", "shortLinks", "conversions", "bots",
  "botCommands", "broadcasts", "botSubscribers", "postbackKeys",
  "featureOverrides", "onboardingEmails", "referralRewards", "auditLog",
  "adminAudit", "supportMessages", "siteStatsHourly", "siteReferrers",
];

class NdjsonWriter {
  constructor(bucket, key) {
    this.bucket = bucket;
    this.key = key;
    this.encoder = new TextEncoder();
    this.buffers = [];
    this.bytes = 0;
    this.parts = [];
    this.partNumber = 0;
    this.upload = null;
  }

  async start() {
    this.upload = await this.bucket.createMultipartUpload(this.key, {
      httpMetadata: { contentType: "application/x-ndjson; charset=utf-8" },
    });
  }

  async flush() {
    if (!this.bytes) return;
    const body = new Uint8Array(this.bytes);
    let offset = 0;
    for (const buffer of this.buffers) {
      body.set(buffer, offset);
      offset += buffer.byteLength;
    }
    const uploaded = await this.upload.uploadPart(++this.partNumber, body);
    this.parts.push(uploaded);
    this.buffers = [];
    this.bytes = 0;
  }

  async write(line) {
    const bytes = this.encoder.encode(line);
    for (let offset = 0; offset < bytes.byteLength;) {
      const length = Math.min(PART_SIZE - this.bytes, bytes.byteLength - offset);
      this.buffers.push(bytes.subarray(offset, offset + length));
      this.bytes += length;
      offset += length;
      if (this.bytes === PART_SIZE) await this.flush();
    }
  }

  async complete() {
    await this.flush();
    await this.upload.complete(this.parts);
  }

  async abort() {
    if (!this.upload) return;
    await this.upload.abort().catch(() => {});
  }
}

async function emitPages(writer, table, sql, params, key = "id", read = query) {
  let cursor = null;
  let count = 0;
  for (;;) {
    const pageSql = cursor
      ? `SELECT * FROM (${sql}) AS export_page WHERE ${key} > $${params.length + 1} ORDER BY ${key} ASC LIMIT ${PAGE_SIZE}`
      : `SELECT * FROM (${sql}) AS export_page ORDER BY ${key} ASC LIMIT ${PAGE_SIZE}`;
    const rows = await read(pageSql, cursor ? [...params, cursor] : params);
    for (const row of rows) {
      const artifactRow = table === "sessions" ? (({ token, ...safeRow }) => safeRow)(row) : row;
      await writer.write(JSON.stringify({ table, row: artifactRow }) + "\n");
      count++;
    }
    if (rows.length < PAGE_SIZE) return count;
    cursor = rows[rows.length - 1][key];
  }
}

async function emitTuplePages(writer, table, sql, params, keys, read = query) {
  let cursor = null;
  let count = 0;
  for (;;) {
    const pageSql = cursor
      ? `SELECT * FROM (${sql}) AS export_page WHERE (${keys.join(", ")}) > (${keys.map((_, i) => `$${params.length + i + 1}`).join(", ")}) ORDER BY ${keys.join(", ")} ASC LIMIT ${PAGE_SIZE}`
      : `SELECT * FROM (${sql}) AS export_page ORDER BY ${keys.join(", ")} ASC LIMIT ${PAGE_SIZE}`;
    const rows = await read(pageSql, cursor ? [...params, ...cursor] : params);
    for (const row of rows) {
      await writer.write(JSON.stringify({ table, row }) + "\n");
      count++;
    }
    if (rows.length < PAGE_SIZE) return count;
    cursor = keys.map((key) => rows[rows.length - 1][key]);
  }
}

async function collectIds(sql, params, key = "id", read = query) {
  const ids = [];
  let cursor = null;
  for (;;) {
    const pageSql = cursor
      ? `SELECT * FROM (${sql}) AS export_page WHERE ${key} > $${params.length + 1} ORDER BY ${key} ASC LIMIT ${PAGE_SIZE}`
      : `SELECT * FROM (${sql}) AS export_page ORDER BY ${key} ASC LIMIT ${PAGE_SIZE}`;
    const rows = await read(pageSql, cursor ? [...params, cursor] : params);
    ids.push(...rows.map((row) => row[key]));
    if (rows.length < PAGE_SIZE) return ids;
    cursor = rows[rows.length - 1][key];
  }
}

export async function processAccountExport(event, env, {
  queryImpl = query,
  execImpl = exec,
  logAuditImpl = logAudit,
} = {}) {
  const read = queryImpl;
  const write = execImpl;
  const { exportId, userId } = event;
  const key = `account-exports/${userId}/${exportId}.ndjson`;
  if (!env.ACCOUNT_EXPORTS) throw new Error("ACCOUNT_EXPORTS R2 binding is not configured");

  const claimed = await write(
    `UPDATE account_export_jobs SET status='processing', started_at=now(), error=NULL
       WHERE id=$1 AND user_id=$2
         AND (status='pending' OR (status='processing' AND started_at < now() - INTERVAL '15 minutes'))
         AND expires_at > now()
       RETURNING id`,
    [exportId, userId]
  );
  if (!claimed?.length) return;

  const writer = new NdjsonWriter(env.ACCOUNT_EXPORTS, key);
  try {
    const userCols = `id, email, display_name, telegram_user_id, telegram_username,
      telegram_id, telegram_linked_at, plan, plan_expires_at, status, is_admin, email_verified,
      created_at, updated_at, has_trial, failed_login_count, locked_until`;
    const userRows = await read(`SELECT ${userCols} FROM users WHERE id=$1`, [userId]);
    const siteIds = await collectIds("SELECT id FROM sites WHERE user_id=$1", [userId], "id", read);
    const offerIds = await collectIds("SELECT id FROM offers WHERE owner_id=$1", [userId], "id", read);
    const botIds = await collectIds("SELECT id FROM bots WHERE owner_id=$1", [userId], "id", read);
    const count = async (table, where, params) => Number((await read(`SELECT COUNT(*)::bigint AS count FROM ${table} WHERE ${where}`, params))[0]?.count || 0);
    const siteFilter = siteIds.length ? "site_id = ANY($1)" : "false";
    const counts = {
      exportedAt: 1,
      user: userRows.length,
      sites: siteIds.length,
      players: await count("players", siteFilter, [siteIds]),
      archives: await count("archives", siteFilter, [siteIds]),
      subscriptions: await count("subscriptions", "user_id=$1", [userId]),
      payments: await count("payments", "user_id=$1", [userId]),
      sessions: await count("sessions", "user_id=$1", [userId]),
      offers: offerIds.length,
      shortLinks: offerIds.length ? await count("short_links", "offer_id = ANY($1)", [offerIds]) : 0,
      conversions: await count("conversions", "owner_id=$1", [userId]),
      bots: botIds.length,
      botCommands: botIds.length ? await count("bot_commands", "bot_id = ANY($1)", [botIds]) : 0,
      broadcasts: botIds.length ? await count("broadcasts", "bot_id = ANY($1)", [botIds]) : 0,
      botSubscribers: botIds.length ? await count("bot_subscribers", "bot_id = ANY($1)", [botIds]) : 0,
      postbackKeys: await count("postback_keys", "user_id=$1", [userId]),
      featureOverrides: await count("user_feature_overrides", "user_id=$1", [userId]),
      onboardingEmails: await count("user_onboarding_emails", "user_id=$1", [userId]),
      referralRewards: await count("referral_rewards", "(referrer_id=$1 OR referred_id=$1)", [userId]),
      auditLog: await count("audit_log", "actor_id=$1", [userId]),
      adminAudit: await count("admin_audit", "(admin_id=$1 OR target_user_id=$1)", [userId]),
      supportMessages: await count("support_messages", "user_id=$1", [userId]),
      siteStatsHourly: siteIds.length ? await count("site_stats_hourly", "site_id = ANY($1)", [siteIds]) : 0,
      siteReferrers: siteIds.length ? await count("site_referrers", "site_id = ANY($1)", [siteIds]) : 0,
    };
    await writer.start();
    const actualCounts = { exportedAt: 1, user: userRows.length };
    await writer.write(JSON.stringify({
      manifest: {
        exportId, userId, exportVersion: EXPORT_VERSION,
        generatedAt: new Date().toISOString(), tables: TABLES, rowCounts: counts,
      },
    }) + "\n");
    for (const row of userRows) await writer.write(JSON.stringify({ table: "user", row }) + "\n");
    actualCounts.sites = await emitPages(writer, "sites", `SELECT id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at,
      reset_note, blurb, extra_json, published, theme_json, updated_at, custom_domain,
      domain_status, suspended, telegram_chat_id, telegram_notify
      FROM sites WHERE user_id=$1`, [userId], "id", read);

    actualCounts.players = await emitPages(writer, "players", "SELECT * FROM players WHERE " + siteFilter, [siteIds], "id", read);
    actualCounts.archives = await emitPages(writer, "archives", "SELECT * FROM archives WHERE " + siteFilter, [siteIds], "id", read);

    const accountSpecs = [
      ["subscriptions", "SELECT id, plan, status, provider, current_period_end, created_at FROM subscriptions WHERE user_id=$1", "id"],
      ["payments", "SELECT id, subscription_id, provider, invoice_id, amount, currency, tx_ref, status, created_at, updated_at, plan_tier FROM payments WHERE user_id=$1", "id"],
      ["sessions", "SELECT token, created_at, expires_at, twofa_verified FROM sessions WHERE user_id=$1", "token"],
      ["offers", "SELECT id, casino_id, label, referral_url, promo_code, bonus_text, priority, is_active, created_at, updated_at FROM offers WHERE owner_id=$1", "id"],
      ["conversions", "SELECT id, offer_id, click_ref, event, amount, currency, raw, ts FROM conversions WHERE owner_id=$1", "id"],
      ["bots", "SELECT id, tg_bot_id, username, token_hint, status, welcome_message, created_at, updated_at FROM bots WHERE owner_id=$1", "id"],
      ["postbackKeys", "SELECT id, label, key_hash, created_at, revoked_at, expires_at, last_used_at FROM postback_keys WHERE user_id=$1", "id"],
      ["featureOverrides", "SELECT feature_key, enabled, created_at, updated_at FROM user_feature_overrides WHERE user_id=$1", "feature_key"],
      ["onboardingEmails", "SELECT id, day, sent_at FROM user_onboarding_emails WHERE user_id=$1", "id"],
      ["referralRewards", "SELECT id, referrer_id, referred_id, reward_days, created_at FROM referral_rewards WHERE referrer_id=$1 OR referred_id=$1", "id"],
      ["auditLog", "SELECT id, action, entity_type, entity_id, details, ip_address, user_agent, created_at FROM audit_log WHERE actor_id=$1", "id"],
      ["adminAudit", "SELECT id, admin_id, target_user_id, action, details, ip_address, user_agent, created_at FROM admin_audit WHERE admin_id=$1 OR target_user_id=$1", "id"],
      ["supportMessages", "SELECT id, name, email, subject, message, status, ip_hash, created_at, updated_at FROM support_messages WHERE user_id=$1", "id"],
    ];
    for (const [table, sql, key] of accountSpecs) actualCounts[table] = await emitPages(writer, table, sql, [userId], key, read);

    actualCounts.shortLinks = offerIds.length
      ? await emitPages(writer, "shortLinks", "SELECT sl.id, sl.offer_id, sl.slug, sl.source, sl.created_at FROM short_links sl WHERE sl.offer_id = ANY($1)", [offerIds], "id", read)
      : 0;
    actualCounts.botCommands = 0;
    actualCounts.broadcasts = 0;
    actualCounts.botSubscribers = 0;
    if (botIds.length) {
      actualCounts.botCommands = await emitPages(writer, "botCommands", "SELECT id, bot_id, command, response, offer_id, is_enabled FROM bot_commands WHERE bot_id = ANY($1)", [botIds], "id", read);
      actualCounts.broadcasts = await emitPages(writer, "broadcasts", "SELECT id, bot_id, status, body, media_url, buttons, scheduled_at, sent_at, total_count, sent_count, fail_count, segment, created_at FROM broadcasts WHERE bot_id = ANY($1)", [botIds], "id", read);
      actualCounts.botSubscribers = await emitPages(writer, "botSubscribers", "SELECT id, bot_id, tg_user_id, tg_username, first_name, language, is_blocked, first_seen, last_seen FROM bot_subscribers WHERE bot_id = ANY($1)", [botIds], "id", read);
    }
    actualCounts.siteStatsHourly = 0;
    actualCounts.siteReferrers = 0;
    if (siteIds.length) {
      actualCounts.siteStatsHourly = await emitTuplePages(writer, "siteStatsHourly", "SELECT site_id, day, hour, day_of_week, views FROM site_stats_hourly WHERE site_id = ANY($1)", [siteIds], ["site_id", "day", "hour"], read);
      actualCounts.siteReferrers = await emitTuplePages(writer, "siteReferrers", "SELECT site_id, day, domain, count FROM site_referrers WHERE site_id = ANY($1)", [siteIds], ["site_id", "day", "domain"], read);
    }

    await writer.write(JSON.stringify({
      trailer: {
        exportId, exportVersion: EXPORT_VERSION, complete: true, rowCounts: actualCounts,
      },
    }) + "\n");
    await writer.complete();
    const manifest = { exportId, userId, exportVersion: EXPORT_VERSION, generatedAt: new Date().toISOString(), tables: TABLES, rowCounts: counts };
    await write(
      `UPDATE account_export_jobs SET status='completed', artifact_key=$1, manifest=$2::jsonb, completed_at=now()
         WHERE id=$3 AND user_id=$4`,
      [key, manifest, exportId, userId]
    );
    await logAuditImpl({ actorId: userId, action: "account_export_completed", entityType: "account_export", entityId: exportId, details: { export_id: exportId, status: "completed" } });
  } catch (error) {
    console.error("account export failed:", String(error?.message || error));
    await writer.abort();
    await write(
      `UPDATE account_export_jobs SET status='failed', error=$1, completed_at=now()
         WHERE id=$2 AND user_id=$3`,
      [String(error?.message || error).slice(0, 500), exportId, userId]
    ).catch(() => {});
    await logAuditImpl({ actorId: userId, action: "account_export_failed", entityType: "account_export", entityId: exportId, details: { export_id: exportId, status: "failed" } });
  }
}
