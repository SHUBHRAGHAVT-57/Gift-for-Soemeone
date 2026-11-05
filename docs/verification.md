# Local verification

Verified on 5 November 2026. After the initial pause, the user supplied the GitHub repository and repaired npm access; installation, audit, build and tests were rerun successfully.

| Check | Actual result |
| --- | --- |
| `npm test` | 12 passed, 0 failed |
| `npm run test:e2e` | TypeScript check and Vite production build succeeded; 54 browser tests passed (27 Chromium and 27 WebKit), 0 failed or skipped; exit 0 |
| Production repository-subpath behavior | Browser journeys ran under `/Gift-for-Soemeone/`; a real copied link preserved the path, removed an unrelated query, and opened the intended gift |
| Rendering | Both WebGL sculptures rendered visible particles without browser or shader errors |
| Accessibility and fallbacks | Keyboard opening, skip navigation, required-field focus, field-specific validation, focus restoration, theme/motion labels, reduced motion, pause/resume, WebGL absence and context loss covered; inert motion controls hidden |
| Personal content and sharing | Unicode round trips, strict payload limits, malformed links, text-only rendering, draft preservation, clipboard fallback, stale-result invalidation and native-share cancellation covered |
| Responsive inspection | Desktop and phone-width creator/recipient views inspected; 320px and 375px viewport overflow checks passed; real Playwright touch events exercised preview/open/replay/back in both engines |
| Browser history | Back/Forward, malformed-link recovery, received-gift preservation, reload of preview and invalid Forward-preview recovery covered in both engines |
| Slow rendering | A 300ms frame-cadence regression test confirmed reveal completion follows elapsed time in both engines; hidden-tab/offscreen pauses remain intact |
| Static illustration | Corrected fallback rose inspected; its geometry stayed within the SVG viewBox |
| External requests | Production capture observed only the local origin; no external runtime requests |
| Clean dependency installation | `npm ci --cache artifacts/npm-clean-cache --no-fund` installed 27 packages from a fresh cache and audited 28 packages successfully |
| Matching browser setup | Standard Playwright Chromium and WebKit installations completed successfully; the final suite used default browser executables without a custom path |
| Dependency advisory audit | `npm audit --audit-level=low` succeeded and reported 0 vulnerabilities |
| Workflow action references | All five pinned GitHub Actions `action.yml` URLs returned HTTP 200 |

A fresh code review identified a recipient skip-link failure and incorrect accessible labels after theme and pause state changes. Regression tests failed before the fixes and passed in the final suite. A separate visual check identified misplaced SVG petals in the no-WebGL fallback; the coordinate-system fix was included in the final run.

The local environment used Node 24.22.1 and npm 11.19.1. The earlier run used locally restored dependencies and a browser executable override because network access was blocked. Those limitations were resolved for the final run: a clean registry-backed install succeeded, the standard Playwright browser setup succeeded, and all checks passed without the override. The user's `allowScripts.esbuild` configuration was preserved.

The follow-up audit reproduced and fixed three browser-history failures, missing preview validation focus, misleading validation messages and an inert motion control in fallback mode. A fresh review identified stale preview history markers after reload or invalid Forward navigation; both paths were reproduced before their fix. Cross-browser testing also exposed frame-delta clamping that stretched the reveal on slow frames; a throttled-frame regression failed before the clamp was removed. The final complete suite passed after these changes. WebKit clipboard permissions are configured for that browser rather than reusing Chromium's permission names.

These are Chromium, WebKit and local-source results. They do not certify physical-phone frame rates, battery consumption, actual iOS Safari behavior or every messaging app's long-link handling. Source and remote workflow results are available at [SHUBHRAGHAVT-57/Gift-for-Soemeone](https://github.com/SHUBHRAGHAVT-57/Gift-for-Soemeone). Pages deployment is manually triggered; the website address is [For You](https://shubhraghavt-57.github.io/Gift-for-Soemeone/). The deployment result and a live-browser check must be verified independently of these local results.
