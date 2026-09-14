import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
await mkdir(".preview", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { views: [], errors: [], accessibility: [] };
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      report.errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(origin);
  await page.waitForFunction(
    () => !document.querySelector(".case-open").hidden,
  );
  const initialRequests = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => ({ name: entry.name, bytes: entry.transferSize })),
  );
  report.initialBytes = initialRequests.reduce(
    (sum, entry) => sum + entry.bytes,
    0,
  );
  assert(
    !initialRequests.some((entry) => entry.name.endsWith("case-data.js")),
    "Case notes should be lazy loaded",
  );
  const brokenAnchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .filter((link) => !document.getElementById(link.hash.slice(1)))
      .map((link) => link.hash),
  );
  assert.deepEqual(brokenAnchors, []);
  await page.locator('[data-select-layer="backend"]').click();
  assert.equal(
    await page
      .locator('[data-select-layer="backend"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.match(
    await page.locator(".layer-description").textContent(),
    /Spring Boot/,
  );
  await page.locator('[data-select-layer="interface"]').click();
  await page.screenshot({ path: ".preview/desktop-hero.png" });

  for (const name of ["fintech", "welfare", "integrations"]) {
    await page.locator(`[data-case="${name}"]`).click();
    await page.waitForFunction(() => document.querySelector(".dialog-source"));
    assert(await page.locator(".case-dialog").isVisible());
    await page
      .locator(".case-dialog")
      .evaluate((element) =>
        Promise.all(
          element.getAnimations().map((animation) => animation.finished),
        ),
      );
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.accessibility.push({
      view: `dialog-${name}`,
      violations: audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
    if (name === "fintech")
      await page.screenshot({ path: ".preview/case-study.png" });
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .locator(`[data-case="${name}"]`)
        .evaluate((element) => document.activeElement === element),
      true,
      "Dialog must restore focus",
    );
  }
  for (const skill of [
    "frontend",
    "data",
    "infrastructure",
    "engineering",
    "backend",
  ]) {
    await page.locator(`[data-skill="${skill}"]`).click();
    assert(await page.locator(`#skill-${skill}`).isVisible());
    assert.equal(await page.locator(".skill-panel:visible").count(), 1);
  }
  await page.locator('.career-track a[href="#role-ritus"]').click();
  assert.equal(await page.locator("#role-ritus").getAttribute("open"), "");
  // Native summary controls work with a keyboard, not just pointer clicks.
  await page.locator("#role-public summary").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("#role-public").getAttribute("open"), "");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => scrollTo(0, 0));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert(!overflow, `Horizontal overflow at ${width}px`);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    report.accessibility.push({
      view: `${width}px-paper`,
      violations: audit.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
    report.views.push({ width, overflow });
    if ([1440, 390].includes(width))
      await page.screenshot({
        path: `.preview/full-${width}.png`,
        fullPage: true,
      });
    if (width === 390) {
      await page.locator(".menu-toggle").click();
      assert(await page.locator("#navigation").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      await page.locator(".menu-toggle").click();
      await page.locator('#navigation a[href="#contact"]').click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      await page.screenshot({ path: ".preview/mobile-contact.png" });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".theme-toggle").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  const nightAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    view: "night",
    violations: nightAudit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: ".preview/night-hero.png" });
  assert.equal(
    await page
      .locator(".system-model")
      .evaluate((element) => getComputedStyle(element).transform),
    "none",
  );
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const fallback = await noJs.newPage();
  await fallback.goto(origin);
  assert.equal(await fallback.locator(".skill-panel:visible").count(), 5);
  assert(await fallback.locator("h1").isVisible());
  assert(
    await fallback
      .locator('a[href="mailto:munkhdelger95@gmail.com"]')
      .isVisible(),
  );
  assert.equal(await fallback.locator(".case-open:visible").count(), 0);
  assert(
    !(await fallback.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
  );
  report.noJavaScript = "Content, navigation, roles, skills and email usable";
  await writeFile(
    ".preview/check-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  assert.deepEqual(report.errors, []);
  assert(
    report.accessibility.every((result) => !result.violations.length),
    "Accessibility violations found; see .preview/check-report.json",
  );
} finally {
  await browser.close();
}
