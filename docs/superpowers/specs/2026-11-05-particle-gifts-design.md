# For You: particle gift website

Status: approved and implemented, 5 November 2026.

## Intent and delivery

Build a website someone can personalize and send to a girlfriend or partner. The user has specified GitHub as the destination for the project. Deliver ordinary source code, documentation, tests, and a reproducible build in its own repository. Make the output compatible with GitHub Pages. Repository creation, visibility, and enabling public hosting must be distinguished from preparing the code; the user has selected the public repository `SHUBHRAGHAVT-57/Gift-for-Soemeone` for source publication. Public Pages hosting remains a separate manual step.

The user approved the reusable static creator. Product title: For You; source repository: `SHUBHRAGHAVT-57/Gift-for-Soemeone`.

## Approaches and proposed choice

1. GitHub project with a static website: build with Vite, TypeScript, and Three.js, and produce files GitHub Pages can serve. Names and notes travel in the gift URL fragment. This supports creation, preview, and sharing without accounts or a server. Limits: gifts cannot be centrally revoked, links expose their contents to anyone possessing them, and lengthy notes make lengthy links. Recommended for the requested first version.
2. GitHub project with a server-backed application: adds stored gifts, short IDs, and possible future editing or access controls, but requires separate hosting, persistent storage, and abuse protection. Defer unless these features become requirements.
3. Managed Site as the primary deliverable: previously considered, but the user's GitHub direction makes a normal repository the intended source of truth.

The platform direction is the user's. The user approved the static architecture and the defaults below before implementation.

## Sender experience

- A complete creator at the base URL with recipient name, sender name, a personal note, and a choice of rose or diamond-ring reveal.
- Names allow up to 60 characters and the note up to 600 characters; trim surrounding whitespace and require meaningful text before generating a gift.
- A clear live or explicit preview, with an easy return to editing.
- A copy-link action with an accessible fallback if clipboard permission is denied. Offer native sharing when supported, without sending any message automatically.
- Share links must retain the actual deployment subpath, including a GitHub Pages repository path. Preview must not overwrite or lose the form contents.

## Recipient experience

1. Open a clean invitation addressed to the recipient, with a single obvious button.
2. Activate the button with touch, mouse, or keyboard. Particles gather into the selected rose or diamond ring.
3. Reveal the personal note and sender's name as readable HTML. Provide replay and an unobtrusive way to create another gift.

The rose is the default. The ring is explicitly labeled as a proposal-themed choice, so ordinary gifts do not accidentally imply engagement. The recipient view must not show the creator form or generic marketing sections.

## Visual and motion direction

A dark, restrained stage with warm ivory typography, generous spacing, and a single dominant particle sculpture. Use muted crimson/pink for the rose, silvery particles for the ring, and restrained atmospheric accents. Choose typography during implementation and self-host any bundled font assets with their licenses.

The references show a diamond ring assembled from bright points, with orbiting sparkles, and a rose formed from tiny characters/points. Recreate these recognizable structures procedurally; do not embed the recordings or reproduce the code-editor UI. Target the reference character and motion, without claiming exact replication.

Use Three.js point geometry and shaders for the primary scene. Keep particle updates on the GPU where appropriate, cap pixel ratio and particle counts, and pause rendering when the page is hidden. A restrained entrance and a slow rotation are sufficient; avoid extra scroll sequences and decorative effect layers.

## Accessibility, reliability, and privacy

- Accessible labels, visible focus, sufficient contrast, usable touch targets, responsive layouts, and keyboard-operable controls.
- Respect reduced motion: show the completed sculpture and note with minimal transition, and avoid continuous rotation.
- If WebGL is unavailable or its context is lost, keep the invitation and note usable and show a deliberate static flower/ring fallback.
- Parse shared content defensively with explicit schema and size limits. Render user content as text; never interpret it as HTML.
- Explain beside sharing that anyone with the link can read the gift. URL-fragment content is not encrypted or password protected; avoid analytics and third-party requests that could unnecessarily disclose it.
- Reject malformed or oversized gift data gracefully and provide a route back to the creator.
- Keep sender content out of the source repository and generated public HTML. Do not commit the user's videos, their extracted frames, credentials, machine-specific paths, or personal draft gifts.
- No account system, uploads, music autoplay, database, tracking dashboard, or paid service is required for this version.

## Verification and deliverables

The implementer owns the exact module/component structure, procedural geometry, shader details, typography, and dependency versions. Prefer an uncomplicated static project over a framework requiring server hosting.

Verify the production build, gift serialization round trips, Unicode and punctuation, invalid data handling, text injection safety, creation/preview/replay/sharing, keyboard access, reduced motion, WebGL fallback, narrow and desktop layouts, and repository-subpath links. Test the final artifact after its last changes. Report browser/desktop evidence separately from physical-phone performance, which cannot be assumed from headless Chromium.

Deliver source, README instructions, meaningful automated checks, and an optional GitHub Pages workflow ready for the selected repository. Show the finished local result and actual check results before publishing repository contents or enabling public hosting.
