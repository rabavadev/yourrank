import { describe, it, expect } from "bun:test";
import { PAGES } from "../pages.jsx";
import { leaderboardPageHtml } from "@yourrank/shared/page-shell";

// Help renders inside the signed-in app rail (`dashboardChromeHtml`), not the
// marketing top nav, so a signed-in streamer keeps their session and never hits
// a dead-end "Sign in" page. The user is threaded through Component(renderOpts).
function render(pageKey, user) {
  const page = PAGES[pageKey];
  const html = leaderboardPageHtml({
    ...page.config,
    content: page.Component({ user, activePath: "/help/support" }).toString(),
  });
  return html;
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
      // Help lives in the app rail, not the marketing top nav.
      expect(html).toContain("lb-side");
      expect(html).not.toContain("gm-shell-nav");
    }
    // Signed-in identity appears in the rail's profile menu, and Help keeps the
    // same complete feature map as every other authenticated destination.
    expect(signedIn).toContain("Streamer One");
    expect(signedIn).toContain('data-auth-workspace="true"');
    expect(signedOut).not.toContain('data-auth-workspace="true"');
    for (const href of [
      "/dashboard/leaderboard/players",
      "/dashboard/giveaways/chat",
      "/dashboard/rewards/redemptions",
      "/dashboard/telegram",
      "/dashboard/analytics/activity",
      "/dashboard/leaderboards",
      "/dashboard/settings",
      "/help",
    ]) expect(signedIn).toContain(`href="${href}"`);
    expect(signedIn).toContain('data-nav="help" aria-current="page"');
    expect(signedIn).not.toContain('data-nav="support"');
    expect(signedIn).not.toContain('data-nav="feedback"');
  });

  for (const key of ["helpSupport", "helpFeedback"]) {
    it(`${key} renders the app rail for a signed-in streamer`, () => {
      const html = render(key, user);
      expect(html).toContain("lb-side");
      expect(html).toContain("lb-side-profile");
      expect(html).toContain("Streamer One");
      expect((html.match(/<main\b/g) || []).length).toBe(1);
    });

    it(`${key} renders for a visitor without a marketing top nav`, () => {
      const html = render(key, null);
      expect(html).toContain("lb-side");
      expect(html).not.toContain("gm-shell-nav");
      expect(html).not.toContain(">Sign in<");
    });

    it(`${key} keeps the contact form and its script`, () => {
      const html = render(key, user);
      expect(html).toContain('id="contactForm"');
      expect(html).toContain("/assets/contact.js");
      expect(html).toContain('id="c_message"');
    });

    it(`${key} offers a path back to the dashboard`, () => {
      const html = render(key, user);
      expect(html).toContain('href="/dashboard"');
    });
  }

  it("marks the current Help destination without hiding dashboard features", () => {
    const html = render("helpSupport", user);
    expect(html).toContain('data-nav="help" aria-current="page"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('data-nav="redemptions"');
  });
});
