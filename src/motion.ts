import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function initMotion() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(pointer: fine)");
  const abort = new AbortController();
  let lenis: Lenis | undefined;
  function configure() {
    lenis?.destroy();
    lenis = undefined;
    // Touch keeps browser-native momentum. Keyboard and anchors stay native.
    if (!reduced.matches && fine.matches) {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          Boolean(node.closest("dialog, [data-native-scroll]")),
      });
      if (document.hidden) lenis.stop();
    }
  }
  const visibility = () => (document.hidden ? lenis?.stop() : lenis?.start());
  document.addEventListener("visibilitychange", visibility, {
    signal: abort.signal,
  });
  reduced.addEventListener("change", configure);
  fine.addEventListener("change", configure);
  configure();
  document.querySelectorAll<HTMLElement>(".case-visual").forEach((card) => {
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty("transform");
    };
    card.addEventListener(
      "pointermove",
      (event) => {
        if (reduced.matches || !fine.matches) return;
        const rect = card.getBoundingClientRect();
        x = (event.clientX - rect.left) / rect.width - 0.5;
        y = (event.clientY - rect.top) / rect.height - 0.5;
        if (!frame)
          frame = requestAnimationFrame(() => {
            card.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
            frame = 0;
          });
      },
      { passive: true, signal: abort.signal },
    );
    card.addEventListener("pointerleave", reset, { signal: abort.signal });
    reduced.addEventListener("change", reset, { signal: abort.signal });
    abort.signal.addEventListener("abort", reset);
  });
  return () => {
    abort.abort();
    lenis?.destroy();
    reduced.removeEventListener("change", configure);
    fine.removeEventListener("change", configure);
  };
}
