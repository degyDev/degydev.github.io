> Historical SVG-only validation. For the current Three.js build, see [3d-validation.md](3d-validation.md). The Lighthouse scores below have not been rerun for the 3D foundation.

# Validation — 14–15 September 2026

Updated 15 September (typography pass): added two self-hosted fonts
(Fraunces Variable for headings, Space Mono for schematic labels) in place
of the system-font stack, removed the unused Three.js/"atelier" concept
files and pre-redesign template assets (jQuery, Bootstrap, Owl Carousel,
Unicons — none were referenced by the shipped page).

Updated again 15 September (palette pass): replaced the dark-near-black
default with a paper/forest-green/terracotta palette (a light theme is now
the default; the toggle opts into a deep-forest night variant), per
request, directed toward leoparpeix.com's paper-and-forest-ink direction —
see DESIGN.md. Reran the checks below against the current build after each
pass; the accessibility and Lighthouse numbers below are from the palette
pass.

The redesign was served locally over HTTP and tested with installed Google Chrome through Playwright. No deployment or live-site change was performed.

## Browser and interaction checks

- Viewports: 1440, 1024, 768, 390 and 320 CSS pixels; no horizontal overflow.
- No browser JavaScript errors or failed HTTP assets in the checked flows.
- Three case-study dialogs: loading, Escape dismissal, native focus containment and return to the opening button.
- All five expertise categories switch to the correct panel.
- Architecture layers update their selected state and contextual description.
- Career links open the corresponding role; native summaries support keyboard activation.
- Mobile menu opens, closes with Escape, and closes after anchor navigation.
- Paper/Night theme preference persists after reload.
- Reduced motion removes model transforms and animated transitions.
- JavaScript disabled: content, navigation, native career disclosures, all skill descriptions and contact remain available; inactive enhanced controls are hidden.
- Visual review: desktop hero, project case studies and expertise; full mobile page and mobile welfare diagram.

## Accessibility

The automated axe WCAG 2 A/AA and WCAG 2.1 AA checks reported zero violations in the tested desktop/mobile views, both color modes and all three project dialogs. Dialog entrance animations were allowed to finish before contrast measurement. Keyboard behavior was also tested separately. Automated checks do not replace a complete assistive-technology audit.

## Lighthouse mobile run (15 September, after the palette pass)

| Category       | Local score |
| -------------- | ----------- |
| Performance    | 99          |
| Accessibility  | 100         |
| Best practices | 100         |
| SEO            | 100         |

- First contentful paint: 1.4 s
- Largest contentful paint: 2.1 s
- Total blocking time: 0 ms
- Cumulative layout shift: 0
- Total page transfer: Total size was 177 KiB (up from 92 KiB pre-fonts; the two self-hosted woff2 files account for the difference and are preloaded so the hero heading is not blocked on font discovery)

These are one local Lighthouse run under its simulated mobile conditions, not a guarantee of production scores. The report is saved in ignored .preview/lighthouse-mobile.report.report.html and .json. Public hosting compression, cache headers, network conditions and real devices can change the results.

`node tools/check.mjs` (Playwright + axe) was also rerun on the current build: zero overflow at 1440/1024/768/390/320px, zero console errors, zero broken anchors, zero axe violations across five breakpoints of the Paper (default) theme, the Night (toggle) theme and all three case-study dialogs, and the JS-disabled fallback still exposes content, roles, skills and email. The palette pass initially introduced one real regression the axe run caught: --subtle text failed AA on the slightly-darker --surface (stone) background inside three components; fixed with a --subtle-strong token scoped to those containers (see css/base.css). Rerunning confirmed zero violations.

## Production characteristics

No production npm dependencies, WebGL context, tracking scripts or CDN assets. Two fonts are self-hosted (fonts/fraunces-variable.woff2, fonts/space-mono-{400,700}.woff2, both OFL-licensed, Latin-subset, font-display: swap) rather than pulled from Google Fonts or another CDN. The case-study data module is dynamically imported on first use. Scroll work is requestAnimationFrame-coalesced, the architecture only updates while visible, decorative animation pauses in hidden documents, and prefers-reduced-motion is respected.

Generated social and touch-icon images are local assets. Canonical URL, OpenGraph metadata, Person structured data, sitemap, robots file and web manifest are included. Git diff whitespace validation passes. Development dependencies are lockfile-pinned; npm audit reports no vulnerabilities after updating the Lighthouse tool.
