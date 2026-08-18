// Creator-facing editor layout enhancements.
// Existing form controls and IDs stay untouched so the current save/share
// pipeline remains the source of truth; this file only changes presentation.

const STYLE_HREF = "/assets/editor-ux.css?v=1";

function ensureStyles() {
  if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_HREF;
  document.head.appendChild(link);
}

function activeEditorGroup() {
  return document.querySelector("#editorTabs .editor-step[aria-current='page']")?.dataset.egroup ||
    document.querySelector("#editorTabs .editor-step.is-active")?.dataset.egroup ||
    "setup";
}

function setupPreviewDisclosure(refreshPreview) {
  const grid = document.querySelector(".design-grid");
  const preview = grid?.querySelector(".design-preview");
  const tabs = document.getElementById("editorTabs");
  if (!grid || !preview || !tabs || tabs.querySelector("[data-editor-preview-toggle]")) return;

  const previewCard = preview.querySelector(".card");
  const previewHeader = preview.querySelector(".preview-header");
  const previewTitle = previewHeader?.querySelector("h2");
  const previewSub = previewHeader?.querySelector(".preview-sub");
  const syncChip = document.getElementById("previewSyncStatus");
  const syncStrip = preview.querySelector(".preview-sync-strip");

  if (previewTitle) previewTitle.textContent = "Preview";
  if (previewSub) previewSub.textContent = "See your public page while you edit.";
  if (syncChip) syncChip.hidden = true;
  if (syncStrip) syncStrip.hidden = true;
  if (previewCard) {
    previewCard.id = previewCard.id || "editorPreviewPanel";
    previewCard.setAttribute("aria-label", "Public page preview");
  }

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "v3-btn v3-btn--sm editor-preview-toggle";
  toggle.dataset.editorPreviewToggle = "true";
  toggle.setAttribute("aria-controls", previewCard?.id || "editorPreviewPanel");
  tabs.appendChild(toggle);

  let collapsed = false;
  let lastGroup = "";

  const apply = (next, { refresh = true } = {}) => {
    collapsed = Boolean(next);
    grid.dataset.previewCollapsed = collapsed ? "true" : "false";
    preview.hidden = collapsed;
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.textContent = collapsed ? "Show preview" : "Hide preview";
    if (!collapsed && refresh) requestAnimationFrame(() => refreshPreview?.());
  };

  const syncForGroup = () => {
    const group = activeEditorGroup();
    if (group === lastGroup) return;
    lastGroup = group;
    // Appearance benefits from immediate visual feedback. Other tasks get the
    // full workspace width until the creator explicitly asks for the preview.
    apply(group !== "design", { refresh: group === "design" });
  };

  toggle.addEventListener("click", () => apply(!collapsed));

  const observer = new MutationObserver(syncForGroup);
  observer.observe(tabs, { subtree: true, attributes: true, attributeFilter: ["class", "aria-current"] });
  syncForGroup();
}

function makeSection(title, description, className = "") {
  const section = document.createElement("section");
  section.className = `editor-share-group ${className}`.trim();
  const heading = document.createElement("h3");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.className = "card-sub";
  copy.textContent = description;
  section.append(heading, copy);
  return section;
}

function wrapObsSettings(obsBox) {
  const dimensions = obsBox?.querySelector(".embed-obs-row");
  const tip = obsBox?.querySelector(".embed-tip");
  if (!obsBox || (!dimensions && !tip) || obsBox.querySelector(".editor-obs-settings")) return;

  const details = document.createElement("details");
  details.className = "editor-share-details editor-obs-settings";
  const summary = document.createElement("summary");
  summary.textContent = "OBS settings";
  details.appendChild(summary);
  if (dimensions) details.appendChild(dimensions);
  if (tip) details.appendChild(tip);
  obsBox.appendChild(details);
}

