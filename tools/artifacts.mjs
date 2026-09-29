// Regenerates images/social.png (screenshot of the real hero, WebGPU and
// all — most authentic representation of the actual site) and
// images/apple-touch-icon.png (rendered from images/mark.svg). Requires
// the local server running (npm run dev) since it navigates to the live
// page rather than faking a stand-in.
import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";

const origin = "http://127.0.0.1:4173";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--enable-unsafe-webgpu"],
});
try {
  // The hero's composition needs real height to lay out without the
  // headline and keyboard colliding — render taller than the final OG
  // card and crop a well-framed 1200x630 slice out of it, rather than
  // squeezing the live layout into the OG aspect ratio directly.
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(origin);
  // Give the deferred WebGPU import + first frame time to land.
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: "images/social.png",
    clip: { x: 0, y: 70, width: 1200, height: 630 },
  });

  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(
    `<style>body{margin:0}svg{width:180px;height:180px}</style>${await readFile("images/mark.svg", "utf8")}`,
  );
  await page.screenshot({ path: "images/apple-touch-icon.png" });
  await mkdir(".preview", { recursive: true });
  console.log(
    "Generated social preview (live hero screenshot) and touch icon.",
  );
} finally {
  await browser.close();
}
