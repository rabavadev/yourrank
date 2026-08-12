import { describe, it, expect } from "bun:test";
import { PAGES } from "../pages.jsx";
import { leaderboardPageHtml } from "../../../../shared/page-shell.js";
import { shellNavHtml, publicNavHtml } from "../../../../shared/shell-nav.js";

function render(pageKey, user) {
  const page = PAGES[pageKey];
  const html = leaderboardPageHtml({ ...page.config, content: page.Component({}).toString() });
  return html.replace(
    "<!--GM_NAV-->",
    user
      ? shellNavHtml({ activePath: "/help/support", user, accountHref: "/account/profile" })
      : publicNavHtml({ activePath: "/help/support" })
  );
}

const user = { display_name: "Streamer One", email: "streamer@example.com", plan: "pro" };

describe("help pages", () => {
  it("renders the operator help hub in both shells", () => {
    const signedIn = render("helpHub", user);
    const signedOut = render("helpHub", null);
    for (const html of [signedIn, signedOut]) {
      expect(html).toContain("Operator help");
      expect(html).toContain('href="/help/support"');
      expect(html).toContain('href="/help/feedback"');
      expect(html).toContain('href="/dashboard/rewards/rules"');
    }
    expect(signedIn).toContain("Streamer One");
    expect(signedIn).not.toContain(">Sign in<");
    expect(signedOut).toContain(">Sign in<");
  });

  for (const key of ["helpSupport", "helpFeedback"]) {
    it(`${key} renders the app header for a signed-in streamer`, () => {
      const html = render(key, user);
      expect(html).toContain("gm-shell-nav");
      expect(html).toContain("Streamer One");
      expect(html).toContain('href="/bot/dashboard"');
      expect(html).not.toContain(">Sign in<");
    });

    it(`${key} renders the signed-out header for a visitor`, () => {
      const html = render(key, null);
      expect(html).toContain("gm-shell-nav");
      expect(html).toContain(">Sign in<");
      expect(html).not.toContain("gm-profile-menu");
    });

    it(`${key} keeps the contact form and its script`, () => {
      const html = render(key, user);
      expect(html).toContain('id="contactForm"');
      expect(html).toContain("/assets/contact.js");
      expect(html).toContain('id="helpSide"');
    });
  }

  it("marks Help as the active section", () => {
    expect(render("helpSupport", user)).toContain('aria-current="page"');
  });
});
