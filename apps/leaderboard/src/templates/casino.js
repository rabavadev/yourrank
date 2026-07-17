// Casino design pack — ten playful, distinct leaderboard skins.
// Each skin is a full CSS layer over the shared leaderboard markup.
import { composePro, composeVIP, composeEditorial, PRO_CSS, VIP_CSS, EDITORIAL_CSS } from "./casino-full.js";

const BASE = `
:root{
  --bg:#0f0f16;
  --panel:#15151f;
  --panel-2:#1c1c28;
  --line:rgba(255,255,255,.10);
  --line-2:rgba(255,255,255,.18);
  --ink:#f4f4f7;
  --ink-soft:#b0b0c0;
  --ink-mute:#7a7a8a;
  --cy:#ffd15c;
  --bl:#ff7a59;
  --grad-name:linear-gradient(100deg,#ffd15c 0%,#ff7a59 100%);
  --grad-cta:linear-gradient(100deg,#ffd15c,#ff7a59);
  --gold:#ffd15c;
  --radius:14px;
  --radius-sm:10px;
  --font:"Sora",system-ui,sans-serif;
}
body{font-family:var(--font)}
.field{background:radial-gradient(900px 500px at 50% -10%,rgba(255,255,255,.08),transparent 60%),linear-gradient(180deg,var(--panel-2),var(--bg))}
.stream-window,.watermarks{display:none}
.nav{border-bottom:1px solid var(--line);background:rgba(15,15,22,.85);backdrop-filter:blur(8px)}
.hero{padding:4rem 0 1.5rem;text-align:center}
.hero-kicker{display:none}
.hero-name{font-size:clamp(2.2rem,5vw,3.6rem);letter-spacing:-.02em;font-weight:800}
.hero-sub{font-size:1rem;color:var(--ink-soft);margin:.6rem auto 1.4rem;max-width:60ch}
.hero-cta{justify-content:center}
.hero-timer{justify-content:center;margin-top:1rem}
.top3{grid-template-columns:1fr 1.18fr 1fr;align-items:end;gap:16px;margin:2rem auto;max-width:920px}
.t3{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:24px 14px 20px;text-align:center;box-shadow:0 24px 60px -40px rgba(0,0,0,.35)}
.t3--1{order:2;padding:34px 16px 28px;border-color:var(--gold);box-shadow:0 28px 70px -40px rgba(255,209,92,.35)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{width:64px;height:64px;margin:.2rem auto .7rem;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:1.4rem;color:#fff;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:82px;height:82px;font-size:1.8rem;box-shadow:0 0 0 4px rgba(255,209,92,.25)}
.t3-name{font-size:1.05rem;font-weight:700}
.t3-wager{font-size:1.15rem;font-weight:800;color:var(--gold)}
.t3-prize{font-size:.85rem}
.t-head{background:rgba(255,255,255,.05);border-bottom:1px solid var(--line);text-transform:uppercase;letter-spacing:.12em;font-size:.72rem}
.t-row{border-bottom:1px solid var(--line)}
.t-row:hover{background:rgba(255,255,255,.03)}
.tr-av{background:rgba(255,255,255,.08);border-color:transparent;color:var(--ink-soft)}
.tr-prize.has{color:var(--gold)}
.find-rank-bar{max-width:520px;margin:0 auto 1.2rem}
.find-rank-input{background:var(--panel);border:1px solid var(--line);color:var(--ink)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);box-shadow:0 20px 50px -30px rgba(0,0,0,.4)}
.panel-badge{background:var(--grad-cta);color:#0f0f16}
.rules{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
.past-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
.scard{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
@media(max-width:600px){.top3{grid-template-columns:1fr}}
`;

function make(id, name, description, presets, extra) {
  return {
    id,
    name,
    description,
    css: BASE + extra,
    presets,
  };
}

