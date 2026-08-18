// Device switcher and visibility controls for the editor's live preview.
// The preview renderer reads the active tab's data-device/data-width attributes,
// so this controller owns the accessible tab state and asks the existing refresh
// path to re-render and re-fit the frame.

function refreshPreview() {
  // Load lazily so the controller can be used independently of dashboard boot
  // timing and does not make the page wait on preview code before the tabs work.
  return import("./site.js").then(({ refreshDesignPreview }) => refreshDesignPreview());
}

function activeEditorGroup() {
  return document.querySelector("#editorTabs .editor-step.is-active")?.dataset?.egroup || "setup";
}

function setupPreviewVisibility() {
  const preview = document.querySelector(".design-preview");
  const editorTabs = document.getElementById("editorTabs");
  if (!preview || !editorTabs || editorTabs._previewVisibilityWired) return;
  editorTabs._previewVisibilityWired = true;
  if (!preview.id) preview.id = "editorPreviewPanel";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "v3-btn v3-btn--sm preview-visibility-toggle";
  toggle.setAttribute("aria-controls", preview.id);
  editorTabs.insertAdjacentElement("afterend", toggle);

  let manuallyOpened = false;
  const setVisible = (visible, { remember = false } = {}) => {
    preview.hidden = !visible;
    toggle.textContent = visible ? "Hide preview" : "Show preview";
    toggle.setAttribute("aria-expanded", String(visible));
    if (remember) manuallyOpened = visible;
    if (visible) refreshPreview();
  };

  const syncToGroup = (group = activeEditorGroup()) => {
    // Appearance benefits from an immediate preview. On task-heavy pages such as
    // Players, Basics, Share and History, keep the frame out of the way unless
    // the creator explicitly asks to see it.
    const shouldOpen = group === "design" || manuallyOpened;
    setVisible(shouldOpen);
  };

  toggle.addEventListener("click", () => setVisible(preview.hidden, { remember: true }));
  editorTabs.addEventListener("click", (event) => {
    const next = event.target.closest(".editor-step")?.dataset?.egroup;
    if (!next) return;
    manuallyOpened = false;
    queueMicrotask(() => syncToGroup(next));
  });
  window.addEventListener("popstate", () => {
    manuallyOpened = false;
    setTimeout(() => syncToGroup(), 0);
  });

  syncToGroup();
}

function setupPreviewTabs() {
  const tablist = document.querySelector('.preview-tabs[role="tablist"]');
  setupPreviewVisibility();
  if (!tablist || tablist._previewTabsWired) return;
  const tabs = [...tablist.querySelectorAll(".preview-tab")];
  if (!tabs.length) return;
  tablist._previewTabsWired = true;

  const setActive = (next) => {
    if (!next || !tabs.includes(next)) return;
    tabs.forEach((tab) => {
      const active = tab === next;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    refreshPreview();
  };

  tablist.addEventListener("click", (event) => {
    const tab = event.target.closest(".preview-tab");
    if (!tab || !tabs.includes(tab)) return;
    event.preventDefault();
    setActive(tab);
  });

  tablist.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let nextIndex = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const next = tabs[nextIndex];
    next.focus();
    setActive(next);
  });

  setActive(tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0]);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupPreviewTabs, { once: true });
else setupPreviewTabs();

export { setupPreviewTabs, setupPreviewVisibility };
