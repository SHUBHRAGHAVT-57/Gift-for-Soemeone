# Particle Gifts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build a GitHub-ready creator of personal, shareable particle rose and ring gifts.

**Architecture:** Static Vite/TypeScript site. A bounded, versioned payload in the URL fragment opens a dedicated recipient experience. Three.js renders procedural point sculptures; semantic HTML owns all meaningful content and interactions.

**Tech Stack:** Vite, TypeScript, Three.js, Node test runner, Playwright.

**Spec:** ../specs/2026-11-05-particle-gifts-design.md

## Global Constraints

- Names allow up to 60 characters and the note up to 600 characters.
- No account system, uploads, music autoplay, database, tracking dashboard, or paid service.
- Relative assets and share URLs must retain GitHub Pages repository subpaths.
- Links are readable by anyone possessing them; no encryption claims.
- Reduced motion, WebGL fallback, safe text rendering and keyboard access ship with the core flow.
- Preserve all existing projects. No commits, pushes or public hosting during local implementation.

## Review Focus

- Unicode, malformed base64 and oversized input: reject invalid data without losing the creator.
- GitHub Pages subpaths and query strings: generated links preserve the deployment path and omit unrelated queries.
- Preview, Back, replay and theme changes: retain drafts, restore focus, avoid orphaned render loops.
- WebGL absence/context loss and reduced-motion preference changes: keep content accessible and stop unnecessary rendering.
- Clipboard denial and canceled native sharing: provide a manual copy fallback without a false success message.

## File boundaries

- `src/gift.ts`: payload schema, validation, encoding, decoding and URL creation.
- `src/shapes.ts`: deterministic rose/ring positions and colors without browser dependencies.
- `src/scene.ts`: renderer, shaders, animation, resize/visibility/motion handling and disposal.
- `src/main.ts`, `src/style.css`, `index.html`: creator and recipient UI and safe state transitions.
- `tests/*.test.ts`, `tests/gift.spec.ts`: pure boundary tests and browser user journeys.
- `vite.config.ts`, `playwright.config.ts`, `.github/workflows/`: portable build, tests and optional Pages deployment.

### Task 1: Safe share links and project tooling

- [x] Write `tests/gift.test.ts`: normalized Unicode round trip; limits; strict schema/version/theme; malformed/oversized payloads; non-HTML text; subpath and query removal.
- [x] Run `npm test` and observe missing implementation fail.
- [x] Implement `validateGift(value: unknown): Gift`, `encodeGift(gift: Gift): string`, `decodeGift(fragment: string): Gift`, `giftUrl(gift: Gift, base: string): string` in `src/gift.ts`.
- [x] Install declared dependencies, configure strict TypeScript and relative Vite base, and pass the gift tests.

### Task 2: Particle sculptures and complete gift flow

- [x] Write shape tests for finite deterministic coordinates, bounded geometry, color ranges and identifiable rose stem/ring center.
- [x] Observe missing shape implementation fail, then implement `createShape(theme: Theme, count: number): ShapeData`.
- [x] Write browser tests for create/preview/back, Unicode gift links, safe notes, reveal/replay, keyboard, malformed links, mobile overflow, manual copy, theme selection, reduced motion and graphics fallback.
- [x] Run the browser suite against the shell and observe missing user flow fail.
- [x] Implement the UI and scene with capped pixel ratio/count, GPU particle gathering, visibility pause, reduced motion and fallback.
- [x] Pass pure tests and browser checks, then visually inspect desktop, mobile and both sculptures.

### Task 3: Delivery and final verification

- [x] Add README with Node requirements, commands, link privacy, GitHub repository/Pages setup, architecture and known limitations.
- [x] Add CI checks and manually triggered Pages deployment; use relative build assets.
- [x] Run build, unit tests, E2E, dependency audit where available and whitespace validation; inspect final screenshots and capture actual results.
- [x] Request a fresh whole-project review, fix material findings with regression coverage, rerun affected checks and show the local artifact to the user.

## Execution ledger

- User approved the proposed design and explicitly said to build. Execute inline without another planning approval gate.
- New isolated project: `Projects/for-you`; existing repositories are untouched.
- Palette: night plum `#140e18`, ink `#211625`, ivory `#f7ecdf`, muted lilac `#c1adca`, petal `#ee9caf`, stem `#759c83`. Serif display (Georgia), readable system sans for controls. No font downloads or external requests.
- Layout: a quiet header, asymmetrical invitation copy and a large rose stage, with a lower cream stationery panel for composing the gift. Recipient mode removes the editor and makes the sculpture and note the focus.
- Reference fidelity: rose petals/stem/leaves and a faceted diamond setting are essential; a simple glowing torus or heart is insufficient.

- Resumed on 5 November 2026: user supplied the public repository `SHUBHRAGHAVT-57/Gift-for-Soemeone` and requested GitHub work. Clean registry-backed npm installation, matching browser setup, audit (0 vulnerabilities), production build, 10 unit tests and 19 production browser tests all passed. Tests now use the actual repository subpath. Source publication is authorized; Pages hosting remains a separate manual step.
