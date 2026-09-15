import { defineConfig } from "vite";
import { cp, mkdir } from "node:fs/promises";
export default defineConfig({
  base: "./",
  publicDir: false,
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  plugins: [
    {
      name: "portfolio-public-assets",
      async closeBundle() {
        await mkdir("dist", { recursive: true });
        for (const path of [
          "images",
          "fonts",
          "data",
          "robots.txt",
          "sitemap.xml",
          "site.webmanifest",
          ".nojekyll",
        ]) {
          await cp(path, `dist/${path}`, { recursive: true });
        }
      },
    },
  ],
});
