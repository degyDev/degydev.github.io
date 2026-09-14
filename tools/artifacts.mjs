import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const html = await readFile("index.html", "utf8");
  const svg = html.match(/<svg\s+class="system-model"[\s\S]*?<\/svg>/)[0];
  const styles = await readFile("css/sections.css", "utf8");
  // page.setContent has no base URL, so @font-face's relative "../fonts/…"
  // is rewritten to an absolute file:// URL for this offline render only.
  const base = (await readFile("css/base.css", "utf8")).replace(
    /url\("\.\.\/fonts\//g,
    `url("${pathToFileURL(resolve("fonts")).href}/`,
  );
  await page.setContent(
    `<style>${base}${styles}body{width:1200px;height:630px;padding:55px 65px;position:relative;overflow:hidden}header{font:13px var(--mono);letter-spacing:2px;color:#d9efa3}h1{font-size:76px;margin-top:59px;line-height:1.02}p{font-size:16px;margin-top:25px;max-width:480px}svg{position:absolute;right:10px;top:85px;width:550px}footer{position:absolute;bottom:45px;left:65px;right:65px;border-top:1px solid #343b31;padding-top:20px;display:flex;justify-content:space-between;font:12px var(--mono);color:#a1a89c}</style><header>MUNKHDELGER TUMENBAYAR / DEGYDEV</header><h1>I build systems<br>that people<br><em>depend on.</em></h1><p>Senior Full-Stack Engineer<br>Software Architect / Technical Lead</p>${svg}<footer><span>PUBLIC SERVICES → FINTECH → PRODUCTION</span><span>degydev.github.io ↗</span></footer>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "images/social.png" });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(
    `<style>body{margin:0}svg{width:180px;height:180px}</style>${await readFile("images/mark.svg", "utf8")}`,
  );
  await page.screenshot({ path: "images/apple-touch-icon.png" });
  await mkdir(".preview", { recursive: true });
  console.log(
    "Generated social preview and touch icon from original vector artwork.",
  );
} finally {
  await browser.close();
}
