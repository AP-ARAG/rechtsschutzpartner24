(() => {
  "use strict";

  const doc = document;
  const html = doc.documentElement;
  const body = doc.body;
  if (!body || body.dataset.siteToolsReady === "true") return;
  body.dataset.siteToolsReady = "true";

  const toolbar = doc.createElement("div");
  toolbar.className = "a11y-tools";
  toolbar.innerHTML = `
    <button class="a11y-trigger" type="button" aria-expanded="false" aria-controls="a11y-panel">
      <span aria-hidden="true">Aa</span><strong>Barrierefreiheit</strong>
    </button>
    <aside class="a11y-panel" id="a11y-panel" aria-labelledby="a11y-title" hidden>
      <div class="a11y-panel-head">
        <div><small>Darstellung</small><strong id="a11y-title">Barrierefreiheit</strong></div>
        <button class="a11y-close" type="button" aria-label="Menü Barrierefreiheit schließen">×</button>
      </div>
      <p>Darstellung ohne Tracking anpassen. Die Auswahl wird nicht gespeichert.</p>
      <div class="a11y-options" role="group" aria-label="Darstellung anpassen">
        <button type="button" data-a11y-option="text" aria-pressed="false"><span>Text vergrößern</span><strong>Aus</strong></button>
        <button type="button" data-a11y-option="contrast" aria-pressed="false"><span>Kontrast erhöhen</span><strong>Aus</strong></button>
        <button type="button" data-a11y-option="readable" aria-pressed="false"><span>Lesbare Schrift</span><strong>Aus</strong></button>
        <button type="button" data-a11y-option="motion" aria-pressed="false"><span>Bewegung reduzieren</span><strong>Aus</strong></button>
      </div>
      <button class="a11y-reset" type="button">Alle Anpassungen zurücksetzen</button>
      <span class="sr-only" data-a11y-status aria-live="polite"></span>
    </aside>`;
  body.appendChild(toolbar);

  const trigger = toolbar.querySelector(".a11y-trigger");
  const panel = toolbar.querySelector(".a11y-panel");
  const closeButton = toolbar.querySelector(".a11y-close");
  const resetButton = toolbar.querySelector(".a11y-reset");
  const status = toolbar.querySelector("[data-a11y-status]");
  const optionButtons = [...toolbar.querySelectorAll("[data-a11y-option]")];
  const classByOption = {
    text: "a11y-text-large",
    contrast: "a11y-high-contrast",
    readable: "a11y-readable-font",
    motion: "a11y-reduce-motion",
  };

  const setPanel = (open) => {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) closeButton.focus();
    else trigger.focus();
  };

  const syncOption = (button) => {
    const className = classByOption[button.dataset.a11yOption];
    const active = html.classList.contains(className);
    button.setAttribute("aria-pressed", String(active));
    button.querySelector("strong").textContent = active ? "An" : "Aus";
  };

  trigger.addEventListener("click", () => setPanel(panel.hidden));
  closeButton.addEventListener("click", () => setPanel(false));
  optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const className = classByOption[button.dataset.a11yOption];
      html.classList.toggle(className);
      syncOption(button);
      status.textContent = `${button.querySelector("span").textContent}: ${button.getAttribute("aria-pressed") === "true" ? "aktiviert" : "deaktiviert"}.`;
    });
  });
  resetButton.addEventListener("click", () => {
    Object.values(classByOption).forEach((className) => html.classList.remove(className));
    optionButtons.forEach(syncOption);
    status.textContent = "Alle Darstellungsanpassungen wurden zurückgesetzt.";
  });
  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setPanel(false);
  });

  const exitConfig = doc.querySelector("[data-exit-intent]");
  if (!exitConfig || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const exitLayer = doc.createElement("div");
  exitLayer.className = "exit-intent";
  exitLayer.hidden = true;
  exitLayer.innerHTML = `
    <button class="exit-intent-backdrop" type="button" aria-label="Hinweis schließen"></button>
    <section class="exit-intent-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-intent-title" aria-describedby="exit-intent-copy" tabindex="-1">
      <button class="exit-intent-close" type="button" aria-label="Hinweis schließen">×</button>
      <p class="exit-intent-eyebrow">Bevor Sie gehen</p>
      <h2 id="exit-intent-title"></h2>
      <p id="exit-intent-copy"></p>
      <div class="exit-intent-actions">
        <a class="exit-intent-primary" href="#">Bedarf kurz einordnen</a>
        <a class="exit-intent-secondary" href="tel:+49821509280">0821 509280 anrufen</a>
      </div>
      <small>Unverbindliche Orientierung · keine Online-Sofortbindung</small>
    </section>`;
  body.appendChild(exitLayer);

  const dialog = exitLayer.querySelector(".exit-intent-dialog");
  const exitClose = exitLayer.querySelector(".exit-intent-close");
  const exitPrimary = exitLayer.querySelector(".exit-intent-primary");
  exitLayer.querySelector("#exit-intent-title").textContent = exitConfig.dataset.exitTitle || "Dürfen wir Ihre Frage kurz einordnen?";
  exitLayer.querySelector("#exit-intent-copy").textContent = exitConfig.dataset.exitCopy || "Nutzen Sie den kurzen Bedarfscheck oder sprechen Sie direkt mit Ihrem persönlichen Ansprechpartner.";
  exitPrimary.href = exitConfig.dataset.exitTarget || "#main";
  exitPrimary.textContent = exitConfig.dataset.exitAction || "Bedarf kurz einordnen";

  let exitArmed = false;
  let exitShown = false;
  let previousFocus = null;
  window.setTimeout(() => { exitArmed = true; }, 6000);

  const closeExit = () => {
    if (exitLayer.hidden) return;
    exitLayer.hidden = true;
    body.classList.remove("exit-intent-open");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  };

  const showExit = () => {
    if (exitShown || !exitArmed || !panel.hidden || body.classList.contains("has-info-modal")) return;
    if (doc.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName)) return;
    exitShown = true;
    previousFocus = doc.activeElement;
    exitLayer.hidden = false;
    body.classList.add("exit-intent-open");
    exitClose.focus();
  };

  doc.addEventListener("mouseout", (event) => {
    if (event.clientY <= 8 && !event.relatedTarget) showExit();
  });
  exitClose.addEventListener("click", closeExit);
  exitLayer.querySelector(".exit-intent-backdrop").addEventListener("click", closeExit);
  exitPrimary.addEventListener("click", closeExit);
  doc.addEventListener("keydown", (event) => {
    if (exitLayer.hidden) return;
    if (event.key === "Escape") closeExit();
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("a[href], button:not([disabled])")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
