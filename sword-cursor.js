(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let swordCursor = null;
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function paintCursor() {
    animationFrame = 0;
    if (!swordCursor) return;
    swordCursor.style.transform = `translate3d(${pointerX - 10}px, ${pointerY - 10}px, 0)`;
  }

  function moveCursor(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    swordCursor?.classList.add("is-visible");
    if (!animationFrame) animationFrame = window.requestAnimationFrame(paintCursor);
  }

  function hideCursor() {
    swordCursor?.classList.remove("is-visible", "is-clicking");
  }

  function pressCursor() {
    swordCursor?.classList.add("is-clicking");
  }

  function releaseCursor() {
    swordCursor?.classList.remove("is-clicking");
  }

  function enableCursor() {
    if (swordCursor) return;
    swordCursor = document.createElement("div");
    swordCursor.className = "sword-cursor";
    swordCursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(swordCursor);
    document.documentElement.classList.add("sword-cursor-active");
    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerdown", pressCursor, { passive: true });
    window.addEventListener("pointerup", releaseCursor, { passive: true });
    window.addEventListener("blur", hideCursor);
    document.addEventListener("mouseleave", hideCursor);
  }

  function disableCursor() {
    if (!swordCursor) return;
    window.removeEventListener("pointermove", moveCursor);
    window.removeEventListener("pointerdown", pressCursor);
    window.removeEventListener("pointerup", releaseCursor);
    window.removeEventListener("blur", hideCursor);
    document.removeEventListener("mouseleave", hideCursor);
    document.documentElement.classList.remove("sword-cursor-active");
    swordCursor.remove();
    swordCursor = null;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function syncCursor() {
    if (finePointer.matches) enableCursor();
    else disableCursor();
  }

  finePointer.addEventListener?.("change", syncCursor);
  syncCursor();
})();
