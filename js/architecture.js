const descriptions = {
  interface:
    "The experience people touch. React, Angular & mobile collaboration.",
  backend: "Business rules, APIs & messaging. Java, Spring Boot & Node.js.",
  data: "The foundations that hold it together. SQL, Redis & infrastructure.",
};

export function initArchitecture() {
  const figure = document.querySelector(".architecture");
  const stage = figure.querySelector(".architecture-stage");
  const layers = [...figure.querySelectorAll("[data-layer]")];
  figure.querySelector(".layer-controls").hidden = false;
  const controls = [...figure.querySelectorAll("[data-select-layer]")];
  const description = figure.querySelector(".layer-description");
  const coordinate = figure.querySelector(".architecture-coordinate");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(pointer: fine)");
  const compact = matchMedia("(max-width: 600px)");
  let visible = false;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function selectLayer(name, announce = true) {
    figure.dataset.selected = name;
    controls.forEach((control) =>
      control.setAttribute(
        "aria-pressed",
        String(control.dataset.selectLayer === name),
      ),
    );
    layers.forEach((layer) =>
      layer.classList.toggle("is-active", layer.dataset.layer === name),
    );
    description.textContent = descriptions[name];
    if (announce) description.setAttribute("aria-live", "polite");
  }
  controls.forEach((control) =>
    control.addEventListener("click", () =>
      selectLayer(control.dataset.selectLayer),
    ),
  );
  selectLayer("interface", false);

  function draw() {
    frame = 0;
    const progress = Math.max(
      0,
      Math.min(
        1,
        -document.querySelector(".hero").getBoundingClientRect().top /
          innerHeight,
      ),
    );
    const animate = !motion.matches && !compact.matches;
    figure.style.setProperty(
      "--tilt-x",
      `${animate ? pointerY * -5 + progress * 5 : 0}deg`,
    );
    figure.style.setProperty("--tilt-y", `${animate ? pointerX * 8 : 0}deg`);
    figure.style.setProperty("--spread", `${animate ? progress * 38 : 0}px`);
  }
  function schedule() {
    if (visible && !frame) frame = requestAnimationFrame(draw);
  }
  stage.addEventListener(
    "pointermove",
    (event) => {
      if (!pointer.matches || motion.matches || compact.matches) return;
      const rect = stage.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      coordinate.textContent = `X ${Math.round(pointerX * 20)
        .toString()
        .padStart(2, "0")} / Y ${Math.round(pointerY * 20)
        .toString()
        .padStart(2, "0")}`;
      schedule();
    },
    { passive: true },
  );
  stage.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
    coordinate.textContent = "X 00 / Y 00";
    schedule();
  });
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    figure.classList.toggle("is-visible", visible);
    schedule();
  }).observe(figure);
  addEventListener("scroll", schedule, { passive: true });
  motion.addEventListener("change", draw);
  compact.addEventListener("change", draw);
}
