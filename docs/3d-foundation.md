# 3D portfolio foundation

## Architecture decision

Use **Vite + TypeScript + Three.js + Lenis** on the existing semantic HTML. A React migration would require rewriting working navigation, native dialogs, timeline, skill panels and the no-JavaScript experience. The scene and motion modules have explicit setup/disposal boundaries, so they can later be mounted from React effects if a framework migration becomes useful.

The Signal design uses new global tokens and Space Grotesk typography, with its visual and responsive rules in src/signal.css. Tailwind is optional and is not required by this foundation.

## Page and component boundaries

| Area                 | Implementation                              | Behavior                                                                                                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Main layout          | index.html, existing css/                   | Header → hero → selected work → experience and full resume → expertise → contact                                                          |
| Canvas container     | src/main.ts, src/styles.css                 | Lazy import near the viewport; stable SVG footprint; successful first frame reveals canvas                                                |
| Hero model           | src/scene.ts                                | Three metallic orbital rings, a faceted core, lighting, pointer tilt and hover highlight; layer selection through accessible HTML buttons |
| Scroll integration   | src/motion.ts                               | Lenis interpolates desktop wheel movement; native touch, anchors and keyboard scrolling                                                   |
| Scroll-linked camera | src/scene.ts                                | Scroll separates the rings and adjusts the camera, without moving the document layout                                                     |
| Work showcase        | existing case-study modules + src/motion.ts | Lazy case notes and gentle pointer tilt on project visuals                                                                                |
| Career timeline      | index.html, js/navigation.js                | Native details, keyboard controls and links; dates synchronized from JSON                                                                 |
| Skills               | js/skills.js + generated resume             | Existing five-discipline interactive selector and all 11 API skills with stated levels                                                    |
| Resume data          | tools/resume.mjs, tools/sync-resume.mjs     | Validated local snapshot, escaped static HTML, explicit refresh                                                                           |
| Accessibility        | HTML controls + lifecycle gates             | Full content and SVG survive missing WebGL, lost context or disabled JavaScript                                                           |

The 3D diagram illustrates frontend, logic and data relationships; it does not disclose an employer's internal architecture.

## Setup, step by step

1. Use Node 22.19+ in the 22.x line, or a supported newer LTS.
2. In the repository, run `npm ci` to install the locked dependencies.
3. Run `npm run dev` and visit http://127.0.0.1:4173.
4. Move the pointer over the hero, choose Interface / Logic / Foundation, and scroll. Toggle Dark mode to check the content palette; the hero stays ink in both modes.
5. To refresh public profile data, run `npm run sync:resume`. Inspect `data/resume.json` and the HTML diff. This is independent of the build.
6. Run `npm run build`; TypeScript checking runs before bundling.
7. Stop the development server, then run `npm run preview` to serve the production artifact on the same port.
8. In another terminal run `npm run test:resume`, `npm test` and `npm run test:3d`.
9. For GitHub Pages, configure the publishing process to build with `npm ci && npm run build` and upload `dist/` as its Pages artifact. The current source-root publishing setup needs that build step before publishing this revision.

No deployment was performed.

## Data integrity and freshness

Source: [public JSON endpoint](https://gitconnected.com/api/v1/resume/degydev). The importer includes profile details, profile links, roles, highlights, projects, language/library stacks, skills, education, GPA and spoken languages.

- Published snapshot: 5 role entries, 6 projects, 11 skills, 2 education entries.
- Refresh is explicit. Builds and visitors do not rely on a live third-party API.
- Displayed counts describe the snapshot; no live traffic, lending or revenue metrics were supplied.
- The API returned `yearsOfExperience: 8001`; it is excluded.
- The JSON dates differ from the rendered CV by one month for several roles. This foundation uses the JSON's literal ISO dates, formatted in UTC. It does not guess a month correction.
- The API's empty end dates are shown as Present, even where its separate current-role flag is inconsistent.
- Freelance overlaps employment and remains labeled parallel.
- LinkedIn could not be fetched; its URL comes from the user's supplied input.
- HTML is escaped and external links accept only HTTP/HTTPS.
- Editorial narratives are reviewed separately; only the generated disclosure and career date spans are rewritten by a refresh.

## Performance and accessibility

The scene uses shared procedural geometry and materials. No model, texture, HDR environment, physics engine or post-processing assets are downloaded.

The optional Three.js chunk is dynamically imported. Reduced-motion and Save-Data visitors skip it. Desktop DPR is capped at 1.75; mobile DPR at 1.25. An active-frame average can reduce DPR in 0.25 steps down to 0.75. The scene renders while interpolation is changing and stops when settled, offscreen or in a hidden tab. GPU resources and observers are disposed when reduced motion is enabled or the context is lost.

Lenis is enabled for fine-pointer devices with unrestricted motion. Touch retains native momentum. Native dialogs are excluded from wheel smoothing.

All layer selection uses real buttons and text. The canvas is decorative for assistive technology; the described SVG stays in the accessibility tree. Skills, work, career and resume details are readable without JavaScript.

**60 FPS is a target, not a validated guarantee across mobile hardware.** Review the local results in 3d-validation.md and profile physical iOS/Android devices before making a public performance claim.

## Extension points

This is the initial foundation requested in the brief. A physics skill playground, section-to-section camera choreography, and a live external metrics service are future components; they are not implemented here.

For a future GLB asset:

1. Optimize mesh and texture budgets before adding it.
2. Export a Draco-compressed GLB, preferably with KTX2 textures when needed.
3. Lazy-load Three.js GLTFLoader and DRACOLoader inside the relevant scene component.
4. Self-host the compatible Draco decoder files and configure the loader's decoder path for the deployment base.
5. Keep the SVG visible until the asset and first frame are ready; dispose geometries, textures, materials and decoder resources on teardown.
6. Measure download size and rendering cost on a physical mid-range phone.

Draco is unnecessary for the current model because the model uses procedural torus, sphere and polyhedron geometry. Adding a decoder today would add a download without reducing any asset.

## Primary references

- [Vite guide](https://vite.dev/guide/): TypeScript development and static production builds.
- [Three.js documentation](https://threejs.org/docs/): renderer, geometry, camera and resource APIs.
- [Lenis documentation](https://github.com/darkroomengineering/lenis): automatic RAF, wheel smoothing and excluded scroll regions.
