(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let swordCursor = null;
  let animationFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let swordRotation = -45;
  let hasPointerPosition = false;

  function paintCursor() {
    animationFrame = 0;
    if (!swordCursor) return;
    swordCursor.style.transform = `translate3d(${pointerX - 2}px, ${pointerY - 2}px, 0) rotate(${swordRotation}deg)`;
  }

  function moveCursor(event) {
    if (hasPointerPosition) {
      const movementX = event.clientX - pointerX;
      const movementY = event.clientY - pointerY;
      if (Math.hypot(movementX, movementY) >= 1) {
        const movementAngle = Math.atan2(movementY, movementX) * 180 / Math.PI;
        swordRotation = movementAngle - 45;
      }
    } else {
      hasPointerPosition = true;
    }
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
    hasPointerPosition = false;
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
