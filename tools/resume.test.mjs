import test from "node:test";
import assert from "node:assert/strict";
import { normalizeResume, renderResume, safeUrl, month } from "./resume.mjs";
const base = () => ({
  basics: { name: "Developer", yearsOfExperience: 8001 },
  work: [],
  projects: [],
  skills: [],
});
test("rejects malformed upstream responses instead of replacing the snapshot", () => {
  assert.throws(() => normalizeResume({ error: "Unavailable" }), /schema/);
});
test("excludes invalid metrics and internal fields; keeps concurrent roles", () => {
  const raw = base();
  raw.work = [
    { name: "Freelance", startDate: "2023-03-01" },
    { name: "Employer", startDate: "2023-03-01" },
  ];
  const result = normalizeResume(raw);
  assert.equal(result.work.length, 2);
  assert.equal("yearsOfExperience" in result.basics, false);
  assert.equal(month(result.work[0].startDate), "Mar 2023");
});
test("normalizes public links without admitting script or data URLs", () => {
  assert.equal(safeUrl("ebarimt.mn"), "https://ebarimt.mn/");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("data:text/html,hello"), "");
  assert.equal(safeUrl("https://example.com"), "https://example.com/");
});
test("untrusted resume content is escaped before static HTML generation", () => {
  const raw = base();
  raw.basics.summary = "<img src=x onerror=alert(1)>";
  raw.projects = [
    {
      name: "<script>evil</script>",
      url: "javascript:alert(1)",
      languages: ["Java"],
      libraries: ["Java", "React"],
    },
  ];
  const data = normalizeResume(raw, "2026-09-15T00:00:00Z");
  const html = renderResume(data);
  assert(!html.includes("<script>"));
  assert(!html.includes("<img"));
  assert(!html.includes("javascript:"));
  assert(html.includes("&lt;img"));
  assert.deepEqual(data.projects[0].stack, ["Java", "React"]);
});
