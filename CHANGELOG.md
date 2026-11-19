# Change history

## Unreleased — finish review, 19 November 2026

- Retained the reviewed readable form, phone layout and generated-link Open gift action.
- Made skip navigation reachable with default WebKit keyboard navigation; added a pointer-free compose/preview/open/replay regression in both engines.
- Added regression coverage for a failed graphics-module download while retaining the ring fallback, Unicode personal note and replay.
- Kept the initial reduced-motion rose visible in phone-width WebKit by retaining the rendered drawing buffer. Added a browser regression that checks the composited pixels on first load.
- Kept version-1 fragments, `/Gift-for-Soemeone/`, draft return, received-gift history, text-only personal content and existing graphics/motion fallbacks.
- Added reproducible desktop/phone screenshots, a short normal-motion walkthrough, engineering decisions and fresh verification boundaries.
- Added MIT for original code, preserved dependency notices, and included notices with the static distribution.
- Kept the locked dependency versions and added MIT package metadata. Browser tests use port 4403.

This is a reviewable local finish milestone. It does not assert that these source changes have been deployed or that physical-device checks were performed.
