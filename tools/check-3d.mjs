import { chromium } from "playwright";
import assert from "node:assert/strict";
import AxeBuilder from "@axe-core/playwright";
import { writeFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const origin = "http://127.0.0.1:4173";
const report = {};
await mkdir(".preview", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__draws = 0;
    for (const method of ["drawElements", "drawArrays"]) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) {
        window.__draws++;
        return original.apply(this, args);
      };
    }
  });
  await page.goto(origin);
  await page.waitForSelector('.architecture[data-webgl="ready"] canvas');
  assert(
    await page.evaluate(() => window.__draws > 0),
    "WebGL must issue draw calls",
  );
  const bounds = await page.locator(".hero-canvas").evaluate((canvas) => ({
    width: canvas.width,
    css: canvas.getBoundingClientRect().width,
  }));
  assert(bounds.width / bounds.css <= 1.76);
  await page.locator('[data-select-layer="backend"]').click();
  assert.equal(
    await page.locator(".architecture").getAttribute("data-selected"),
    "backend",
  );
  await page.screenshot({ path: ".preview/3d-desktop.png" });
  report.desktop = "WebGL renders, layer controls work, DPR capped";
  report.frameTiming = await page.evaluate(async () => {
    const stage = document.querySelector(".architecture-stage");
    const rect = stage.getBoundingClientRect();
    const times = [];
    let last = performance.now();
    for (let i = 0; i < 120; i++) {
      await new Promise((resolve) =>
        requestAnimationFrame((time) => {
          times.push(time - last);
          last = time;
          stage.dispatchEvent(
            new PointerEvent("pointermove", {
              clientX: rect.left + rect.width * (0.5 + Math.sin(i / 8) * 0.3),
              clientY: rect.top + rect.height * 0.5,
              pointerType: "mouse",
            }),
          );
          resolve();
        }),
      );
    }
    times.shift();
    times.sort((a, b) => a - b);
    return {
      medianMs: times[Math.floor(times.length * 0.5)],
      p95Ms: times[Math.floor(times.length * 0.95)],
      samples: times.length,
    };
  });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(300);
  assert.equal(
    await page.evaluate(() => window.__draws),
    before,
    "Offscreen canvas must stop drawing",
  );
  report.offscreen = "No WebGL draws while hero is offscreen";
  await page.evaluate(() => scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !document.querySelector(".hero-canvas"));
  assert.equal(
    await page
      .locator(".system-model")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  report.reducedMotionToggle = "Canvas disposed; SVG restored";
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForSelector('.architecture[data-webgl="ready"] canvas');
  await page.locator(".hero-canvas").evaluate((canvas) => {
    const gl = canvas.getContext("webgl2");
    gl.getExtension("WEBGL_lose_context").loseContext();
  });
  await page.waitForFunction(() => !document.querySelector(".hero-canvas"));
  assert.equal(
    await page
      .locator(".system-model")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  report.contextLoss = "SVG restored after losing the GPU context";

  const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  const requests = [];
  reduced.on("request", (request) => requests.push(request.url()));
  await reduced.goto(origin);
  await reduced.waitForTimeout(350);
  assert(
    !requests.some((url) => /\/scene[-.]/.test(url)),
    "Reduced motion must skip the scene download",
  );
  report.reducedMotionLoading = "No scene chunk downloaded";

  const blocked = await browser.newPage();
  await blocked.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl2" || type === "webgl") return null;
      return original.call(this, type, ...args);
    };
  });
  await blocked.goto(origin);
  await blocked.waitForTimeout(500);
  assert.equal(await blocked.locator(".hero-canvas").count(), 0);
  await blocked.locator('[data-select-layer="data"]').click();
  assert.equal(
    await blocked
      .locator('[data-select-layer="data"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  report.noWebGL = "Interactive SVG layer controls remain usable";

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(origin);
  await mobile.waitForSelector('.architecture[data-webgl="ready"] canvas');
  const ratio = await mobile
    .locator(".hero-canvas")
    .evaluate((c) => c.width / c.getBoundingClientRect().width);
  assert(ratio <= 1.26, "Mobile DPR must be capped");
  assert(
    !(await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
  );
  await mobile.screenshot({ path: ".preview/3d-mobile.png", fullPage: true });
  await mobile
    .locator(".hero")
    .screenshot({ path: ".preview/3d-mobile-hero.png" });
  report.mobile = {
    dpr: ratio,
    overflow: false,
    note: "Chrome device emulation, not physical-device profiling",
  };

  const noJs = await browser.newPage({ javaScriptEnabled: false });
  await noJs.goto(origin);
  await noJs.locator(".resume-snapshot > summary").click();
  assert.equal(
    await noJs.locator(".resume-snapshot .resume-record").count(),
    13,
  );
  await noJs.setViewportSize({ width: 390, height: 844 });
  assert(
    !(await noJs.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
  );
  await reduced.setViewportSize({ width: 390, height: 844 });
  await reduced.locator(".resume-snapshot > summary").click();
  const resumeAudit = await new AxeBuilder({ page: reduced })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    resumeAudit.violations.map((v) => v.id),
    [],
  );
  report.resumeAccessibility = "Expanded resume: zero axe violations at 390px";
  const manifest = await reduced.evaluate(async () => {
    const url = document.querySelector("link[rel=manifest]").href;
    const data = await (await fetch(url)).json();
    return (await fetch(new URL(data.icons[0].src, url))).ok;
  });
  assert(manifest, "Manifest icon URL must resolve in the built site");
  report.staticResume =
    "All 5 roles, 6 projects and 2 education entries readable without JavaScript";
  assert.deepEqual(errors, []);
  report.errors = errors;
  await writeFile(".preview/3d-report.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
