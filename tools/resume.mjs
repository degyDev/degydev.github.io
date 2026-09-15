const text = (value) => (typeof value === "string" ? value.trim() : "");
const list = (value) => (Array.isArray(value) ? value : []);
const strings = (value) => list(value).map(text).filter(Boolean);
export const escapeHtml = (value) =>
  text(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function safeUrl(value) {
  const input = text(value);
  if (!input) return "";
  try {
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`,
    );
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
function date(value) {
  const result = text(value);
  if (!/^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/.test(result)) return "";
  return result;
}
export function normalizeResume(raw, fetchedAt = new Date().toISOString()) {
  if (
    !raw ||
    typeof raw !== "object" ||
    !text(raw.basics?.name) ||
    !Array.isArray(raw.work) ||
    !Array.isArray(raw.projects) ||
    !Array.isArray(raw.skills)
  ) {
    throw new Error(
      "Unexpected resume schema. Existing snapshot was not changed.",
    );
  }
  const records = (value) =>
    list(value).filter((item) => item && typeof item === "object");
  return {
    source: "https://gitconnected.com/api/v1/resume/degydev",
    fetchedAt,
    basics: {
      name: text(raw.basics.name),
      headline: text(raw.basics.headline || raw.basics.label),
      summary: text(raw.basics.summary),
      url: safeUrl(raw.basics.url),
      profiles: records(raw.basics.profiles)
        .map((p) => ({
          network: text(p.network),
          // The API embeds a full URL inside its LinkedIn username. Use the supplied canonical profile.
          url:
            text(p.network).toLowerCase() === "linkedin"
              ? "https://www.linkedin.com/in/degydev/"
              : safeUrl(p.url),
        }))
        .filter((p) => p.url),
    },
    work: records(raw.work)
      .map((w) => ({
        name: text(w.name || w.company),
        position: text(w.position),
        url: safeUrl(w.url),
        startDate: date(w.startDate),
        endDate: date(w.endDate),
        summary: text(w.summary),
        highlights: strings(w.highlights),
        location: text(w.location),
      }))
      .filter((w) => w.name),
    projects: records(raw.projects)
      .map((p) => ({
        name: text(p.name || p.displayName),
        description: text(p.description || p.summary),
        startDate: date(p.startDate),
        endDate: date(p.endDate),
        url: safeUrl(p.url || p.website),
        roles: strings(p.roles),
        highlights: strings(p.highlights),
        stack: [
          ...new Set([
            ...strings(p.languages),
            ...strings(p.libraries),
            ...strings(p.keywords),
          ]),
        ],
      }))
      .filter((p) => p.name),
    skills: records(raw.skills)
      .map((s) => ({
        name: text(s.name),
        level: text(s.level),
        keywords: strings(s.keywords),
      }))
      .filter((s) => s.name),
    education: records(raw.education).map((e) => ({
      institution: text(e.institution),
      area: text(e.area),
      studyType: text(e.studyType),
      startDate: date(e.startDate),
      endDate: date(e.endDate),
      score: text(e.score),
      courses: strings(e.courses),
    })),
    languages: records(raw.languages).map((l) => ({
      name: text(l.language),
      fluency: text(l.fluency),
    })),
    // Do not publish the API's invalid yearsOfExperience value or internal account identifiers.
  };
}
export function month(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 7 ? value + "-01" : value));
}
const dates = (record) =>
  `${month(record.startDate) || "Date not supplied"} — ${month(record.endDate) || "Present"}`;
const paragraph = (value) => (value ? `<p>${escapeHtml(value)}</p>` : "");
const bullets = (values) =>
  values.length
    ? `<ul>${values.map((v) => `<li>${escapeHtml(v)}</li>`).join("")}</ul>`
    : "";
const link = (url, label) =>
  url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`
    : "";
export function renderResume(data) {
  return `<details class="resume-snapshot">
  <summary>Explore the full resume · ${data.work.length} roles / ${data.projects.length} projects</summary>
  <p class="resume-date">Resume snapshot · ${escapeHtml(data.fetchedAt.slice(0, 10))} · ${link("https://gitconnected.com/degydev/resume", "GitConnected")} · <a href="data/resume.json" download>Download JSON</a></p>
  <h3>${escapeHtml(data.basics.headline)}</h3>
  ${paragraph(data.basics.summary)}
  <p>${data.basics.profiles.map((p) => link(p.url, p.network)).join(" · ")}</p>
  <div class="resume-metrics"><span><strong>${data.work.length}</strong> role entries</span><span><strong>${data.projects.length}</strong> projects</span><span><strong>${data.skills.length}</strong> listed skills</span></div>
  <h3>Skills</h3>
  <ul class="resume-skills">${data.skills.map((s) => `<li>${escapeHtml(s.name)}${s.level ? ` · ${escapeHtml(s.level)}` : ""}${s.keywords.length ? ` · ${escapeHtml(s.keywords.join(", "))}` : ""}</li>`).join("")}</ul>
  <h3>Work history</h3>
  ${data.work.map((w) => `<article class="resume-record"><h4>${escapeHtml(w.position)} · ${escapeHtml(w.name)}</h4><p class="resume-date">${escapeHtml(dates(w))}${w.name === "Freelance" ? " · Parallel contract work" : ""}</p>${paragraph(w.location)}${paragraph(w.summary)}${bullets(w.highlights)}${link(w.url, w.name)}</article>`).join("")}
  <h3>Projects</h3>
  ${data.projects.map((p) => `<article class="resume-record"><h4>${escapeHtml(p.name)}</h4><p class="resume-date">${escapeHtml(dates(p))}</p>${paragraph(p.description)}${paragraph(p.roles.join(", "))}${bullets(p.highlights)}${paragraph(p.stack.join(" / "))}${link(p.url, "Visit project")}</article>`).join("")}
  <h3>Education</h3>
  ${data.education.map((e) => `<article class="resume-record"><h4>${escapeHtml(e.studyType)} · ${escapeHtml(e.area)}</h4>${paragraph(e.institution)}<p class="resume-date">${escapeHtml(dates(e))}</p>${paragraph(e.score ? "GPA: " + e.score : "")}${bullets(e.courses)}</article>`).join("")}
  <h3>Languages</h3>${bullets(data.languages.map((l) => `${l.name} · ${l.fluency}`))}
  </details>`;
}
