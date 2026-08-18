import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const overview = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");
const boards = readFileSync(new URL("../assets/dashboard/boards.js", import.meta.url), "utf8");

describe("site workspace clarity", () => {
  it("keeps optional stream tools available without letting them dominate Overview", () => {
    expect(overview).toContain('title.textContent = "Stream tools"');
    expect(overview).toContain('summary.textContent = "Show stream tools"');
    expect(overview).toContain('button.textContent = "Copy OBS link"');
    expect(overview).toContain("Optional OBS browser sources for your stream.");
  });

  it("keeps top players read-only on Overview", () => {
    expect(overview).not.toContain("ov-quick-incs");
    expect(overview).not.toContain("ov-inc-btn");
    expect(overview).not.toContain("markDirty");
  });

  it("uses site language for current, published, and unpublished states", () => {
    expect(boards).toContain('board-table-badge">Current');
    expect(boards).toContain('b.published ? "Published" : "Unpublished"');
    expect(boards).toContain('opt.textContent = "No sites"');
    expect(boards).not.toContain('board-table-badge">editing');
    expect(boards).not.toContain('b.published ? "Published" : "Draft"');
  });

  it("keeps destructive site actions explicit", () => {
    expect(boards).toContain('showConfirmModal("Delete site"');
    expect(boards).toContain('showConfirmModal("Duplicate site"');
    expect(boards).toContain('$("status").textContent = "Site deleted."');
  });
});
