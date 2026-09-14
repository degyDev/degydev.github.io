export function initSkills() {
  const grid = document.querySelector(".expertise-grid");
  grid.querySelector(".system-options").hidden = false;
  const buttons = [...grid.querySelectorAll("[data-skill]")];
  const panels = [...grid.querySelectorAll(".skill-panel")];
  function select(name, animate = true) {
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.skill === name),
      ),
    );
    panels.forEach((panel) => {
      panel.hidden = panel.id !== `skill-${name}`;
      panel.classList.toggle("panel-enter", !panel.hidden && animate);
    });
  }
  buttons.forEach((button) => {
    button.setAttribute("aria-controls", `skill-${button.dataset.skill}`);
    button.addEventListener("click", () => select(button.dataset.skill));
  });
  grid.classList.add("skills-enhanced");
  select("backend", false);
}