export const CASINO_TEMPLATES = {
  arcade: make(
    "arcade",
    "Casino Arcade",
    "Retro 8-bit arcade: neon grid, pixel font, and glowing blocks.",
    [
      { id: "neon", name: "Neon", accentA: "#00ff41", accentB: "#ff00d4" },
      { id: "cyber", name: "Cyber", accentA: "#00f0ff", accentB: "#ff00aa" },
      { id: "gold", name: "Coin", accentA: "#ffe600", accentB: "#ff7b00" },
    ],
    `
:root{--font:"Press Start 2P",cursive;--bg:#05050a;--panel:#0d0d14;--panel-2:#13131f;--line:rgba(0,255,65,.25);--line-2:rgba(255,0,212,.35);--ink:#e8ffe8;--ink-soft:#8fa38f;--ink-mute:#556355;--cy:#00ff41;--bl:#ff00d4;--grad-name:linear-gradient(100deg,#00ff41 0%,#ff00d4 100%);--grad-cta:linear-gradient(100deg,#00ff41,#ff00d4);--gold:#ffe600;--radius:0;--radius-sm:0}
body{font-family:var(--font);text-transform:uppercase}
.field{background:linear-gradient(rgba(0,255,65,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,0,212,.03) 1px,transparent 1px),radial-gradient(900px 500px at 50% -10%,rgba(0,255,65,.12),transparent 60%),linear-gradient(180deg,#0a0a12,#05050a);background-size:40px 40px,40px 40px,auto,auto}
.nav{border-bottom:2px solid var(--cy)}
.hero{padding-top:5rem}
.hero-name{font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.3;text-shadow:0 0 12px var(--cy)}
.hero-sub{color:var(--ink-soft);text-transform:uppercase;letter-spacing:.1em}
.btn{border-radius:0;border:2px solid var(--cy);background:#000;color:var(--cy);box-shadow:4px 4px 0 var(--bl)}
.btn--grad{color:#000;background:var(--cy);box-shadow:4px 4px 0 var(--bl)}
.top3{gap:12px}
.t3{border:2px solid var(--cy);box-shadow:6px 6px 0 var(--bl);padding:18px 10px 16px}
.t3--1{border-color:var(--gold);box-shadow:6px 6px 0 var(--gold)}
.t3-av{border-radius:0;clip-path:polygon(10% 0,100% 0,100% 90%,90% 100%,0 100%,0 10%)}
.t3-name{font-size:.7rem;line-height:1.4}
.t3-wager{font-size:.8rem}
.t-head{font-family:"Press Start 2P",cursive;font-size:.55rem}
.t-row{font-size:.7rem;border-bottom:2px dashed var(--line)}
.tr-av{border-radius:0}
    `
  ),
  candy: make(
    "candy",
    "Casino Candy",
    "Sweet candy theme with soft pinks, yellows, and a bouncy vibe.",
    [
      { id: "bubblegum", name: "Bubblegum", accentA: "#db2777", accentB: "#f59e0b" },
      { id: "mint", name: "Mint", accentA: "#22c55e", accentB: "#f472b6" },
      { id: "grape", name: "Grape", accentA: "#a855f7", accentB: "#facc15" },
    ],
    `
:root{--font:"Fredoka One",cursive;--bg:#fff0f6;--panel:#ffffff;--panel-2:#fce7f3;--line:#fbcfe8;--line-2:#f9a8d4;--ink:#831843;--ink-soft:#9d174d;--ink-mute:#be185d;--cy:#db2777;--bl:#f59e0b;--grad-name:linear-gradient(100deg,#db2777 0%,#f59e0b 100%);--grad-cta:linear-gradient(100deg,#db2777,#f59e0b);--gold:#f59e0b;--radius:24px;--radius-sm:16px}
body{font-family:var(--font)}
.field{background:linear-gradient(180deg,#fff0f6 0%,#fbcfe8 100%)}
.nav{border-bottom:2px solid var(--line);background:#fff}
.hero-name{color:#db2777;text-shadow:2px 2px 0 #f9a8d4}
.btn{border-radius:999px;background:#db2777;color:#fff;border:0}
.btn--grad{color:#fff}
.top3{gap:14px}
.t3{border:3px solid #fbcfe8;border-radius:28px;background:#fff;box-shadow:0 12px 30px -15px rgba(219,39,119,.35)}
.t3--1{border-color:var(--gold);background:linear-gradient(180deg,#fff9e6,#fff);box-shadow:0 16px 40px -15px rgba(245,158,11,.4)}
.t3-av{border-radius:50%;border:3px solid #fbcfe8}
.t-head{background:#fce7f3;color:#9d174d;border-radius:999px;border:0;margin-bottom:8px}
.t-row{border-bottom:2px solid #fbcfe8;border-radius:14px;margin-bottom:6px;background:#fff}
.t-row:hover{background:#fff0f6}
.tr-av{background:#fce7f3;color:#db2777;border-color:transparent}
.panel{background:#fff;border:2px solid #fbcfe8}
.rules{background:#fff;border:2px solid #fbcfe8}
.past-card,.scard{background:#fff;border:2px solid #fbcfe8}
    `
  ),
  fun: make(
    "fun",
    "Casino Fun",
    "Bold purple and gold party energy with rounded cards.",
    [
      { id: "party", name: "Party", accentA: "#facc15", accentB: "#a855f7" },
      { id: "berry", name: "Berry", accentA: "#ec4899", accentB: "#8b5cf6" },
      { id: "ocean", name: "Ocean", accentA: "#06b6d4", accentB: "#3b82f6" },
    ],
    `
:root{--font:"Sora",system-ui,sans-serif;--bg:#2e1065;--panel:#4c1d95;--panel-2:#5b21b6;--line:rgba(250,204,21,.22);--line-2:rgba(250,204,21,.35);--ink:#ffffff;--ink-soft:#ddd6fe;--ink-mute:#a78bfa;--cy:#facc15;--bl:#a855f7;--grad-name:linear-gradient(100deg,#facc15 0%,#a855f7 100%);--grad-cta:linear-gradient(100deg,#facc15,#a855f7);--gold:#facc15;--radius:24px;--radius-sm:18px}
body{font-family:var(--font)}
.field{background:radial-gradient(900px 500px at 80% -10%,rgba(168,85,247,.25),transparent 55%),radial-gradient(700px 400px at 20% 20%,rgba(250,204,21,.15),transparent 55%),linear-gradient(180deg,#4c1d95,#2e1065)}
.hero-name{font-size:clamp(2.4rem,5.5vw,4rem);letter-spacing:-.03em;background:linear-gradient(100deg,#facc15,#fff);-webkit-background-clip:text;background-clip:text;color:transparent}
.btn{border-radius:999px;background:var(--gold);color:#4c1d95;font-weight:800}
.top3{gap:18px}
.t3{border:2px solid rgba(250,204,21,.3);border-radius:var(--radius);background:linear-gradient(180deg,#5b21b6,#4c1d95);box-shadow:0 20px 50px -30px rgba(0,0,0,.5)}
.t3--1{border-color:var(--gold);box-shadow:0 24px 60px -30px rgba(250,204,21,.35)}
.t3-av{box-shadow:0 0 0 4px rgba(250,204,21,.25)}
.t-head{background:rgba(250,204,21,.1);border:0;border-radius:12px}
.t-row{border-bottom:1px solid rgba(250,204,21,.15);border-radius:12px}
.t-row:hover{background:rgba(250,204,21,.08)}
.panel{background:#4c1d95;border:1px solid rgba(250,204,21,.25)}
.rules{background:#4c1d95;border:1px solid rgba(250,204,21,.25)}
.past-card,.scard{background:#4c1d95;border:1px solid rgba(250,204,21,.25)}
    `
  ),
  pro: make(
    "pro",
    "Casino Pro",
    "Full-page poker terminal with stats grid and clean data table.",
    [
      { id: "felt", name: "Felt", accentA: "#22c55e", accentB: "#15803d" },
      { id: "tournament", name: "Tournament", accentA: "#f59e0b", accentB: "#22c55e" },
      { id: "midnight", name: "Midnight", accentA: "#86efac", accentB: "#166534" },
    ],
    PRO_CSS
  ),
  space: make(
    "space",
    "Casino Space",
    "Deep galaxy rankings with Orbitron type and starfield glows.",
    [
      { id: "nebula", name: "Nebula", accentA: "#8B5CF6", accentB: "#F472B6" },
      { id: "cyan", name: "Cyan", accentA: "#22D3EE", accentB: "#3B82F6" },
      { id: "gold", name: "Stellar", accentA: "#FFFBEB", accentB: "#F59E0B" },
    ],
    `
:root{--font:"Orbitron",sans-serif;--bg:#080B1A;--panel:#131342;--panel-2:#1E1B4B;--line:rgba(139,92,246,.28);--line-2:rgba(244,114,182,.35);--ink:#ffffff;--ink-soft:#c4b5fd;--ink-mute:#7c71a3;--cy:#8B5CF6;--bl:#F472B6;--grad-name:linear-gradient(100deg,#8B5CF6 0%,#F472B6 100%);--grad-cta:linear-gradient(100deg,#8B5CF6,#F472B6);--gold:#FFFBEB;--radius:12px;--radius-sm:8px}
body{font-family:var(--font)}
.field{background:radial-gradient(900px 500px at 30% -10%,rgba(139,92,246,.18),transparent 60%),radial-gradient(700px 400px at 80% 20%,rgba(244,114,182,.12),transparent 55%),linear-gradient(180deg,#131342,#080B1A)}
.hero-name{text-transform:uppercase;letter-spacing:.15em;text-shadow:0 0 20px #8B5CF6}
.hero-sub{letter-spacing:.1em}
.btn{border:1px solid #8B5CF6;background:#1E1B4B;color:#fff;box-shadow:0 0 12px rgba(139,92,246,.4)}
.btn--grad{background:linear-gradient(100deg,#8B5CF6,#F472B6);color:#fff;border:0}
.top3{gap:14px}
.t3{border:1px solid #8B5CF6;background:#131342;box-shadow:0 0 20px rgba(139,92,246,.25)}
.t3--1{border-color:#FFFBEB;box-shadow:0 0 30px rgba(255,251,235,.25)}
.t3--2{border-color:#8B5CF6}.t3--3{border-color:#22D3EE}
.t3-av{background:#080B1A;border:2px solid var(--line)}
.t3--1 .t3-av{border-color:#FFFBEB}
.t3--2 .t3-av{border-color:#8B5CF6}
.t3--3 .t3-av{border-color:#22D3EE}
.t-head{background:rgba(139,92,246,.12);border:0;border-radius:8px}
.t-row{border-bottom:1px solid rgba(139,92,246,.2)}
.t-row:hover{background:rgba(139,92,246,.1)}
.panel,.rules,.past-card,.scard{background:#131342;border:1px solid rgba(139,92,246,.25)}
    `
  ),
  tropical: make(
    "tropical",
    "Casino Tropical",
    "Sunset-to-ocean gradients with a breezy script header.",
    [
      { id: "sunset", name: "Sunset", accentA: "#FF6B35", accentB: "#00D4AA" },
      { id: "coral", name: "Coral", accentA: "#FFE66D", accentB: "#FF6B6B" },
      { id: "teal", name: "Teal", accentA: "#00D4AA", accentB: "#0D7377" },
    ],
    `
:root{--font:"Pacifico",cursive;--bg:#0D7377;--panel:#ffffff;--panel-2:#ccfbf1;--line:#00D4AA;--line-2:#FF6B35;--ink:#064E3B;--ink-soft:#115E59;--ink-mute:#0F766E;--cy:#00D4AA;--bl:#FF6B35;--grad-name:linear-gradient(100deg,#FF6B35 0%,#00D4AA 100%);--grad-cta:linear-gradient(100deg,#FF6B35,#00D4AA);--gold:#FFE66D;--radius:24px;--radius-sm:18px}
body{font-family:var(--font)}
.field{background:linear-gradient(180deg,#FF6B35 0%,#0D7377 100%)}
.nav{border-bottom:2px solid rgba(255,255,255,.25);background:rgba(13,115,119,.9)}
.hero-name{color:#fff;text-shadow:3px 3px 0 #FF6B35;font-size:clamp(2.6rem,6vw,4.5rem)}
.hero-sub{color:#fff}
.btn{border-radius:999px;background:#00D4AA;color:#064E3B;font-weight:800}
.btn--grad{color:#064E3B}
.top3{gap:14px}
.t3{background:#fff;border:3px solid #00D4AA;border-radius:28px 28px 8px 8px;box-shadow:0 14px 30px -10px rgba(0,0,0,.35)}
.t3--1{border-color:#FFE66D;background:linear-gradient(180deg,#fff9e6,#fff)}
.t3--2{border-color:#00D4AA}
.t3--3{border-color:#FF6B6B}
.t3-av{border:3px solid #00D4AA;color:#064E3B;background:#FFE66D}
.t3--1 .t3-av{border-color:#FFE66D}
.t-head{background:rgba(255,255,255,.25);border:0;border-radius:999px;color:#064E3B}
.t-row{background:rgba(255,255,255,.85);border:0;border-radius:16px;margin-bottom:8px}
.t-row:hover{background:#fff}
.tr-av{background:#00D4AA;color:#064E3B;border-color:transparent}
.panel,.rules,.past-card,.scard{background:#fff;border:2px solid #00D4AA}
    `
  ),
  underwater: make(
    "underwater",
    "Casino Underwater",
    "Deep-sea leaderboard with cyan, pink, and bubbly edges.",
    [
      { id: "deep", name: "Deep", accentA: "#00E5FF", accentB: "#FF6B9D" },
      { id: "reef", name: "Reef", accentA: "#39FF9C", accentB: "#00E5FF" },
      { id: "abyss", name: "Abyss", accentA: "#003344", accentB: "#00E5FF" },
    ],
    `
:root{--font:"Baloo 2",cursive;--bg:#003344;--panel:#001F2D;--panel-2:#002b3d;--line:rgba(0,229,255,.25);--line-2:rgba(57,255,156,.35);--ink:#ffffff;--ink-soft:#a5f3fc;--ink-mute:#67e8f9;--cy:#00E5FF;--bl:#39FF9C;--grad-name:linear-gradient(100deg,#00E5FF 0%,#FF6B9D 100%);--grad-cta:linear-gradient(100deg,#00E5FF,#39FF9C);--gold:#FF6B9D;--radius:18px;--radius-sm:12px}
body{font-family:var(--font)}
.field{background:radial-gradient(900px 500px at 50% -10%,rgba(0,229,255,.18),transparent 60%),radial-gradient(700px 400px at 20% 30%,rgba(255,107,157,.12),transparent 55%),linear-gradient(180deg,#001F2D,#003344)}
.hero-name{color:#00E5FF;text-shadow:0 0 20px #00E5FF}
.hero-sub{color:#39FF9C}
.btn{border-radius:999px;background:#00E5FF;color:#001F2D;font-weight:800}
.top3{gap:14px}
.t3{background:#001F2D;border:2px solid #00E5FF;border-radius:18px;box-shadow:0 0 20px rgba(0,229,255,.2)}
.t3--1{border-color:#FF6B9D;box-shadow:0 0 30px rgba(255,107,157,.3)}
.t3--2{border-color:#00E5FF}
.t3--3{border-color:#39FF9C}
.t3-av{background:#003344;border:2px solid #00E5FF;color:#00E5FF}
.t3--1 .t3-av{border-color:#FF6B9D;color:#FF6B9D}
.t3--2 .t3-av{border-color:#00E5FF}
.t3--3 .t3-av{border-color:#39FF9C;color:#39FF9C}
.t-head{background:rgba(0,229,255,.1);border:0;border-radius:12px}
.t-row{border-bottom:1px solid rgba(0,229,255,.15);border-radius:12px}
.t-row:hover{background:rgba(0,229,255,.08)}
.panel,.rules,.past-card,.scard{background:#001F2D;border:1px solid rgba(0,229,255,.25)}
    `
  ),
  vip: make(
    "vip",
    "Casino VIP",
    "Full-page black-and-gold members list with elegant serif type.",
    [
      { id: "gold", name: "Gold", accentA: "#C9A84C", accentB: "#F5F5F0" },
      { id: "platinum", name: "Platinum", accentA: "#E5E7EB", accentB: "#C9A84C" },
      { id: "obsidian", name: "Obsidian", accentA: "#1A1A1A", accentB: "#C9A84C" },
    ],
    VIP_CSS
  ),
  western: make(
    "western",
    "Casino Western",
    "Wild west saloon board with wood grain, gold, and sheriff stars.",
    [
      { id: "saloon", name: "Saloon", accentA: "#F5A623", accentB: "#C0392B" },
      { id: "dust", name: "Dust", accentA: "#D4B886", accentB: "#8B6B3D" },
      { id: "whiskey", name: "Whiskey", accentA: "#8B4513", accentB: "#F5A623" },
    ],
    `
:root{--font:"Rye",serif;--bg:#3D1A00;--panel:#2C1000;--panel-2:#3D1A00;--line:rgba(245,166,35,.25);--line-2:rgba(245,166,35,.4);--ink:#FFF8E7;--ink-soft:#D4B886;--ink-mute:#A68A56;--cy:#F5A623;--bl:#C0392B;--grad-name:linear-gradient(100deg,#F5A623 0%,#C0392B 100%);--grad-cta:linear-gradient(100deg,#F5A623,#C0392B);--gold:#F5A623;--radius:4px;--radius-sm:4px}
body{font-family:var(--font)}
.field{background:repeating-linear-gradient(45deg,#2C1000,#2C1000 12px,#3D1A00 12px,#3D1A00 24px),linear-gradient(180deg,#2C1000,#3D1A00)}
.nav{border-bottom:4px solid #F5A623;background:#2C1000}
.hero-name{color:#F5A623;text-shadow:0 4px 6px rgba(0,0,0,.9);letter-spacing:.08em}
.hero-sub{color:#FFF8E7;text-shadow:0 2px 4px rgba(0,0,0,.9)}
.btn{border:2px solid #F5A623;background:#2C1000;color:#F5A623;border-radius:0}
.btn--grad{background:#F5A623;color:#2C1000}
.top3{gap:14px}
.t3{border:3px solid #8B6B3D;border-radius:8px;background:linear-gradient(180deg,#D4B886,#A68A56);color:#2C1000;box-shadow:0 12px 30px -15px rgba(0,0,0,.7)}
.t3--1{border-color:#F5A623;background:linear-gradient(180deg,#EEDC9A,#C8A951)}
.t3--2{border-color:#8B6B3D}
.t3--3{border-color:#7A5A34}
.t3-av{background:#2C1000;color:#F5A623;border:2px solid #1A0A00}
.t3-name{color:#2C1000;font-size:.95rem}
.t3-wager{color:#800000}
.t-head{background:#2C1000;color:#F5A623;border:0;border-radius:0;text-transform:uppercase;letter-spacing:.12em}
.t-row{background:#2C1000;border-bottom:1px solid rgba(245,166,35,.2)}
.t-row:hover{background:#4A1E00}
.tr-av{background:#F5A623;color:#2C1000;border-color:transparent;border-radius:0;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.panel,.rules,.past-card,.scard{background:#2C1000;border:2px solid rgba(245,166,35,.3);border-radius:0}
    `
  ),
  editorial: make(
    "editorial",
    "Ranked Editorial",
    "Full-page dark esports editorial with its own podium and glass list.",
    [
      { id: "indigo", name: "Indigo", accentA: "#6366f1", accentB: "#8b5cf6" },
      { id: "rose", name: "Rose", accentA: "#f43f5e", accentB: "#fb7185" },
      { id: "emerald", name: "Emerald", accentA: "#10b981", accentB: "#34d399" },
    ],
    EDITORIAL_CSS
  ),
};

export const CASINO_COMPOSERS = {
  pro: composePro,
  vip: composeVIP,
  editorial: composeEditorial,
};

export const CASINO_FULL = new Set(["pro", "vip", "editorial"]);
