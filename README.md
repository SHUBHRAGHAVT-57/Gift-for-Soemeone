# For You

A little universe for someone you love. Create a particle rose or diamond ring, add a personal note, and send a link that opens into a gift.

[Open For You](https://shubhraghavt-57.github.io/Gift-for-Soemeone/)

The rose is for everyday love. The ring is explicitly a proposal theme. Both are procedural 3D point sculptures, rather than embedded videos. The recipient opens the reveal, reads the note, and can replay it.

## Run locally

Use Node.js **22.18 or later**, preferably Node 24, and npm.

```sh
npm ci
npm run dev
```

Open the address Vite prints. For a production preview:

```sh
npm run build
npm run preview
```

This is a static Vite + TypeScript + Three.js project. It needs no API keys, account service, database, external fonts, or runtime CDN. The build output is `dist/`. Relative asset paths support either a domain root or a GitHub Pages repository subpath.

## Create a gift

1. Choose the rose or proposal ring.
2. Enter their name, your name, and your own words.
3. Preview exactly what they will open; return to editing without losing the draft.
4. Create and copy the gift link, or use native sharing when the browser supports it.

Names support up to 60 Unicode code points each; the note supports 600. The app preserves line breaks and renders names and notes as text. If clipboard access is unavailable, it displays a selectable link for manual copying.

**The link contains the note.** Anyone with the complete link can read it. The gift is encoded in the URL fragment (`#gift=…`), not encrypted, password protected, or stored in a database. Fragments are normally excluded from HTTP requests, but browsers, messaging services and anyone receiving a pasted link may still retain the full link. There are no accounts, analytics, tracking pixels, or uploads in this app. Drafts live only in the current tab; reloading the creator clears them.

A localhost link works only on your own machine. Publish the website before sending gifts to someone on another device. Gifts depend on the published site remaining at that address; there is no central edit or revoke feature. Long Unicode notes can create long links, which some messaging apps may truncate. Link previews show the site's generic description, not the personal note.

## GitHub repository

Source: [SHUBHRAGHAVT-57/Gift-for-Soemeone](https://github.com/SHUBHRAGHAVT-57/Gift-for-Soemeone).

To work on a separate local copy:

```sh
git clone https://github.com/SHUBHRAGHAVT-57/Gift-for-Soemeone.git
cd Gift-for-Soemeone
npm ci
npm run dev
```

The default branch is `main`. Build output, dependencies, local handoff notes, test artifacts and local caches are ignored. The source recordings are not included.

### Optional GitHub Pages hosting

1. In the repository, open **Settings → Pages**, and choose **GitHub Actions** as the source.
2. Open **Actions → Deploy to GitHub Pages → Run workflow** on `main`.
3. Wait for the deployment to succeed and open the URL shown by GitHub.
4. Generate gift links from that published URL.

The deployment workflow is **manual** so adding the source to a repository does not automatically publish the website. GitHub Pages availability depends on repository visibility and account plan. Public Pages hosting and a private source repository are separate choices.

## Checks

```sh
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Browser tests build and serve the production output under `/Gift-for-Soemeone/`, exercising the actual GitHub repository subpath in Chromium and WebKit. They cover creation, preview, replay, Back/Forward navigation, preview reload recovery, Unicode notes, safe text rendering, malformed links, copying, native-share cancellation, both WebGL sculptures, delayed module loading, slow frames, reduced motion, pause/resume, graphics fallback, context loss, narrow layouts and emulated touch interactions. CI runs both browsers on pushes and pull requests.

If you already have a compatible Chromium executable, set `PLAYWRIGHT_EXECUTABLE_PATH` instead of downloading that browser; the override applies only to the Chromium project. WebKit uses its own Playwright installation. Do not commit a machine-specific path.

## Accessibility and rendering

- Meaningful content and controls use HTML; the canvas is decorative.
- Labeled form controls, visible keyboard focus, a skip link, keyboard-operable reveals and focus restoration on returning to editing. Missing required fields receive focus when previewing; length errors identify the affected name or note.
- Reduced-motion preferences stop continuous motion and show the completed sculpture. A manual motion control also pauses animation.
- Static SVG illustrations retain the gift's meaning when WebGL is unavailable or its context is lost.
- Geometry is created once. Gathering runs in a shader; pixel ratio and particle counts are capped. Reveal progress follows elapsed time, so low frame rates do not artificially stretch the animation. Rendering pauses when the tab or sculpture is hidden and resources are disposed on view changes.

Headless Chromium and WebKit checks do not certify physical-phone frame rates, battery consumption, actual iOS Safari behavior, or every messaging app's handling of long links. The recordings inspired the geometry and reveal; this is not an exact frame-by-frame recreation.

## Source map

| File            | Responsibility                                                         |
| --------------- | ---------------------------------------------------------------------- |
| `src/gift.ts`   | Strict gift validation, Unicode-safe encoding, decoding and share URLs |
| `src/shapes.ts` | Deterministic rose and faceted ring point geometry                     |
| `src/scene.ts`  | GPU reveal, rendering lifecycle, motion preferences and fallback       |
| `src/main.ts`   | Creator, recipient, preview and sharing interactions                   |
| `src/art.ts`    | Static fallback illustrations and small interface icons                |
| `src/style.css` | Responsive layout, typography and interaction styling                  |
| `tests/`        | Pure behavior tests and browser journeys                               |

See `docs/verification.md` for the checks actually run in the implementation environment.
