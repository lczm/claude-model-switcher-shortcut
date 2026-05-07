// ==UserScript==
// @name         Claude model switcher shortcut
// @version      1.0.0
// @description  Ctrl+1..9 selects the Nth item in Claude's model switcher menu.
// @license      MIT
// @match        https://claude.ai/*
// @match        https://claude.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const MENU_OPEN_DELAY_MS = 80;
  const SEL = {
    modelSwitcherButton: 'button[data-testid="model-selector-dropdown"]',
    menuItem:
      '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]',
  };

  function notify(text) {
    document
      .querySelectorAll(".claude-key-notification")
      .forEach((el) => el.remove());
    const div = document.createElement("div");
    div.className = "claude-key-notification";
    div.textContent = text;
    div.style.cssText = `
            position:fixed; bottom:24px; left:24px; font-family:sans-serif; font-size:.875rem;
            color:#fff; border-radius:6px; background:#222; z-index:2147483647; padding:10px 14px;
            box-shadow:0 4px 12px rgba(0,0,0,.25); opacity:0; transition:opacity 120ms ease;
            pointer-events:none;
        `;
    document.body.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
    });
    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 200);
    }, 1800);
  }

  function visibleNodes(selector) {
    return Array.from(document.querySelectorAll(selector)).filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function switchModel(n) {
    const idx = n - 1;
    const btn = document.querySelector(SEL.modelSwitcherButton);
    if (!btn) {
      notify("Model switcher not found");
      return;
    }
    btn.click();

    setTimeout(() => {
      const items = visibleNodes(SEL.menuItem);
      if (!items.length) {
        notify("Model menu did not open");
        return;
      }
      if (idx < 0 || idx >= items.length) {
        document.body.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        notify(`No model #${n} (only ${items.length} available)`);
        return;
      }
      const target = items[idx];
      const name =
        (target.textContent || "").trim().split("\n")[0].slice(0, 60) ||
        `Model ${n}`;
      target.click();
    }, MENU_OPEN_DELAY_MS);
  }

  function handler(event) {
    // Ctrl + 1..9 only. No Cmd, no Shift, no Alt, no Meta.
    if (!event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    if (!event.code || !event.code.startsWith("Digit")) return;

    const n = parseInt(event.code.slice(5), 10);
    if (n >= 1 && n <= 9) {
      event.preventDefault();
      event.stopPropagation();
      switchModel(n);
    }
  }

  window.addEventListener("keydown", handler, { capture: true });
  document.addEventListener("keydown", handler, { capture: true });
})();
