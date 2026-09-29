// Stage 2: hold-to-activate keyboard navigation. This is plain JS (no
// bundling needed) — it dynamically imports the pre-built Three.js scene
// and drives it from real keydown/keyup, without ever hard-cutting between
// sections.
const NAV_KEYS = {
  A: { hash: "about", label: "ABOUT" },
  S: { hash: "skills", label: "SKILLS" },
  D: { hash: "experience", label: "EXPERIENCE" },
  F: { hash: "work", label: "SELECTED WORK" },
  G: { hash: "current", label: "CURRENT WORK" },
  Z: { hash: "education", label: "EDUCATION" },
  X: { hash: "archive", label: "ARCHIVE" },
  C: { hash: "contact", label: "CONTACT" },
  V: { hash: "resume", label: "RÉSUMÉ" },
  B: { hash: "links", label: "LINKS" },
};
const HOLD_MS = 400;
const LABEL_DELAY_MS = 130;

export function initKeyboardNav({ canvas, labelHost, tokens, onNavigate }) {
  let scene = null;
  let ready = false;
  const held = new Map(); // letter -> { downAt, labelTimer, holdTimer, activated }

  const label = document.createElement("div");
  label.className = "keyboard-key-label";
  label.style.display = "none";
  labelHost.appendChild(label);

  // The label pops up like a little balloon released from the key (see the
  // .is-visible transition in CSS) and lingers for a beat after release
  // instead of vanishing the instant you let go.
  const LABEL_LINGER_MS = 450;
  const LABEL_EXIT_MS = 350;
  let labelGraceTimer = null;
  let labelCleanupTimer = null;
  function showLabel(letter) {
    const def = NAV_KEYS[letter];
    if (!def || !scene) return;
    const point = scene.getKeyScreenPosition(letter);
    if (!point) return;
    clearTimeout(labelGraceTimer);
    clearTimeout(labelCleanupTimer);
    label.textContent = `${letter} / ${def.label}`;
    label.style.left = `${point.x}px`;
    label.style.top = `${point.y}px`;
    label.style.display = "block";
    // Force a reflow so re-triggering the entrance (e.g. tapping the same
    // key again while it's mid-exit) actually restarts the transition.
    void label.offsetWidth;
    label.classList.add("is-visible");
  }
  function hideLabel() {
    clearTimeout(labelGraceTimer);
    labelGraceTimer = setTimeout(() => {
      label.classList.remove("is-visible");
      clearTimeout(labelCleanupTimer);
      labelCleanupTimer = setTimeout(() => {
        label.style.display = "none";
      }, LABEL_EXIT_MS);
    }, LABEL_LINGER_MS);
  }

  function navigateTo(hash) {
    const target = document.getElementById(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location.hash !== `#${hash}`) history.pushState(null, "", `#${hash}`);
    onNavigate?.(hash);
  }

  async function ensureScene() {
    if (ready || !canvas) return;
    ready = true;
    try {
      const { initKeyboardScene, supportsWebgpu } = await import(
        "./keyboard-scene.bundle.js"
      );
      if (!supportsWebgpu()) return;
      scene = await initKeyboardScene(canvas, tokens, {
        navLetters: Object.keys(NAV_KEYS),
      });
      const rect = canvas.getBoundingClientRect();
      scene.resize(rect.width, rect.height);
      scene.start();
      new ResizeObserver(([entry]) => {
        const box = entry.contentRect;
        scene?.resize(box.width, box.height);
      }).observe(canvas);
    } catch (error) {
      console.warn("Keyboard scene unavailable:", error);
    }
  }

  // Shared by real typing and clicking/tapping the 3D key directly — both
  // are "pressing the key" as far as the scene and the hold-to-activate
  // logic are concerned.
  function beginPress(letter) {
    if (!letter || held.has(letter)) return;
    scene?.pressKey(letter);
    const def = NAV_KEYS[letter];
    if (!def) return;
    const state = { activated: false };
    held.set(letter, state);
    state.labelTimer = setTimeout(() => showLabel(letter), LABEL_DELAY_MS);
    state.holdTimer = setTimeout(() => {
      state.activated = true;
      scene?.activateKey(letter);
      navigateTo(def.hash);
    }, HOLD_MS);
  }
  function endPress(letter) {
    if (!letter) return;
    scene?.releaseKey(letter);
    const state = held.get(letter);
    if (!state) return;
    held.delete(letter);
    clearTimeout(state.labelTimer);
    clearTimeout(state.holdTimer);
    hideLabel();
    if (state.activated) scene?.clearFocus();
  }
  function keyEventLetter(event) {
    if (event.key.length === 1) return event.key.toUpperCase();
    return event.key === " " ? " " : null;
  }
  addEventListener("keydown", (event) => {
    if (event.repeat) return;
    beginPress(keyEventLetter(event));
  });
  addEventListener("keyup", (event) => endPress(keyEventLetter(event)));
  addEventListener("blur", () => {
    for (const [letter, state] of held) {
      scene?.releaseKey(letter);
      clearTimeout(state.labelTimer);
      clearTimeout(state.holdTimer);
    }
    held.clear();
    hideLabel();
  });

  // Clicking/tapping a key directly is the same "press" — useful on touch
  // devices with no physical keyboard, and just more discoverable.
  const pointerLetters = new Map(); // pointerId -> letter
  canvas?.addEventListener("pointerdown", (event) => {
    if (!scene) return;
    const rect = canvas.getBoundingClientRect();
    const letter = scene.hitTestKey(
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
    if (!letter) return;
    pointerLetters.set(event.pointerId, letter);
    canvas.setPointerCapture?.(event.pointerId);
    beginPress(letter);
  });
  function releasePointer(event) {
    const letter = pointerLetters.get(event.pointerId);
    if (letter === undefined) return;
    pointerLetters.delete(event.pointerId);
    endPress(letter);
  }
  canvas?.addEventListener("pointerup", releasePointer);
  canvas?.addEventListener("pointercancel", releasePointer);
  canvas?.addEventListener("pointerleave", releasePointer);

  // A loaded URL with a hash restores the matching section directly (no
  // animated scroll — it should look like the page opened there); browser
  // back/forward moves between sections the same way a hold-activation does.
  function restoreHash(smooth) {
    const id = location.hash.slice(1);
    const behavior = smooth ? "smooth" : "auto";
    if (!id) {
      scrollTo({ top: 0, behavior });
      onNavigate?.("");
      return;
    }
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior, block: "start" });
    onNavigate?.(id);
  }
  restoreHash(false);
  addEventListener("popstate", () => restoreHash(true));

  return { ensureScene, navigateTo, get scene() { return scene; } };
}
