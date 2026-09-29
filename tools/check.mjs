import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.SITE_URL || "http://127.0.0.1:4173";
const sections = {
  a: "about",
  s: "skills",
  d: "experience",
  f: "work",
  g: "current",
  z: "education",
  x: "archive",
  c: "contact",
  v: "resume",
  b: "links",
};
await mkdir(".preview", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { views: [], errors: [], navigation: [] };
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const requests = [];
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("response", (response) => {
      requests.push(response.url());
      if (response.status() >= 400)
        report.errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(origin, { waitUntil: "networkidle" });
    assert.match(await page.title(), /Munkhdelger Tumenbayar/);
    assert.equal(await page.locator("canvas.keyboard-canvas").count(), 1);
    assert(
      requests.some((url) => url.endsWith("/js/keyboard-scene.bundle.js")),
      "Keyboard scene bundle must load",
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert(!overflow, `Horizontal overflow at ${width}px`);
    report.views.push({ width, overflow });
    for (const id of Object.values(sections))
      assert.equal(await page.locator(`#${id}`).count(), 1);
    if (width === 1440) {
      await page.keyboard.down("a");
      await page.waitForTimeout(50);
      await page.keyboard.up("a");
      assert.equal(
        new URL(page.url()).hash,
        "",
        "A short press must not navigate",
      );
      for (const [key, id] of Object.entries(sections)) {
        await page.keyboard.down(key);
        try {
          await page.waitForFunction(
            (hash) => location.hash === `#${hash}`,
            id,
          );
        } finally {
          await page.keyboard.up(key);
        }
        report.navigation.push(id);
      }
      await page.goBack();
      await page.waitForFunction(() => location.hash === "#resume");
      await page.goto(`${origin.replace(/\/$/, "")}/#skills`, {
        waitUntil: "networkidle",
      });
      assert.equal(new URL(page.url()).hash, "#skills");
      assert(await page.locator("#skills").isVisible());
    }
    if (width === 1440 || width === 390) {
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.screenshot({ path: `.preview/keyboard-${width}.png` });
    }
    await context.close();
  }
  const fallbackContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const fallback = await fallbackContext.newPage();
  await fallback.goto(origin);
  assert(await fallback.locator("h1").isVisible());
  for (const id of Object.values(sections))
    assert(await fallback.locator(`#${id}`).isVisible());
  assert(
    await fallback
      .locator('a[href="mailto:munkhdelger95@gmail.com"]')
      .isVisible(),
  );
  assert(
    !(await fallback.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
  );
  report.noJavaScript = "Portfolio sections and contact links remain available";
  assert.deepEqual(report.errors, []);
} finally {
  await writeFile(
    ".preview/check-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
