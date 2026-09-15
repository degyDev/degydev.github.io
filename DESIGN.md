# Signal — visual direction

## Idea

The portfolio presents engineering as the connection between complex systems and clear outcomes. A metallic orbital sculpture brings interface, logic and foundation around one shared core. The composition pairs a dark, spacious hero with bright project sections.

This direction replaces the earlier paper-and-forest design.

## Palette

User-selected [Coolors palette](https://coolors.co/palette/000000-14213d-fca311-e5e5e5-ffffff):

| Color  | Value   | Role                                                           |
| ------ | ------- | -------------------------------------------------------------- |
| Black  | #000000 | Hero, navigation and dark-mode background                      |
| Navy   | #14213d | Text on light backgrounds, panels and 3D ring                  |
| Orange | #fca311 | Hero emphasis, calls to action, section band and selected ring |
| Gray   | #e5e5e5 | Surfaces, secondary text on dark backgrounds and silver ring   |
| White  | #ffffff | Main background, hero text and highlights                      |

Separators use transparent mixes of these colors. Small text on white uses navy; orange surfaces use navy or black text for contrast. The 3D lights are neutral so the base materials carry the palette.

## Typography

- **Space Grotesk Variable**, self-hosted Latin WOFF2, handles headings and body text. Display headlines use weight 500, close spacing and compact leading.
- **Space Mono**, self-hosted, handles figure labels, dates and technical annotations.
- Font files use font-display: swap. The hero preloads Space Grotesk and regular Space Mono.
- Space Grotesk's OFL license is in fonts/space-grotesk-LICENSE.txt.

## Composition

1. Black navigation with the restored d. monogram.
2. Oversized three-line headline beside the orbital sculpture; on small phones, the final line wraps naturally.
3. Orange domain band separates the hero from the work.
4. Alternating project layouts pair narratives with pale technical illustrations.
5. Career milestones and expandable roles use compact cards.
6. The skill selector uses a dark core panel, rounded category buttons and a clear active state.
7. Contact and resume panels share the same spacing, typography and control shapes.

src/signal.css defines this direction over the retained component layouts. css/base.css owns the global tokens and font definitions.

## 3D and motion

The three torus meshes represent interface, logic and foundation. A faceted core and small satellite spheres give the scene depth without downloaded models or textures. Directional and point lighting create silver, navy and orange metal surfaces.

Pointer position changes perspective and lighting; hovering highlights a ring. HTML layer buttons select the matching ring. Scrolling separates the rings and moves the camera. The render loop stops once interpolation settles and while offscreen.

The matching orbital SVG is shown before the first frame and when WebGL is unavailable, a GPU context is lost, reduced motion is enabled, or Save-Data is requested. Core portfolio content stays semantic HTML.

## Brand assets

images/mark.svg restores the original d. monogram geometry, recolored navy, orange and white. tools/artifacts.mjs generates the matching social preview and touch icon from source SVG and the self-hosted font.

## Validation

See docs/3d-validation.md for current local browser checks. Physical-mobile profiling and a fresh Lighthouse run are still required before publishing a 60 FPS or Lighthouse-score claim.
