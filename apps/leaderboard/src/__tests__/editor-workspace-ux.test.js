import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const editorUx = readFileSync(new URL("../assets/dashboard/editor-ux.js", import.meta.url), "utf8");
const previewTabs = readFileSync(new URL("../assets/dashboard/preview-tabs.js", import.meta.url), "utf8");
const editorCss = readFileSync(new URL("../assets/editor-ux.css", import.meta.url), "utf8");

describe("focused editor workspace", () => {
  it("boots the editor enhancement and its styles from the existing preview controller", () => {
    expect(previewTabs).toContain('import { setupEditorWorkspace } from "./editor-ux.js"');
    expect(previewTabs).toContain("setupEditorWorkspace({ refreshPreview })");
    expect(editorUx).toContain('/assets/editor-ux.css?v=1');
  });

  it("keeps the live preview optional outside Appearance", () => {
    expect(editorUx).toContain('apply(group !== "design"');
    expect(editorUx).toContain('toggle.textContent = collapsed ? "Show preview" : "Hide preview"');
    expect(editorUx).toContain('grid.dataset.previewCollapsed = collapsed ? "true" : "false"');
    expect(previewTabs).toContain("if (!previewIsCollapsed()) refreshPreview()");
    expect(editorCss).toContain('.design-grid[data-preview-collapsed="true"]');
    expect(editorCss).toContain("grid-template-columns: minmax(0, 1fr) !important");
  });

  it("turns Share into task-based progressive disclosure without replacing existing hooks", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/share" }).toString();
    for (const id of ["embedPublicLink", "embedObsUrl", "embedCodeBlock", "shareCards", "apiAccessDetails"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(editorUx).toContain("Share with viewers");
    expect(editorUx).toContain("On my stream");
    expect(editorUx).toContain("Put it on a website");
    expect(editorUx).toContain("OBS settings");
    expect(editorUx).toContain("Choose where you want your leaderboard to appear.");
  });

  it("makes existing player rows read-first until Edit is used", () => {
    expect(editorUx).toContain("input.readOnly = !editing");
    expect(editorUx).toContain("input.tabIndex = editing ? 0 : -1");
    expect(editorUx).toContain("setPlayerRowEditing(row, !name.value.trim())");
    expect(editorUx).toContain("setPlayerRowEditing(row, true)");
    expect(editorCss).toContain('#playersTableWrap tbody tr:not(.is-editing) input[class*="p-"]');
    expect(editorCss).toContain("pointer-events: none");
  });

  it("removes technical preview status noise while keeping the preview itself", () => {
    expect(editorUx).toContain("if (syncChip) syncChip.hidden = true");
    expect(editorUx).toContain("if (syncStrip) syncStrip.hidden = true");
    expect(editorUx).toContain('previewTitle.textContent = "Preview"');
    expect(PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design" }).toString()).toContain('id="designPreview"');
  });
});
