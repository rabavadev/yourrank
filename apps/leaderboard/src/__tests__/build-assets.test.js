import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { hasBareImport } from "../../build-assets.js";

const assetBundle = readFileSync(new URL("../assets_bundled.js", import.meta.url), "utf8");

describe("dashboard asset bundling", () => {
  it("detects bare imports while leaving relative asset imports unbundled", () => {
    expect(hasBareImport('import { navOwner } from "@yourrank/shared/dashboard-nav";')).toBe(true);
    expect(hasBareImport('import { esc } from "./utils.js";')).toBe(false);
  });

  it("does not ship unresolved shared-package imports to the browser", () => {
    expect(assetBundle).not.toContain("@yourrank/shared/dashboard-nav");
  });
});
