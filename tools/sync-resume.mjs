import { readFile, writeFile, mkdir } from "node:fs/promises";
import { normalizeResume, renderResume, month } from "./resume.mjs";

const args = process.argv.slice(2);
const local = args.indexOf("--from");
let raw;
if (local >= 0) {
  if (!args[local + 1]) throw new Error("--from requires a JSON file path");
  raw = JSON.parse(
    (await readFile(args[local + 1], "utf8")).replace(/^\uFEFF/, ""),
  );
} else {
  const response = await fetch(
    "https://gitconnected.com/api/v1/resume/degydev",
    {
      signal: AbortSignal.timeout(15000),
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok)
    throw new Error(
      `Resume fetch failed: HTTP ${response.status}. Existing snapshot retained.`,
    );
  raw = await response.json();
}
const data = normalizeResume(raw);
let html = await readFile("index.html", "utf8");
const start = "<!-- resume:start -->";
const end = "<!-- resume:end -->";
if (!html.includes(start) || !html.includes(end))
  throw new Error("Resume insertion markers are missing; no files changed.");
const pattern = new RegExp(start + "[\\s\\S]*?" + end);
html = html.replace(
  pattern,
  () => start + "\n" + renderResume(data) + "\n" + end,
);
// Keep the editorial career cards' dates aligned with the canonical JSON.
const ids = {
  "Ritus LLC": "role-ritus",
  "Mongolian Properties": "role-properties",
  "information technology center of custom, taxation and finance":
    "role-public",
  "Ashid Capital LLC": "role-ashid",
  Freelance: "role-freelance",
};
for (const work of data.work) {
  const id = ids[work.name];
  if (!id) continue;
  const pattern = new RegExp(
    '(<details id="' +
      id +
      '"[^>]*>[\\s\\S]*?<span class="role-date mono">)[\\s\\S]*?(</span)',
  );
  const label =
    `${month(work.startDate)} — ${month(work.endDate) || "Present"}${work.name === "Freelance" ? " · Parallel" : ""}`.toUpperCase();
  html = html.replace(pattern, (_, before, after) => before + label + after);
}
await mkdir("data", { recursive: true });
await writeFile("data/resume.json", JSON.stringify(data, null, 2) + "\n");
await writeFile("index.html", html);
console.log(
  `Synced ${data.work.length} roles, ${data.projects.length} projects, ${data.skills.length} skills. Review the diff before publishing.`,
);
