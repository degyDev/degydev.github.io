export function initCaseStudies() {
  const dialog = document.querySelector(".case-dialog");
  if (!dialog.showModal) return;
  const content = dialog.querySelector(".dialog-content");
  let dataPromise;
  let opener;
  let request = 0;
  function add(tag, text, parent = content, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  }
  function render(study) {
    content.replaceChildren();
    add("p", study.label, content, "eyebrow");
    add("h2", study.title).id = "dialog-title";
    add("p", study.intro);
    for (const section of study.sections) {
      add("h3", section.title);
      if (section.items) {
        const list = add("ul", "");
        section.items.forEach((item) => add("li", item, list));
      } else add("p", section.text);
    }
    add("h3", "How the pieces relate");
    const flow = add("div", "", content, "dialog-flow");
    study.flow.forEach((step, index) => {
      if (index) add("b", "→", flow).setAttribute("aria-hidden", "true");
      add("span", step, flow);
    });
    add(
      "p",
      "Conceptual domain view based on the public project description. It does not represent a disclosed internal architecture.",
      content,
      "dialog-note",
    );
    const sources = add("div", "", content, "dialog-source");
    for (const source of study.sources) {
      const link = add("a", `${source.label} ↗`, sources, "text-link");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }
  document.querySelectorAll(".case-open").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      opener = button;
      const ticket = ++request;
      content.replaceChildren();
      add("h2", "Opening system notes…").id = "dialog-title";
      dialog.showModal();
      dialog.scrollTop = 0;
      try {
        dataPromise ||= import("./case-data.js").catch((error) => {
          dataPromise = null;
          throw error;
        });
        const { cases } = await dataPromise;
        if (ticket === request && dialog.open)
          render(cases[button.dataset.case]);
      } catch {
        content.replaceChildren();
        add("h2", "System notes unavailable").id = "dialog-title";
        add(
          "p",
          "The project summary is still on the page. The full CV is also available below.",
        );
        const link = add("a", "View full CV ↗", content, "text-link");
        link.href = "https://gitconnected.com/degydev/resume";
      }
    });
  });
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    request++;
    opener?.focus({ preventScroll: true });
  });
}
