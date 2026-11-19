# Engineering a small gift that survives ordinary browser failures

For You turns a name and a personal note into a shareable particle rose or proposal ring. Its central constraint is that the recipient should still receive the words when sharing permissions, animation, graphics or browser navigation behave differently from the author's machine.

## Decisions and tradeoffs

| Decision | Reason | Cost or boundary |
| --- | --- | --- |
| Versioned gift data in `#gift=` | A static host can serve the same page for every gift. Names and notes stay out of the request URL sent to that host. Existing version-1 links keep working. | Encoding is not encryption. Anyone with the full link can read the note; links can be retained or truncated by messaging apps. No revocation or central edits. |
| Strict validation and text nodes | Decode untrusted UTF-8, reject unsupported shapes/control characters, preserve Unicode and line breaks, then assign personal content through `textContent`. | Names are limited to 60 code points and notes to 600. Long links still depend on the sender's messaging service. |
| One scene module, loaded separately | Keep the HTML, form and note independent of the Three.js download. Procedural geometry avoids a large image/video payload. | The graphics chunk is still the largest asset; a static illustration must be useful on its own. |
| SVG while graphics load or fail | Both gifts retain a deliberate illustration if WebGL is absent, the module download fails, or the graphics context is lost. The note remains HTML. | The fallback is a still illustration rather than a GPU reveal. |
| Elapsed time and bounded rendering | Particle gathering runs in a shader, with capped pixel ratio and particle counts. Hidden/offscreen scenes stop scheduling frames, and disposal releases observers and graphics resources. | Headless browser checks cannot measure real phone battery use or guarantee frame rates. |
| Motion preferences belong to the recipient | Reduced motion shows the complete sculpture without a continuous frame loop; a manual pause control is also available when useful. | Reduced motion intentionally skips the gathering animation. |
| Preview state and received links have separate history behavior | Back/Forward can restore a preview and draft, while making a new gift preserves the received URL in browser history. In-page anchors do not rebuild the form. | Drafts stay in the current tab's memory; reload clears them. No persistent personal-note storage is added. |
| Selectable link and direct Open gift action | Clipboard denial still leaves a usable link; opening it checks the exact recipient flow. Editing invalidates the old result. | Native sharing and clipboard permission depend on the browser. Cancellation is not presented as success. |

## Review findings carried through to evidence

The reviewed UI draft already enlarged the creator's fields, labels and helper text, stacked name/theme controls at phone widths, and added an Open gift link beside the generated URL. Those improvements were retained without adding an account system or changing the published repository path.

A new pointer-free journey reproduced a narrower accessibility failure: default Playwright WebKit keyboard navigation skipped the plain skip-link anchor. The same journey passed in Chromium. An explicit `tabindex="0"` on that skip link made it reachable as the first keyboard control in both engines. The existing handler still prevents navigation from replacing a received `#gift=` fragment.

A separate new regression blocks the graphics module download and verifies that the ring illustration, Unicode note and replay remain available. It passed against the existing fallback implementation, so that path needed coverage rather than another rendering layer.

The first phone-width WebKit load reported an active WebGL scene and drew rose pixels into the GPU buffer, but the compositor showed a blank stage. The context now retains its drawing buffer when the scene starts with reduced motion. The static frame stays visible without a continuous frame loop. A screenshot-based regression checks the rose pixels that users actually see.

The 19 November capture uses synthetic sample content. The screenshots are desktop Chromium and phone-sized WebKit renders with reduced motion enabled. The [short walkthrough](media/walkthrough.webm) records the normal animated reveal. [Verification](verification.md) records final counts, measured asset sizes and the fresh-install limitation.

## Finish before expanding

The finish milestone covers legible creation, sharing recovery, received-gift/replay/history behavior, graphics and motion fallbacks, reproducible evidence and dependency notices. New themes, keepsake export, accounts and a backend are outside it. A subsequent change should name a concrete user problem, preserve version-1 links and personal-content boundaries, and pass unit/build/both-engine journeys before its PR is considered complete. Hosting or repository metadata changes are separate from this local source evidence.
