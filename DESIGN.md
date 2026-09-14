# Design direction — Systems in Motion

## Concept

The site's governing idea is the brief's own: **systems in motion**. Every
major visual — the hero's exploded isometric model, the lending-lifecycle
flow, the welfare orbit map, the five-layer expertise selector, the
step-by-step career track — is a diagram of how parts connect, not
decoration layered on top of a bio. The story it tells: this is what it
looks like to think in systems.

Deliberately avoided: spinning 3D globes, particle fields, glassmorphism,
neon glow, gradient text, logo walls, fake terminals and typing effects.
Motion exists only where it clarifies a relationship (a layer separating on
scroll, a flow advancing, a panel switching) — never as ambient decoration.

## Typography

Two self-hosted faces carry the personality that "Arial + Courier New"
cannot:

- **Display — Fraunces Variable** (`fonts/fraunces-variable.woff2`, OFL).
  A characterful, high-contrast serif used for every headline (`h1`/`h2`/
  `h3`). Its registered `wght` and `opsz` axes are both variable in this
  build, so `font-optical-sizing: auto` lets the browser pick the right
  optical size per heading automatically — no manual tuning per breakpoint.
  This is the one deliberately "loud" choice: a serif headline reads as an
  edited, premium product rather than another sans-grotesk dev portfolio.
- **Mono — Space Mono** (`fonts/space-mono-{400,700}.woff2`, OFL). Carries
  every schematic label: eyebrows, coordinates, stack lines, diagram text.
  Its slightly eccentric letterforms suit annotation-style captions
  ("FIG. 01", "X 00 / Y 00") better than a neutral code font would.
  Weight 700 is imported only for the isolated place that needs it (button
  handling on a `<summary>` etc.); most mono text stays 400.
- **Body — system sans stack** (`Arial, Helvetica, sans-serif`). Paragraph
  copy stays on the zero-weight system stack; the two custom faces do the
  work of feeling designed, so body text can stay invisible and fast.

Both custom faces are self-hosted (no Google Fonts / CDN request), subset
to Latin only, and `font-display: swap`. The two fonts the hero paints
with (`Fraunces Variable`, `Space Mono` regular) are `<link rel=preload>`d
in `<head>` to keep the largest-contentful-paint heading off a second
render pass.

## Tokens

- Dark (default): paper-on-near-black — `--bg:#101311`, `--text:#f0f0e8`,
  `--accent:#d9efa3` (the only saturated color in the system).
  Light (opt-in toggle): `--bg:#f1f1e8`, `--text:#1b2319`,
  `--accent:#425b22`.
- Desktop gutters scale with viewport (`clamp(22px, 5.5vw, 88px)`); mobile
  gutter floors at 22px.
- Corners square throughout. No card chrome around ordinary text — text
  sits directly on the page; only diagrams and the case-study visual panels
  get a surface fill.

## Page flow

1. Overlaid navigation (name, section anchors, scroll progress bar).
2. Hero: headline + an exploded isometric system diagram (interface /
   logic / foundation layers) that responds to pointer position and to
   scroll progress, and that visitors can also drive directly via three
   layer buttons — no scroll-jacking, native scroll only.
3. Selected work as engineering case studies (problem → contribution →
   stack), each paired with an original conceptual diagram of that
   project's domain (lending lifecycle, welfare service map). Two flagship
   projects get full diagrammatic treatment; two supporting projects use
   compact cards. A "system notes" dialog on the flagship cases expands
   into fuller problem/role/architecture detail, lazy-loaded on demand.
4. Career told as increasing scope (Build → Connect → Scale the scope →
   Lead & architect) via a horizontal track linked to native `<details>`
   role write-ups — scannable first, expandable on demand.
5. Expertise as five selectable disciplines (backend, frontend, data,
   infrastructure, engineering) rather than a logo wall, each panel naming
   where that skill was actually used.
6. An oversized closing statement and direct contact links (email with
   copy-to-clipboard, LinkedIn, GitHub, CV, Stack Overflow).

## Engineering constraints

Static HTML/CSS/ES modules, GitHub Pages compatible, zero runtime
dependencies (no bundler, no framework, no WebGL). The architecture model
is a hand-authored SVG animated with CSS custom properties and a small
`requestAnimationFrame`-coalesced pointer/scroll handler; it only updates
while its `IntersectionObserver` reports it visible. Case-study detail
content is a separate ES module, dynamically imported on first open.
`prefers-reduced-motion` removes the model's transform response and the
scroll-reveal transitions; the page remains fully readable with CSS and JS
both disabled. See `docs/content-sources.md` for career-fact provenance and
`docs/validation.md` for the cross-viewport, accessibility and performance
checks this design was held to.

## Content grounding

All employer names, project names, dates, responsibilities and stack lists
trace to the public CV and the brief itself (see `docs/content-sources.md`).
No invented metrics, user counts, or performance numbers. Diagrams are
labeled as conceptual domain views, not disclosed internal architecture.
