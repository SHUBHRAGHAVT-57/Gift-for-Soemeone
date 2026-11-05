# Local verification

Verified on 5 November 2026. After the initial pause, the user supplied the GitHub repository and repaired npm access; installation, audit, build and tests were rerun successfully.

| Check | Actual result |
| --- | --- |
| `npm test` | 10 passed, 0 failed |
| `npm run test:e2e` | TypeScript check and Vite production build succeeded; 19 Chromium tests passed, 0 failed; exit 0 |
| Production repository-subpath behavior | Browser journeys ran under `/Gift-for-Soemeone/`; a real copied link preserved the path, removed an unrelated query, and opened the intended gift |
| Rendering | Both WebGL sculptures rendered visible particles without browser or shader errors |
| Accessibility and fallbacks | Keyboard opening, skip navigation, focus restoration, theme/motion labels, reduced motion, pause/resume, WebGL absence and context loss covered |
| Personal content and sharing | Unicode round trips, strict payload limits, malformed links, text-only rendering, draft preservation, clipboard fallback, stale-result invalidation and native-share cancellation covered |
| Responsive inspection | Desktop and phone-width creator/recipient views inspected; 320px and 375px viewport overflow checks passed |
| Static illustration | Corrected fallback rose inspected; its geometry stayed within the SVG viewBox |
| External requests | Production capture observed only the local origin; no external runtime requests |
| Clean dependency installation | `npm ci --cache artifacts/npm-clean-cache --no-fund` installed 27 packages from a fresh cache and audited 28 packages successfully |
| Matching browser setup | `npm exec playwright install chromium` completed successfully; the final suite used Playwright's default browser without a custom executable path |
| Dependency advisory audit | `npm audit --audit-level=low` succeeded and reported 0 vulnerabilities |
| Workflow action references | All five pinned GitHub Actions `action.yml` URLs returned HTTP 200 |

A fresh code review identified a recipient skip-link failure and incorrect accessible labels after theme and pause state changes. Regression tests failed before the fixes and passed in the final suite. A separate visual check identified misplaced SVG petals in the no-WebGL fallback; the coordinate-system fix was included in the final run.

The local environment used Node 24.22.1 and npm 11.19.1. The earlier run used locally restored dependencies and a browser executable override because network access was blocked. Those limitations were resolved for the final run: a clean registry-backed install succeeded, the standard Playwright browser setup succeeded, and all checks passed without the override. The user's `allowScripts.esbuild` configuration was preserved.

These are Chromium and local-source results. They do not verify physical-phone frame rates, battery consumption, Safari, every messaging app's long-link behavior, or live GitHub Pages hosting. The source publication target is [SHUBHRAGHAVT-57/Gift-for-Soemeone](https://github.com/SHUBHRAGHAVT-57/Gift-for-Soemeone); check its Actions tab for remote CI results. Pages deployment is manually triggered and is separate from source publication.
