import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(".");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(root, `.${name === "/" ? "/index.html" : name}`);
    if (!file.startsWith(root + sep) || /(?:^|[\\/])\./.test(name)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8`,
      })
      .end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1", () =>
  console.log("Portfolio: http://127.0.0.1:4173"),
);
