import { initNavigation } from "./navigation.js";
import { initArchitecture } from "./architecture.js";
import { initSkills } from "./skills.js";
import { initCaseStudies } from "./case-studies.js";

// Independent enhancements: a failed optional interaction never hides the content.
for (const initialize of [
  initNavigation,
  initArchitecture,
  initSkills,
  initCaseStudies,
]) {
  try {
    initialize();
  } catch (error) {
    console.warn("Optional enhancement unavailable:", error);
  }
}

const motion = matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !motion.matches) {
  const reveals = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("is-pending");
        reveals.unobserve(entry.target);
      });
    },
    { threshold: 0.06 },
  );
  document.querySelectorAll(".reveal").forEach((element) => {
    // Already-visible content is never delayed by the entrance effect.
    if (element.getBoundingClientRect().top > innerHeight)
      element.classList.add("is-pending");
    reveals.observe(element);
  });
  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    reveals.disconnect();
    document
      .querySelectorAll(".is-pending")
      .forEach((element) => element.classList.remove("is-pending"));
  });
}
document.addEventListener("visibilitychange", () =>
  document.documentElement.classList.toggle("page-paused", document.hidden),
);
document.querySelector("#year").textContent = new Date().getFullYear();

const themeButton = document.querySelector(".theme-toggle");
// Paper is the default (no attribute needed); the toggle opts into the
// deep-forest night variant.
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(dark));
  themeButton.innerHTML = `${dark ? "Paper" : "Night"} mode <span aria-hidden="true">◐</span>`;
  document.querySelector('meta[name="theme-color"]').content = dark
    ? "#122820"
    : "#f1f0e9";
}
try {
  applyTheme(localStorage.getItem("degydev-theme") === "dark");
} catch {
  /* Storage is optional. */
}
themeButton.hidden = false;
themeButton.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  applyTheme(dark);
  try {
    localStorage.setItem("degydev-theme", dark ? "dark" : "light");
  } catch {
    /* Private mode remains usable. */
  }
});

const copy = document.querySelector(".copy-email");
if (navigator.clipboard?.writeText) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    const status = document.querySelector(".copy-status");
    try {
      await navigator.clipboard.writeText("munkhdelger95@gmail.com");
      status.textContent = "Email address copied.";
      copy.textContent = "Copied ✓";
    } catch {
      status.textContent =
        "Copy unavailable. Use the email link or select the address.";
      copy.textContent = "Select the address above";
    }
  });
}
