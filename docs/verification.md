# Local verification

The 19 November 2026 finish ran on Windows with Node 24.22.1, npm 11.19.1 and the default Playwright 1.64.0 Chromium and WebKit browsers. Browser tests used the production build at `http://127.0.0.1:4403/Gift-for-Soemeone/`.

| Check | Actual result |
| --- | --- |
| Unit tests | `npm test` passed 12 of 12. It covers strict gift validation, Unicode data, link construction and deterministic geometry for both sculptures. |
| TypeScript and production build | `npm run test:e2e` ran the type check and Vite 7.3.7 production build successfully. The built package includes the project license and bundled dependency notices. |
| Full browser suite | 62 passed, 31 per engine, with zero failures or skips. It covers real clipboard copying and opening under the repository subpath, history, draft restoration, preview, replay, native-share cancellation, narrow layouts and touch emulation. |
| Reduced-motion first paint | The phone-width WebKit regression detected zero red rose pixels before the drawing-buffer fix. Both engines passed the final check, which inspects the visible screenshot before user interaction. Reduced motion and manual pause also passed frame scheduling checks. |
| Keyboard and graphics failure | Both engines passed pointer-free compose, skip navigation, preview, open and replay, plus graphics module failure, WebGL absence and simulated context loss. The note and SVG illustration stayed available when graphics failed. |
| Fresh rendered evidence | 12 screenshots at 1440 × 960 and 390 × 844 reported zero horizontal overflow and zero capture errors. The synthetic gift includes an emoji in the recipient name and Hindi text in the note. The walkthrough records compose, animated reveal, draft return and link creation. |
| Runtime requests | The local origin was the only request origin observed during capture. |
| Measured build assets | Main JavaScript 22,015 bytes (7,363 gzip). CSS 17,205 bytes (4,749 gzip). On-demand scene 473,665 bytes (119,458 gzip). |

See the [desktop creator](media/desktop-chromium-creator.png), [phone creator](media/phone-webkit-creator.png), [phone reveal](media/phone-webkit-reveal.png), [graphics fallback](media/phone-webkit-fallback.png), [8-second walkthrough](media/walkthrough.webm) and [capture measurements](media/capture-results.json).

## Verification boundaries

The 19 November run used existing dependencies matching the lockfile. A fresh registry-backed `npm ci` attempt in a separate directory hit an access error, and the advisory audit endpoint was unavailable in this environment. The earlier 5 November run recorded a successful clean install and an audit with zero reported vulnerabilities. The 19 November results give no updated advisory status.

The browser, touch and graphics checks were automated. Physical-phone frame rates and battery use, native iOS Safari and share sheet behavior, screen-reader output, and third-party handling of long links remain unverified. GitHub Actions and the published site require separate verification for this revision. The existing Pages URL is [For You](https://shubhraghavt-57.github.io/Gift-for-Soemeone/).
