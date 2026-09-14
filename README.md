# degydev — Systems in Motion

Personal portfolio for Munkhdelger Tumenbayar. Plain HTML, CSS and JavaScript modules. No production dependencies, build step, WebGL or CDN requests. Two display fonts are self-hosted locally (see `fonts/`) rather than pulled from a CDN.

## Preview

Run `npm run dev`, then open http://127.0.0.1:4173. Node.js 22 or later is used for development tooling. Any static HTTP server can serve the site. ES modules require HTTP rather than opening index.html as a file.

## Deployment

The root `index.html` and relative asset paths remain compatible with the existing GitHub Pages repository. Publish the repository root using the repository's configured Pages branch. No framework migration or new deployment service is required. This change does not publish or change GitHub settings.

## Structure

- `index.html`: semantic content, inline architecture artwork, metadata and structured data. Core content is readable without JavaScript.
- `css/base.css`: design tokens, typography, navigation, document and print styles.
- `css/sections.css`: responsive section layouts and original system diagrams.
- `css/motion.css`: optional motion and reduced-motion overrides.
- `js/main.js`: progressive enhancement, entry reveals, theme preference and email copying.
- `js/architecture.js`: layer selection, pointer perspective and scroll-linked separation; no permanent JavaScript render loop.
- `js/navigation.js`: native-anchor navigation, mobile menu and reading progress.
- `js/skills.js`: linked discipline buttons and contextual skill panels.
- `js/case-studies.js` / `js/case-data.js`: keyboard-accessible native dialogs and dynamically imported project notes.
- `images/mark.svg`, `images/social.png`, `images/apple-touch-icon.png`: original identity and sharing assets.
- `fonts/`: self-hosted Fraunces Variable (headings) and Space Mono (schematic labels), both OFL-licensed; see `DESIGN.md`.
- `docs/content-sources.md`: factual provenance and editorial decisions.
- `docs/validation.md`: cross-viewport, accessibility and performance results this design was checked against.

The pre-redesign template (jQuery, Bootstrap, Owl Carousel, Unicons, Sass source, stock illustrations) has been removed — none of it was requested by the shipped page.

## Checks

Install development tools with `npm ci`. Start the preview server in another shell, then run `npm test`. Tests use installed Google Chrome through Playwright. They cover mobile and desktop overflow, asset errors, dialogs and restored focus, keyboard controls, discipline selection, persistent theme, reduced motion, no-JavaScript fallback, and axe WCAG A/AA checks. Screenshots and reports go to ignored `.preview/`.

Run `node tools/artifacts.mjs` to regenerate the social image and touch icon from the original vector artwork. Run `npx prettier --write index.html css/base.css css/sections.css css/motion.css js/main.js js/navigation.js js/architecture.js js/skills.js js/case-studies.js js/case-data.js tools/*.mjs` to format the maintained source.

Lighthouse reports measure a local static-server run; hosting, network and browser conditions affect live scores. There is no runtime dependency on the test tools.

## Content updates

Edit visible summaries in index.html and the corresponding deeper notes in js/case-data.js. Keep role dates aligned with the public CV. Conceptual project diagrams intentionally do not claim to expose internal architecture. Do not add inferred business metrics, private implementation details, or unverified project ownership.
