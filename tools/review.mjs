import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.goto("http://127.0.0.1:4173");
  for (const [name, target] of [
    ["desktop-work", ".case-fintech"],
    ["desktop-expertise", "#systems"],
    ["desktop-contact", "#contact"],
  ]) {
    await page
      .locator(target)
      .evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `.preview/${name}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, target] of [
    ["mobile-hero", "#about"],
    ["mobile-fintech", ".lending-visual"],
    ["mobile-welfare", ".welfare-visual"],
    ["mobile-skills", ".expertise-grid"],
  ]) {
    await page
      .locator(target)
      .evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `.preview/${name}.png` });
  }
} finally {
  await browser.close();
}
