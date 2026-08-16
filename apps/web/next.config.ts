import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Local dev only: wire up Cloudflare bindings (e.g. HYPERDRIVE) for next dev.
// In production builds the adapter provides the context at runtime.
if (process.env.NODE_ENV !== "production") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