function setupShareWorkspace() {
  const card = document.getElementById("embedShareCard");
  if (!card || card.dataset.taskLayout === "true") return;

  const title = card.querySelector(":scope > h2");
  const intro = card.querySelector(":scope > .card-sub");
  const publicField = document.getElementById("embedPublicLink")?.closest(".field");
  const shareCards = document.getElementById("shareCards");
  const socialTitle = shareCards?.previousElementSibling;
  const obsBox = card.querySelector(".embed-obs-box");
  const websiteField = document.getElementById("embedCodeBlock")?.closest(".field");
  const transparent = document.getElementById("embedTransparent");
  const websiteOptions = transparent?.closest(".d-flex");
  const developerTools = document.getElementById("apiAccessDetails");

  if (!publicField || !shareCards || !obsBox || !websiteField) return;
  card.dataset.taskLayout = "true";
  if (title) title.textContent = "Publish & share";
  if (intro) intro.textContent = "Choose where you want your leaderboard to appear.";
  socialTitle?.remove();

  const groups = document.createElement("div");
  groups.className = "editor-share-groups";

  const viewers = makeSection(
    "Share with viewers",
    "Copy your public link or share it with your community.",
    "editor-share-viewers",
  );
  viewers.append(publicField, shareCards);

  const stream = makeSection(
    "On my stream",
    "Use the overlay link when you want the leaderboard inside your broadcast.",
    "editor-share-stream",
  );
  const obsTitle = obsBox.querySelector("b");
  const obsIntro = obsBox.querySelector(":scope > p");
  if (obsTitle) obsTitle.textContent = "Overlay link";
  if (obsIntro) obsIntro.textContent = "Copy this link into a Browser Source in OBS or Streamlabs.";
  wrapObsSettings(obsBox);
  stream.appendChild(obsBox);

  const website = document.createElement("details");
  website.className = "editor-share-details editor-share-website";
  const websiteSummary = document.createElement("summary");
  websiteSummary.textContent = "Put it on a website";
  const websiteIntro = document.createElement("p");
  websiteIntro.className = "card-sub";
  websiteIntro.textContent = "Use the embed code only when you are adding the leaderboard to another website.";
  website.append(websiteSummary, websiteIntro, websiteField);
  if (websiteOptions) website.appendChild(websiteOptions);

  groups.append(viewers, stream, website);
  if (developerTools) groups.appendChild(developerTools);

  if (intro) intro.after(groups);
  else if (title) title.after(groups);
  else card.appendChild(groups);
}

function setPlayerRowEditing(row, editing) {
  row.classList.toggle("is-editing", editing);
  row.querySelectorAll("input[class*='p-']").forEach((input) => {
    input.readOnly = !editing;
    input.tabIndex = editing ? 0 : -1;
  });
  const edit = row.querySelector(".row-edit");
  if (edit) {
    edit.setAttribute("aria-pressed", String(editing));
    edit.title = editing ? "Editing player" : "Edit player";
    edit.setAttribute("aria-label", editing ? "Editing player" : "Edit player");
  }
}

function wirePlayerRow(row) {
  if (!row || row.dataset.readFirstWired === "true") return;
  const edit = row.querySelector(".row-edit");
  const name = row.querySelector(".p-name");
  if (!edit || !name) return;
  row.dataset.readFirstWired = "true";

  // New blank rows stay editable so Add player still behaves as expected.
  setPlayerRowEditing(row, !name.value.trim());
  edit.addEventListener("click", () => {
    if (row.classList.contains("is-editing")) return;
    setPlayerRowEditing(row, true);
    requestAnimationFrame(() => {
      name.focus();
      name.select();
    });
  });
}

function setupPlayersReadMode() {
  const body = document.getElementById("rows");
  if (!body || body.dataset.readFirstObserver === "true") return;
  body.dataset.readFirstObserver = "true";
  body.querySelectorAll(":scope > tr").forEach(wirePlayerRow);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches?.("tr")) wirePlayerRow(node);
    }));
  });
  observer.observe(body, { childList: true });
}

function simplifyEditorLabels() {
  document.querySelectorAll('nav[aria-label="My leaderboard pages"]').forEach((nav) => nav.setAttribute("aria-label", "Leaderboard pages"));
  const shareTitle = document.querySelector('[data-egroup="share"] .v3-section-title');
  if (shareTitle) shareTitle.textContent = "Share";
}

export function setupEditorWorkspace({ refreshPreview } = {}) {
  ensureStyles();
  setupShareWorkspace();
  setupPlayersReadMode();
  simplifyEditorLabels();
  setupPreviewDisclosure(refreshPreview);
}
