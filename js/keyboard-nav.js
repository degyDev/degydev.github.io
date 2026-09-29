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
  label.hidden = true;
  labelHost.appendChild(label);

  function showLabel(letter) {
    const def = NAV_KEYS[letter];
    if (!def || !scene) return;
    const point = scene.getKeyScreenPosition(letter);
    if (!point) return;
    label.textContent = `${letter} / ${def.label}`;
    label.style.left = `${point.x}px`;
    label.style.top = `${point.y}px`;
    label.hidden = false;
  }
  function hideLabel() {
    label.hidden = true;
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
      scene = await initKeyboardScene(canvas, tokens);
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

  function onKeyDown(event) {
    if (event.repeat) return;
    const letter =
      event.key.length === 1
        ? event.key.toUpperCase()
        : event.key === " "
          ? " "
          : null;
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
  function onKeyUp(event) {
    const letter =
      event.key.length === 1
        ? event.key.toUpperCase()
        : event.key === " "
          ? " "
          : null;
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

  addEventListener("keydown", onKeyDown);
  addEventListener("keyup", onKeyUp);
  addEventListener("blur", () => {
    for (const [letter, state] of held) {
      scene?.releaseKey(letter);
      clearTimeout(state.labelTimer);
      clearTimeout(state.holdTimer);
    }
    held.clear();
    hideLabel();
  });

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
