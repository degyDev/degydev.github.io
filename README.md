# degydev portfolio

Munkhdelger Tumenbayar's static portfolio. The site uses semantic HTML, CSS, local fonts, and browser JavaScript modules for navigation, skill selection, case studies, and theme switching.

## Start locally

1. Install Node.js 22.19 or newer.
2. Run `npm ci` to install development and test dependencies.
3. Run `npm run dev`.
4. Open http://127.0.0.1:4173.

## Check the site

With the local server running, run `npm test` in another terminal. Chrome must be installed for these Playwright checks. They cover navigation, case studies, responsive layouts, accessibility, theme persistence, and the no-JavaScript fallback. Reports and screenshots are saved to ignored `.preview/`.

There is no `build` or `preview` script in `package.json`. `npm run dev` starts a persistent server; it does not generate deployment files.

## Structure

```text
index.html       Portfolio content and semantic layout
css/             Styles and motion preferences
js/              Browser modules and checked-in keyboard scene bundle
fonts/           Local fonts and licenses
images/          Icons and social image
src/             Keyboard scene source
dev/            Keyboard preview (development only)
tools/           Local server, browser checks, and development utilities
docs/            Content sources, resume snapshot, and validation notes
```

## Deploy to GitHub Pages

The deployment target is https://degydev.github.io/. The workflow is [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml); GitLab CI configuration is not used.

1. In the GitHub repository, open **Settings > Pages > Build and deployment** and select **GitHub Actions** as the source.
2. Commit and push to `main`, or run **Deploy site to GitHub Pages** manually from the Actions tab.
3. Check the workflow's deployment result for the published URL.

The workflow copies `index.html`, `.nojekyll`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, and the `css/`, `js/`, `fonts/`, and `images/` directories into `dist/`, then uploads and deploys that directory. It needs no npm install or build step because the production assets are already checked in. Development tools, source files, documentation, and dependencies are excluded from the published site.

## Content and design

See [content provenance](docs/content-sources.md), [design direction](DESIGN.md), and [validation notes](docs/validation.md). Keep portfolio claims grounded in the source material.
