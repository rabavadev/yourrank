// Tests for the public contact/support endpoint.
import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock DB so contact handler doesn't need a real Postgres.
const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");

const mockExec = mock(() => Promise.resolve());

const dbMock = () => ({
  one: mock(() => Promise.resolve(null)),
  exec: mockExec,
  query: mock(() => Promise.resolve([])),
  getSql: () => null,
  withTransaction: async (fn) => fn({ one: () => Promise.resolve(null), exec: () => Promise.resolve(), query: () => Promise.resolve([]) }),
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);

import { handleContact } from "../handlers/contact.js";

function postReq(body) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockEnv = { RL_FAIL_OPEN: "true" }; // tests run without a KV backend

describe("handleContact", () => {
  beforeEach(() => {
    mockExec.mockClear();
  });

  it("stores a valid contact message and returns success", async () => {
    const res = await handleContact(postReq({ name: "Test", email: "test@example.com", message: "Hello, this is a message." }), mockEnv);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockExec).toHaveBeenCalled();
  });

  it("labels contextual feedback for the admin support inbox", async () => {
    const res = await handleContact(postReq({
      name: "Test",
      email: "test@example.com",
      kind: "feedback",
      context: "bot",
      subject: "Broadcast flow",
      message: "The broadcast flow needs a clearer confirmation.",
    }), mockEnv);
    expect(res.status).toBe(200);
    expect(mockExec.mock.calls[0][1][2]).toBe("[Feedback · Bot] Broadcast flow");
  });

  it("rejects unknown message types and contexts", async () => {
    const badType = await handleContact(postReq({
      name: "Test", email: "test@example.com", kind: "sales", message: "Please contact me about this."
    }), mockEnv);
    expect(badType.status).toBe(400);
    const badContext = await handleContact(postReq({
      name: "Test", email: "test@example.com", context: "admin", message: "Please contact me about this."
    }), mockEnv);
    expect(badContext.status).toBe(400);
  });

  it("rejects missing name", async () => {
    const res = await handleContact(postReq({ name: "", email: "test@example.com", message: "Hello there." }), mockEnv);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Name");
  });

  it("rejects invalid email", async () => {
    const res = await handleContact(postReq({ name: "Test", email: "not-an-email", message: "Hello there." }), mockEnv);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("email");
  });

  it("rejects messages that are too short", async () => {
    const res = await handleContact(postReq({ name: "Test", email: "test@example.com", message: "Hi" }), mockEnv);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Message");
  });
});
