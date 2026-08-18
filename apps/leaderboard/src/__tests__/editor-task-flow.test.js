import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const editorUx = readFileSync(new URL("../assets/dashboard/editor-ux.js", import.meta.url), "utf8");
const previewTabs = readFileSync(new URL("../assets/dashboard/preview-tabs.js", import.meta.url), "utf8");
const editorCss = readFileSync(new URL("../assets/editor-ux.css", import.meta.url), "utf8");

describe("task-first leaderboard editor", () => {
  it("boots the editor enhancement and styles from the existing preview controller", () => {
    expect(previewTabs).toContain('import { setupEditorWorkspace } from "./editor-ux.js"');
    expect(previewTabs).toContain("setupEditorWorkspace({ refreshPreview })");
    expect(editorUx).toContain('/assets/editor-ux.css?v=1');
  });

  it("keeps preview open for Look and optional for other editor tasks", () => {
    expect(editorUx).toContain('apply(group !== "design"');
    expect(editorUx).toContain('toggle.textContent = collapsed ? "Show preview" : "Hide preview"');
    expect(previewTabs).toContain("if (!previewIsCollapsed()) refreshPreview()");
    expect(editorCss).toContain('.design-grid[data-preview-collapsed="true"]');
  });

  it("turns Share into task-based progressive disclosure without replacing hooks", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/share" }).toString();
    for (const id of ["embedPublicLink", "embedObsUrl", "embedCodeBlock", "shareCards", "apiAccessDetails"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(editorUx).toContain("Share with viewers");
    expect(editorUx).toContain("On my stream");
    expect(editorUx).toContain("Put it on a website");
    expect(editorUx).toContain("OBS settings");
  });

  it("makes existing player rows read-first until Edit is used", () => {
    expect(editorUx).toContain("input.readOnly = !editing");
    expect(editorUx).toContain("input.tabIndex = editing ? 0 : -1");
    expect(editorUx).toContain("setPlayerRowEditing(row, !name.value.trim())");
    expect(editorCss).toContain('#playersTableWrap tbody tr:not(.is-editing) input[class*="p-"]');
    expect(editorCss).toContain("pointer-events: none");
  });

  it("removes technical preview sync noise while preserving the preview", () => {
    expect(editorUx).toContain("if (syncChip) syncChip.hidden = true");
    expect(editorUx).toContain("if (syncStrip) syncStrip.hidden = true");
    expect(PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design" }).toString()).toContain('id="designPreview"');
  });
});
