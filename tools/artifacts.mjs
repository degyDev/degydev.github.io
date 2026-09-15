import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const html = await readFile("index.html", "utf8");
  const svg = html.match(/<svg\s+class="system-model"[\s\S]*?<\/svg>/)[0];
  const font = (await readFile("fonts/space-grotesk-variable.woff2")).toString(
    "base64",
  );
  await page.setContent(`<style>
    @font-face{font-family:Signal;src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:300 700}
    *{box-sizing:border-box}body{margin:0;background:#000000;color:#ffffff;font-family:Signal,Arial,sans-serif;width:1200px;height:630px;padding:45px 60px;overflow:hidden}
    header{font-size:15px;letter-spacing:1px;color:#e5e5e5}.brand-initial{font-family:Arial,sans-serif;font-size:30px;font-weight:700;letter-spacing:-3px;margin-right:8px}.brand-initial>span{color:#ffffff}header b{color:#fca311;margin-right:20px}
    h1{font-size:87px;line-height:.96;letter-spacing:-6px;font-weight:500;margin:64px 0 0;position:relative;z-index:1}em{font-style:normal;color:#fca311}
    p{font-size:15px;color:#e5e5e5;margin-top:26px;line-height:1.6}
    svg{position:absolute;right:5px;top:85px;width:560px;height:450px}
    .orbit-ring{fill:none;stroke:#e5e5e5;stroke-width:17}.orbit-edge{fill:none;stroke:#ffffff;stroke-width:2}
    [data-layer=interface] .orbit-ring{stroke:#fca311}.orbit-core{fill:#fca311;stroke:#ffffff;stroke-width:2}.orbit-guide{fill:none;stroke:#14213d;stroke-width:1;stroke-dasharray:2 8}
    footer{position:absolute;bottom:35px;left:60px;right:60px;border-top:1px solid color-mix(in srgb, #e5e5e5 25%, transparent);padding-top:18px;display:flex;justify-content:space-between;color:#e5e5e5;font-size:12px}
    </style><header><b><span class="brand-initial">d<span>.</span></span> degydev</b> MUNKHDELGER TUMENBAYAR</header><h1>Complex<br>systems.<br><em>Clear impact.</em></h1><p>Senior Full-Stack Engineer<br>Software Architect / Technical Lead</p>${svg}<footer><span>FINTECH / PUBLIC INFRASTRUCTURE / PRODUCT ENGINEERING</span><span>degydev.github.io ↗</span></footer>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "images/social.png" });
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(
    `<style>body{margin:0}svg{width:180px;height:180px}</style>${await readFile("images/mark.svg", "utf8")}`,
  );
  await page.screenshot({ path: "images/apple-touch-icon.png" });
  await mkdir(".preview", { recursive: true });
  console.log("Generated Signal social preview and touch icon.");
} finally {
  await browser.close();
}
