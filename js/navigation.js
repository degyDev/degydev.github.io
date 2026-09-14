export function initNavigation() {
  const menu = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#navigation");
  const mobile = matchMedia("(max-width: 600px)");
  const closeMenu = () => menu.setAttribute("aria-expanded", "false");
  const updateMenu = () => {
    menu.hidden = !mobile.matches;
    closeMenu();
  };
  updateMenu();
  mobile.addEventListener("change", updateMenu);
  menu.addEventListener("click", () =>
    menu.setAttribute(
      "aria-expanded",
      String(menu.getAttribute("aria-expanded") !== "true"),
    ),
  );
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const progress = document.querySelector(".reading-progress");
  const sections = links.map((link) => document.querySelector(link.hash));
  let queued = false;
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    let current = null;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= innerHeight * 0.4)
        current = section.id;
    });
    links.forEach((link) => {
      if (link.hash === `#${current}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    queued = false;
  }
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  new ResizeObserver(schedule).observe(document.body);
  update();
  function openLinkedRole() {
    const role = document.getElementById(location.hash.slice(1));
    if (role?.tagName === "DETAILS") role.open = true;
  }
  document.querySelectorAll(".career-track a").forEach((link) =>
    link.addEventListener("click", () => {
      document.querySelector(link.hash).open = true;
    }),
  );
  addEventListener("hashchange", openLinkedRole);
  openLinkedRole();
}
