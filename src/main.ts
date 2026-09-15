import "../js/main.js";
import "./styles.css";
import "./signal.css";
import { initMotion } from "./motion";

const disposeMotion = initMotion();
const figure = document.querySelector<HTMLElement>(".architecture");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const connection = (
  navigator as Navigator & { connection?: { saveData?: boolean } }
).connection;
let disposeScene: (() => void) | undefined;
let loading = false;
let destroyed = false;
let inView = false;

async function loadScene() {
  if (
    !figure ||
    !inView ||
    reduced.matches ||
    connection?.saveData ||
    loading ||
    disposeScene ||
    destroyed
  )
    return;
  loading = true;
  try {
    const { createHeroScene } = await import("./scene");
    if (!destroyed && !reduced.matches) disposeScene = createHeroScene(figure);
  } catch (error) {
    // The authored SVG stays visible until the first successful WebGL frame.
    console.warn(
      "3D enhancement unavailable; using the system diagram.",
      error,
    );
  } finally {
    loading = false;
  }
}
const observer = new IntersectionObserver(
  ([entry]) => {
    inView = entry.isIntersecting;
    void loadScene();
  },
  { rootMargin: "100px" },
);
if (figure) observer.observe(figure);
function updateMotionPreference() {
  if (reduced.matches) {
    disposeScene?.();
    disposeScene = undefined;
  } else void loadScene();
}
reduced.addEventListener("change", updateMotionPreference);
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    destroyed = true;
    observer.disconnect();
    reduced.removeEventListener("change", updateMotionPreference);
    disposeScene?.();
    disposeMotion();
  });
