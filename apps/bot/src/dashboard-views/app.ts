import { botPageHtml } from "../../../../shared/page-shell.js";
import { sideNav, pageHead } from "./shell.js";
import { overviewPanel } from "./pages/overview.js";
import { botsPanel } from "./pages/bots.js";
import { commandsPanel } from "./pages/commands.js";
import { offersPanel } from "./pages/offers.js";
import { broadcastsPanel } from "./pages/broadcasts.js";
import { dashClientScript } from "./client-script.js";

export function appHtml(
  user: { display_name: string; email: string; plan: string },
  publicBaseUrl: string,
  nonce?: string,
  page = "overview",
  nav?: string
): string {
  return botPageHtml({
    user,
    page,
    nonce,
    nav,
    content: `<main class="shell" id="main-content">
${sideNav(page, user)}
<div class="main"><div class="wrap">
  ${pageHead(page)}
  ${overviewPanel()}
  ${botsPanel()}
  ${commandsPanel()}
  ${offersPanel(publicBaseUrl)}
  ${broadcastsPanel()}
</div></div></main>
<div id="toast" class="hidden" role="status" aria-live="polite"></div>
${dashClientScript()}`,
  });
}
