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
