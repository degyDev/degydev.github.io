# degydev — Signal

Munkhdelger Tumenbayar's portfolio. Vite + TypeScript enhance the existing semantic HTML with a Three.js hero and Lenis scrolling. The Signal direction uses a black hero, navy and orange accents, Space Grotesk typography and a metallic orbital sculpture. The original d. logo is restored. The resume, career timeline, skill selector and case-study interactions remain available.

## Start locally

1. Install Node.js 22.19 or newer in the 22.x line (or a supported newer LTS).
2. Run `npm ci`.
3. Run `npm run dev`.
4. Open http://127.0.0.1:4173.

## Build and check

```sh
npm run build
npm run preview
```

In another terminal, with the preview running:

```sh
npm run test:resume
npm test
npm run test:3d
```

The build runs TypeScript checking and creates `dist/`. Use Vite for development; opening the source HTML directly or using the old plain-file server does not compile TypeScript. Chrome must be installed for browser checks. Reports and screenshots are saved to ignored `.preview/`.

## Refresh profile content

```sh
npm run sync:resume
npm run build
```

This fetches the public [GitConnected JSON resume](https://gitconnected.com/api/v1/resume/degydev), validates it, writes `data/resume.json`, generates the full resume disclosure in `index.html`, and updates the editorial career cards' dates. The case-study dates read from the same snapshot. Review the diff before publishing. Network/schema failure retains the previous snapshot.

Builds use the checked-in snapshot and need no API key or network request. Counts are actual resume entries, not business-outcome metrics. Profile name, biography, links, work, projects and technology lists, skills, education and languages are retained. LinkedIn's malformed API link is corrected using the supplied profile URL. An invalid experience counter is excluded.

## Architecture

```text
index.html                 Semantic layout, SVG fallback, generated full resume
src/main.ts                Existing UI + progressive scene loading
src/scene.ts               Three.js model, lighting, camera, adaptive DPR, disposal
src/motion.ts              Lenis lifecycle and project-visual tilt
src/styles.css             Canvas and resume styles
src/signal.css             Signal visual direction and responsive layouts
js/                        Existing navigation, skills and case-study modules
css/                       Existing design tokens and section styles
data/resume.json            Validated public resume snapshot
tools/resume.mjs            Normalize, sanitize and render resume records
tools/sync-resume.mjs       Explicit public API refresh
tools/check-3d.mjs          WebGL, fallback and device-emulation checks
vite.config.ts             Production build and static-asset copying
```

See [the foundation guide](docs/3d-foundation.md) for component boundaries, setup, deployment preparation and next steps. See [current validation](docs/3d-validation.md) for measured results and limitations.

## Production hosting

The [Pages workflow](.github/workflows/deploy.yml) installs dependencies, runs the TypeScript/Vite build, and publishes **`dist/`** on pushes to `main`. It can also be run manually from the Actions tab.

One-time setup: in the repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. Commit and push the workflow to `main`, then check the **Deploy site to GitHub Pages** run in Actions.

Do not use **Deploy from a branch** with the source repository root: `index.html` references `src/main.ts`, which browsers cannot execute directly. The default Pages pipeline does not run Vite; `.nojekyll` does not compile TypeScript either. The workflow compiles and bundles the JavaScript and CSS before publishing. The manifest and canonical URLs target `https://degydev.github.io/`.

## Content and design

The editorial case studies remain curated; a refresh does not overwrite their narrative. Keep claims grounded in the public resume and never invent client metrics or internal architecture. See [content provenance](docs/content-sources.md) and [design direction](DESIGN.md). The complete raw API response used for research remains ignored under `.firecrawl/`; the published JSON contains only normalized portfolio fields.
