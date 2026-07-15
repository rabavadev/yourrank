// Billing handlers: trial activation
import { requireUser, json, bad } from "../auth.js";
import { activatePro, effectivePlan } from "../billing.js";
import { exec } from "../../../../shared/db.js";

// POST /api/billing/trial — start a free 7-day Pro trial (one-time per user).
export async function handleTrial(request, env) {
  try {
    const { user, res } = await requireUser(request, env);
    if (res) return res;
    if (user.status === "suspended") return bad("This account is suspended.", 403);

    // Gate: one trial ever
    if (user.has_trial) return bad("You've already used your free trial.", 400);

    // Don't allow trial if already on a paid plan
    const current = effectivePlan(user);
    if (current !== "free") return bad("You're already on a paid plan.", 400);

    // PROD-006-v8: Atomic has_trial flip — UPDATE ... WHERE has_trial=FALSE
    // prevents concurrent double-grant (race condition where two requests
    // both pass the has_trial check before either writes).
    const { rowCount } = await exec("UPDATE users SET has_trial=TRUE, updated_at=now() WHERE id=$1 AND has_trial=FALSE", [user.id]);
    if (rowCount === 0) return bad("You've already used your free trial.", 400);

    // Activate 7-day Pro trial
    await activatePro(env, user.id, 7, { provider: "trial" });

    // Calculate expiry for the response
    const expiresMs = Date.now() + 7 * 86400000;
    const expiresAt = new Date(expiresMs).toISOString();

    return json({ ok: true, expiresAt, days: 7 });
  } catch (e) {
    console.error("trial failed:", String(e?.message || e));
    return bad("Couldn't start trial. Try again.", 500);
  }
}
