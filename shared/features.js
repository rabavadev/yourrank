// Shared feature-flag lookup for leaderboard and bot Workers.
//
// Priority:
//   1. Per-user override (if present)
//   2. Environment variable `FF_<UPPER_KEY>=1` (or `=true`)
//   3. Global default from the feature_flags table
//   4. fallback default passed by the caller
import { one, query } from "./db.js";
const ENV_PREFIX = "FF_";
function envKey(key) {
    return ENV_PREFIX + key.replace(/[^a-zA-Z0-9_]/g, "_").toUpperCase();
}
function envValue(key) {
    if (typeof process === "undefined")
        return undefined;
    const raw = process.env?.[envKey(key)];
    if (raw === undefined)
        return undefined;
    return /^(1|true|yes|on)$/i.test(raw.trim());
}
/**
 * Check whether a feature is enabled for a user (or globally if userId is omitted).
 * Reads the feature default from the DB once per request and caches it on the
 * request/env object if provided.
 */
export async function isFeatureEnabled(key, userId, fallback = false) {
    const envOverride = envValue(key);
    if (envOverride !== undefined && userId == null) {
        // Environment override wins for global checks, but per-user override can still override.
    }
    if (userId) {
        const override = await one(`SELECT enabled FROM user_feature_overrides WHERE user_id = $1 AND feature_key = $2`, [userId, key]);
        if (override)
            return override.enabled;
    }
    if (envOverride !== undefined)
        return envOverride;
    const row = await one(`SELECT default_value FROM feature_flags WHERE key = $1`, [key]);
    return row?.default_value ?? fallback;
}
/** List all defined feature flags with their current defaults. */
export async function listFeatureFlags() {
    const rows = await query(`SELECT key, name, description, default_value AS "defaultValue" FROM feature_flags ORDER BY name`);
    return rows;
}
/** Return the set of feature keys enabled for a user (or globally when userId is omitted). */
export async function getEnabledFeatureKeys(userId) {
    const flags = await listFeatureFlags();
    const enabled = [];
    for (const flag of flags) {
        if (await isFeatureEnabled(flag.key, userId, flag.defaultValue)) {
            enabled.push(flag.key);
        }
    }
    return enabled;
}
/** Upsert a feature flag. Used by admin tooling. */
export async function setFeatureFlag(key, values) {
    const row = await one(`INSERT INTO feature_flags (key, name, description, default_value)
     VALUES ($1, $2, $3, COALESCE($4, false))
     ON CONFLICT (key) DO UPDATE
       SET name = COALESCE(EXCLUDED.name, feature_flags.name),
           description = COALESCE(EXCLUDED.description, feature_flags.description),
           default_value = COALESCE(EXCLUDED.default_value, feature_flags.default_value),
           updated_at = now()
     RETURNING key, name, description, default_value AS "defaultValue"`, [key, values.name ?? key, values.description ?? null, values.defaultValue]);
    if (!row)
        throw new Error("Failed to upsert feature flag");
    return row;
}
/** Set or clear a per-user override. enabled=null removes the override. */
export async function setUserFeatureOverride(userId, featureKey, enabled) {
    if (enabled === null) {
        await query(`DELETE FROM user_feature_overrides WHERE user_id = $1 AND feature_key = $2`, [userId, featureKey]);
        return;
    }
    await query(`INSERT INTO user_feature_overrides (user_id, feature_key, enabled)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, feature_key) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now()`, [userId, featureKey, enabled]);
}
