import { describe, expect, it } from "bun:test";

class FakeClassList {
  constructor() { this.values = new Set(); }
  add(...values) { values.forEach((value) => this.values.add(value)); }
  remove(...values) { values.forEach((value) => this.values.delete(value)); }
  toggle(value, force) {
    const next = force === undefined ? !this.values.has(value) : force;
    if (next) this.add(value); else this.remove(value);
    return next;
  }
}

class FakeElement {
  constructor() {
    this.attributes = {};
    this.classList = new FakeClassList();
    this.dataset = {};
    this.hidden = false;
    this.listeners = {};
    this.textContent = "";
    this.value = "";
    this.disabled = false;
  }
  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  contains(node) { return node === this; }
}

const elements = new Map();
const fakeDocument = {
  cookie: "",
  body: new FakeElement(),
  head: new FakeElement(),
  activeElement: null,
  getElementById(id) { return elements.get(id) || null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() { return new FakeElement(); },
};

function register(id) {
  const element = new FakeElement();
  element.id = id;
  elements.set(id, element);
  return element;
}

function installBrowserGlobals() {
  globalThis.document = fakeDocument;
  globalThis.window = {
    innerHeight: 900,
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    addEventListener() {},
    removeEventListener() {},
    open() {},
  };
  globalThis.navigator = {};
  globalThis.location = {
    href: "http://localhost/dashboard/leaderboard/players",
    origin: "http://localhost",
    pathname: "/dashboard/leaderboard/players",
    search: "",
  };
  globalThis.history = { pushState() {} };
  globalThis.requestAnimationFrame = (callback) => callback();
}

installBrowserGlobals();
const site = await import("../assets/dashboard/site.js");
const backendSite = await import("../site.js");
const { state } = await import("../assets/dashboard/state.js");

describe("dashboard save handler", () => {
  it("completes a successful save and sends only the editor payload", async () => {
    elements.clear();
    const save = register("save");
    const status = register("status");
    const publishAction = register("publishAction");
    state.ACTIVE_SITE_ID = "site-test";
    state.SITE_UPDATED_AT = "before";
    state.BOARDS = [];
    state.PUBLISHED = false;
    state.SAVED_PLAYERS = [];
    state._dirty = true;

    const requests = [];
    await site.saveEditorDraft({
      collectImpl: () => ({
        payload: { siteId: "site-test", players: [{ name: "Alice", wagered: 123, prize: 4 }] },
        invalid: [],
      }),
      fetchImpl: async (url, options) => {
        requests.push({ url, options });
        return new Response(JSON.stringify({ ok: true, updatedAt: "after" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/api/site");
    expect(JSON.parse(requests[0].options.body)).toEqual({
      siteId: "site-test",
      players: [{ name: "Alice", wagered: 123, prize: 4 }],
    });
    expect(save.disabled).toBe(false);
    expect(save.textContent).toBe("Save changes");
    expect(publishAction.disabled).toBe(false);
    expect(status.textContent).toBe("Saved");
    expect(state.SAVED_PLAYERS).toEqual([{ name: "Alice", wagered: 123, prize: 4 }]);
    expect(state.SITE_UPDATED_AT).toBe("after");
  });

  it("discards the whole editor draft before reloading the saved version", () => {
    state.ACTIVE_SITE_ID = "site-test";
    state._dirty = true;
    let reloaded = false;
    site.discardEditorChanges({ reload: () => { reloaded = true; } });
    expect(reloaded).toBe(true);
    expect(state._dirty).toBe(false);
  });
});

describe("leaderboard player rules", () => {
  it("rejects invalid numeric values with row and field details", () => {
    const result = backendSite.validatePlayerRows([
      { name: "Alice", wagered: "not-a-number" },
    ], "wagered");
    expect(result.code).toBe("invalid_player_field");
    expect(result.row).toBe(0);
    expect(result.field).toBe("wagered");
    expect(result.error).toContain("Alice");
    expect(result.error).toContain("wagered");
  });

  it("distinguishes omitted values from invalid values and computes score/change", () => {
    const result = backendSite.validatePlayerRows([
      { name: "Alice", wagered: 100 },
      { name: "Bob", wagered: 50, score: "", change: 7 },
    ], "wagered", [{ name: "Alice", rank: 2 }, { name: "Bob", rank: 1 }]);
    expect(result.players[0]).toMatchObject({ score: 100, netProfit: -100, change: 1 });
    expect(result.players[1]).toMatchObject({ score: 50, change: 7 });
  });

  it("uses competition ranks and score-based ranking", () => {
    const result = backendSite.validatePlayerRows([
      { name: "Alice", wagered: 1, score: 100 },
      { name: "Bob", wagered: 100, score: 100 },
      { name: "Cara", wagered: 50, score: 20 },
    ], "score");
    expect(result.players.map((p) => [p.name, p.rank])).toEqual([
      ["Alice", 1],
      ["Bob", 1],
      ["Cara", 3],
    ]);
  });

  it("uses the persisted rank field for plain and search reads", async () => {
    const queries = [];
    const rows = [
      { id: "a", name: "Alice", normalized_name: "alice", wagered: 1, score: 100, rank: 1 },
      { id: "b", name: "Bob", normalized_name: "bob", wagered: 100, score: 100, rank: 1 },
    ];
    const dependencies = {
      one: async (sql) => {
        expect(sql).toContain("rank_by");
        return { rank_by: "score" };
      },
      query: async (sql, params) => {
        queries.push({ sql, params });
        return rows;
      },
    };
    const plain = await backendSite.getPlayers({}, "site-test", {}, dependencies);
    const search = await backendSite.getPlayers({}, "site-test", { search: "bo" }, dependencies);
    expect(plain).toEqual(rows);
    expect(search).toEqual(rows);
    expect(queries[0].sql).toContain("RANK()");
    expect(queries[0].sql).toContain("score DESC");
    expect(queries[0].params[1]).toBe("");
    expect(queries[1].params[1]).toBe("bo");
  });

  it("creates new boards as drafts unless publication is explicit", async () => {
    const inserts = [];
    const tx = {
      one: async (sql) => sql.includes("FROM users") ? { plan: "free", status: "active" } : null,
      query: async () => [],
      unsafe: async (sql, params) => {
        if (sql.startsWith("INSERT INTO sites")) inserts.push(params);
        return [];
      },
    };
    await backendSite.createBoard({}, "user-test", { slug: `draft-${Date.now()}` }, null, tx);
    await backendSite.createBoard({}, "user-test", { slug: `live-${Date.now()}`, published: true, is_draft: false }, null, tx);
    expect(inserts[0][8]).toBe(false);
    expect(inserts[0][9]).toBe(true);
    expect(inserts[1][8]).toBe(true);
    expect(inserts[1][9]).toBe(false);
  });

  it("cleans subscriptions for removed players inside the supplied transaction", async () => {
    const statements = [];
    const tx = {
      query: async () => [{ name: "  Alice  " }],
      unsafe: async (sql, params) => statements.push({ sql, params }),
    };
    await backendSite.cleanupRemovedPlayerSubscriptions(tx, "site-test", ["bob"]);
    expect(statements).toHaveLength(1);
    expect(statements[0].sql).toContain("DELETE FROM player_subscriptions");
    expect(statements[0].params).toEqual(["site-test", ["alice"]]);
  });

  it("normalizes identity and truncates graphemes without splitting clusters", () => {
    const emojiName = "👩‍👩‍👧‍👦".repeat(81);
    const result = backendSite.validatePlayerRows([{ name: `  Alice   ` }, { name: emojiName }], "wagered");
    expect(result.players[0].normalizedName).toBe("alice");
    expect(Array.from(result.players[1].name).length).toBeGreaterThan(80);
    expect(result.players[1].name.endsWith("👩‍👩‍👧‍👦")).toBe(true);
  });
});
