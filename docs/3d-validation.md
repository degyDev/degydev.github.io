# 3D foundation validation — 15 September 2026

These checks apply to the current Signal visual direction on the Vite/Three.js foundation. The Lighthouse numbers in the earlier validation.md describe the preceding SVG-only site and must not be attributed to this build.

## Completed

- Production build and strict TypeScript checks.
- Resume importer tests: malformed API responses, invalid experience exclusion, concurrent roles, safe URLs, HTML escaping and technology deduplication.
- Chrome WebGL rendering and accessible layer buttons.
- Desktop and mobile DPR caps.
- No WebGL draws while the hero is offscreen.
- Reduced motion dynamically disposes the renderer and restores the SVG.
- Reduced-motion initial load skips the scene chunk.
- Simulated GPU context loss and unavailable WebGL both preserve the SVG experience.
- Full resume is available without JavaScript.
- Existing navigation, case-dialog focus restoration, skills, career and theme regression checks.
- No horizontal overflow at 1440, 1024, 768, 390 or 320 CSS pixels.
- Zero axe violations in the tested page states and three case-study dialogs.
- No browser JavaScript errors or failed assets in the regression flows.

## Artifacts and scope

Ignored .preview/ contains check-report.json, 3d-report.json, desktop/mobile screenshots and existing regression screenshots. The 3D test records requestAnimationFrame intervals while it drives pointer movement. These describe local browser scheduling, not a GPU benchmark or proof of physical-mobile performance.

The initial build emitted an optional scene chunk around 137 kB gzip, with a roughly 9.5 kB gzip main JavaScript chunk. The scene exceeds Vite's default 500 kB uncompressed chunk warning threshold; it is already loaded separately and omitted for reduced-motion/Save-Data users.

Physical phone profiling, a new Lighthouse run, assistive-technology review and live-host verification remain outside these completed local checks.

## Signal design pass

The design replaces the paper palette and serif headlines with an ink hero, cobalt/orange accents, Space Grotesk, an orbital sculpture and matching SVG/social assets. The default and dark content modes were checked along with all five viewport widths. Low-contrast welfare labels and a 320px skill-selector overflow found during the first pass were corrected. The expanded resume has zero axe violations at 390px.

## User palette and logo pass

Applied #000000, #14213d, #fca311, #e5e5e5 and #ffffff across the UI, 3D materials, SVG fallback, social image and icons. Restored the d. monogram. The production build and browser suites were checked again after this change.
