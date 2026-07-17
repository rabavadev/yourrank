// Per-template top-3 and row builders for the casino design pack.
// Loaded before leaderboard.js; uses helpers exposed on window.__yr at call time.
(function () {
  const yr = () => window.__yr || {};
  const esc = (s) => (yr().esc ? yr().esc(s) : String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const initials = (n) => (yr().initials ? yr().initials(n) : ((c) => c.length >= 2 ? c.slice(0, 2).toUpperCase() : (c ? c.toUpperCase() : "★"))(String(n ?? "").replace(/\*/g, "").trim()));
  const money = (n) => (yr().money ? yr().money(n) : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const moneyShort = (n) => (yr().moneyShort ? yr().moneyShort(n) : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 }));

  const trend = (rank) => {
    const up = rank <= 3 || rank % 2 === 0;
    return `<span class="tr-trend tr-trend--${up ? "up" : "down"}" aria-hidden="true">${up ? "▲" : "▼"}</span>`;
  };

  function podiumOrder(rank) {
    if (rank === 1) return 2;
    if (rank === 2) return 1;
    return 3;
  }

  const top3 = {
    arcade(pl, rank) {
      const icon = rank === 1 ? "🏆" : rank === 2 ? "⚡" : "🔥";
      const color = rank === 1 ? "t3--gold" : rank === 2 ? "t3--blue" : "t3--green";
      return `<div class="t3 t3--arcade ${color}" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-icon">${icon}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
        <span class="t3-stand">${rank}</span>
      </div>`;
    },
    candy(pl, rank) {
      const order = podiumOrder(rank);
      const candy = rank === 1 ? "🍬" : rank === 2 ? "🍭" : "🍫";
      return `<div class="t3 t3--candy" style="order:${order}" data-rank="${rank}">
        <span class="t3-candy">${candy}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    fun(pl, rank) {
      const icon = rank === 1 ? "🎉" : rank === 2 ? "🎈" : "🎁";
      return `<div class="t3 t3--fun" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-icon">${icon}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    space(pl, rank) {
      const icon = rank === 1 ? "🚀" : rank === 2 ? "🛸" : "🪐";
      return `<div class="t3 t3--space" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-orbit"></span>
        <span class="t3-icon">${icon}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    tropical(pl, rank) {
      const icon = rank === 1 ? "🌴" : rank === 2 ? "🍹" : "🐠";
      return `<div class="t3 t3--tropical" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-icon">${icon}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    underwater(pl, rank) {
      const icon = rank === 1 ? "🐙" : rank === 2 ? "🦈" : "🐠";
      return `<div class="t3 t3--underwater" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-bubble"></span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    western(pl, rank) {
      const icon = rank === 1 ? "🤠" : rank === 2 ? "⭐" : "🌵";
      return `<div class="t3 t3--western" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-wanted">WANTED</span>
        <span class="t3-icon">${icon}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-name">${esc(pl.name)}</span>
        <span class="t3-wager">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    editorial(pl, rank) {
      return `<div class="t3 t3--editorial" style="order:${podiumOrder(rank)}" data-rank="${rank}">
        <span class="t3-rank">${rank}</span>
        <span class="t3-av">${esc(initials(pl.name))}</span>
        <span class="t3-meta">
          <span class="t3-name">${esc(pl.name)}</span>
          <span class="t3-wager">${moneyShort(pl.wagered)}</span>
        </span>
      </div>`;
    },
  };

  const rows = {
    arcade(pl, rank, delay) {
      return `<div class="t-row t-row--arcade" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${String(rank).padStart(2, "0")}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}${trend(rank)}</span>
      </div>`;
    },
    candy(pl, rank, delay) {
      return `<div class="t-row t-row--candy" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    fun(pl, rank, delay) {
      return `<div class="t-row t-row--fun" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}${trend(rank)}</span>
      </div>`;
    },
    pro(pl, rank, delay) {
      const prize = pl.prize ? moneyShort(pl.prize) : "—";
      return `<div class="t-row t-row--pro" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-wager" role="cell">${moneyShort(pl.wagered)}</span>
        <span class="tr-prize" role="cell">${prize}</span>
      </div>`;
    },
    space(pl, rank, delay) {
      return `<div class="t-row t-row--space" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    tropical(pl, rank, delay) {
      return `<div class="t-row t-row--tropical" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    underwater(pl, rank, delay) {
      return `<div class="t-row t-row--underwater" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    vip(pl, rank, delay) {
      return `<div class="t-row t-row--vip" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${String(rank).padStart(2, "0")}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-wager" role="cell">${moneyShort(pl.wagered)}</span>
        <span class="tr-prize" role="cell">${pl.prize ? moneyShort(pl.prize) : ""}</span>
      </div>`;
    },
    western(pl, rank, delay) {
      return `<div class="t-row t-row--western" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-score" role="cell">${moneyShort(pl.wagered)}</span>
      </div>`;
    },
    editorial(pl, rank, delay) {
      return `<div class="t-row t-row--editorial" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
        <span class="tr-rank" role="cell">${rank}</span>
        <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span>
        <span class="tr-wager" role="cell">${moneyShort(pl.wagered)}</span>
        <span class="tr-prize" role="cell">${pl.prize ? moneyShort(pl.prize) : "—"}</span>
      </div>`;
    },
  };

  window.CASINO_BUILDERS = { top3, rows };
})();
