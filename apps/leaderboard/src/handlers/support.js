// User support ticket endpoints.
import { ok, bad, currentUser, readJson } from "../auth.js";
import { query, one } from "../../../../shared/db.js";

const MAX_SUBJECT = 120;
const MAX_MESSAGE = 4000;

export async function handleListTickets(request, env) {
  const user = await currentUser(request, env);
  if (!user) return bad("Authentication required.", 401);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const [total, rows] = await Promise.all([
    one("SELECT COUNT(*)::int AS n FROM support_messages WHERE user_id = $1", [user.id]),
    query(
      `SELECT id, subject, message, status, reply,
              (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at,
              (EXTRACT(EPOCH FROM replied_at) * 1000)::double precision AS replied_at
         FROM support_messages
        WHERE user_id = $1
        ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [user.id, pageSize, offset]
    ),
  ]);
  return ok({ tickets: rows || [], page, pageSize, total: total?.n || 0 });
}

export async function handleGetTicket(request, env, ctx) {
  const user = await currentUser(request, env);
  if (!user) return bad("Authentication required.", 401);
  const id = ctx.slug;
  if (!id) return bad("Ticket ID required.", 400);
  const row = await one(
    `SELECT id, subject, message, status, reply,
            (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at,
            (EXTRACT(EPOCH FROM replied_at) * 1000)::double precision AS replied_at
       FROM support_messages
      WHERE id = $1 AND user_id = $2`,
    [id, user.id]
  );
  if (!row) return bad("Ticket not found.", 404);
  return ok({ ticket: row });
}

export async function handleCreateTicket(request, env) {
  const user = await currentUser(request, env);
  if (!user) return bad("Authentication required.", 401);
  const body = await readJson(request);
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();
  if (!subject || subject.length > MAX_SUBJECT) return bad("Subject is required (max 120 characters).", 400);
  if (!message || message.length < 10 || message.length > MAX_MESSAGE) return bad("Message must be between 10 and 4000 characters.", 400);
  const row = await one(
    `INSERT INTO support_messages (user_id, name, email, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, subject, status,
       (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at`,
    [user.id, user.display_name || user.email, user.email, subject, message]
  );
  return ok({ ticket: row });
}
