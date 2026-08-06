/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Classic" — the canonical High-Stakes Kinetic page: stream-window hero,
// partner panel, podium board, past winners, socials. Its visual design is
// the base design system in /assets/leaderboard.css, so `css` is empty here;
// the presets below supply the accent pairs (Pro theme can override them).
// Every template module exports the same shape: { id, name, description,
// css, presets, compose } — a self-contained design package.

function composeClassic(p) {
  const { name, heroLogo, hasCasino, casino, period, pool, ctaBtn, joinLabel, timerGrid } = p;
  return (
    <>
      <section class="hero">
        <div dangerouslySetInnerHTML={{ __html: p.streamWindow }} />
        <div dangerouslySetInnerHTML={{ __html: heroLogo }} />
        <p class="hero-kicker">Welcome to</p>
        <h1 class="hero-name" data-brand-name>{name}</h1>
        <p class="hero-sub">
          {hasCasino ? <><span data-casino>{casino}</span> partner · </> : ""}
          <span data-period>{period}</span> leaderboard
        </p>
        <div class="hero-cta">
          <div dangerouslySetInnerHTML={{ __html: ctaBtn(joinLabel) }} />
          <a class="btn btn--ghost" href="#board">Leaderboard</a>
        </div>
        <div class="hero-timer" data-timer>
          <p class="timer-label">
            {pool ? <><span data-pool>{pool}</span> leaderboard resets in</> : "Leaderboard resets in"}
          </p>
          <div dangerouslySetInnerHTML={{ __html: timerGrid }} />
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.partnerPanel }} />
      <div dangerouslySetInnerHTML={{ __html: p.announce }} />
      <section id="board" class="board">
        <div class="board-head">
          <p class="eyebrow">
            {pool ? <><span data-pool>{pool}</span> · </> : ""}
            <span data-period>{period}</span> Leaderboard
          </p>
          <div dangerouslySetInnerHTML={{ __html: p.titleGroup }} />
          <div class="board-meta">
            <span class="bm"><b class="countdown" data-countdown>--</b><span>{p.countdownLabel || "Resets in"}</span></span>
            <span class="bm"><b data-count>{p.sCount}</b><span>Players</span></span>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: p.payouts }} />
        <div dangerouslySetInnerHTML={{ __html: p.top3 }} />
        <div dangerouslySetInnerHTML={{ __html: p.findRank }} />
        <div dangerouslySetInnerHTML={{ __html: p.table }} />
        <div dangerouslySetInnerHTML={{ __html: p.rules }} />
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.pastSec }} />
      <div dangerouslySetInnerHTML={{ __html: p.socialsSec }} />
    </>
  );
}

export const CLASSIC = {
  id: "classic",
  name: "Classic",
  description: "High-Stakes Kinetic: obsidian glass with a glowing neon podium.",
  css: "",
  // Google Fonts css2 family params this design needs (plus the user's
  // picker font, added by the renderer).
  fonts: [
    "Montserrat:wght@400;700;800;900",
    "Inter:wght@400;600;700;800;900",
    "Space+Mono:wght@400;700",
  ],
  presets: [
    { id: "purplenight", name: "Purple Night", accentA: "#06b6d4", accentB: "#a855f7" },
    { id: "electric", name: "Electric", accentA: "#5ad9ff", accentB: "#7b8cff" },
    { id: "sunset", name: "Sunset", accentA: "#ff7a59", accentB: "#ff4d9d" },
    { id: "emerald", name: "Emerald", accentA: "#3cf2b1", accentB: "#35a7ff" },
    { id: "gold", name: "Gold", accentA: "#ffd15c", accentB: "#ff9f43" },
    { id: "signal", name: "Signal", accentA: "#3b82ff", accentB: "#38e1c6" },
    { id: "ember", name: "Ember", accentA: "#ff5f6d", accentB: "#ffc371" },
    { id: "grape", name: "Grape", accentA: "#a855f7", accentB: "#ff5fae" },
    { id: "reef", name: "Reef", accentA: "#42e6ff", accentB: "#ff5fae" },
    { id: "lime", name: "Lime", accentA: "#cdff1f", accentB: "#72ff3d" },
    { id: "redline", name: "Redline", accentA: "#ff3b3b", accentB: "#ff7a1a" },
    { id: "ice", name: "Ice", accentA: "#7de8ff", accentB: "#4c68ff" },
  ],
  compose: composeClassic,
};
