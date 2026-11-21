# For You

A free gift studio for two people. The recipient opens a flower garden, watches a rose or ring gather into a heart, turns the pages of a photo album and unfolds a personal letter.

## Make a gift

1. Choose a rose or a proposal ring. Enter both names and a letter of up to 4,000 characters.
2. Add up to ten JPG, PNG or WebP photos, each under 12 MB. Arrange the pages and add optional captions.
3. Select **Preview gift** to walk through the recipient's experience. **Back to editing** keeps the draft in the current tab.
4. Select **Create gift link** for a browser link, or **Download full-size gift** to send a single HTML document. The document includes the artwork, photos and reader and can open offline in a browser.

The album chapter appears when the author adds photos. A short opening paragraph can also appear on its own page before the complete letter. The reader supports keyboard navigation, reduced motion, skipping to the letter and replay.

## Sharing and privacy

Names, captions, letters and photos are processed in the browser. Refreshing the creator clears the draft. Creating a gift does not publish a page in the repository. Each selected picture is decoded and redrawn before sharing, leaving the original filename and embedded camera metadata out of the gift. People and places visible in the picture are still visible to the recipient.

The link carries its contents in the URL fragment. Anyone with the complete link or file can read and forward the gift. Links have no password, expiry or revocation. Link photos are resized to fit a character budget. Chat apps may truncate long album links. The HTML document retains photos at up to 1,200 pixels on the longest side and can be sent as an attachment. Some mail and messaging apps restrict HTML attachments or require opening the downloaded file in a browser.

The public application includes only generic garden scenery and procedural graphics. There is no gallery service, analytics, payment system or account setup. Previously shared version-one gifts still open with their original reveal.

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

This is a static Vite + TypeScript + Three.js project. It needs no API keys, account service, database, external fonts or runtime CDN. The build output is `dist/`. Relative asset paths support either a domain root or a GitHub Pages repository subpath.

## Verify and publish

Run the unit tests and production browser suite on Node 22.18 or newer.

```sh
npm test
npx playwright install chromium webkit
npm run test:e2e
```

Browser checks cover the repository subpath, separate creator and recipient contexts, actual image conversion, photo ordering, offline document export, keyboard access, touch, reduced motion, legacy links and graphics fallbacks. The optional GitHub Pages workflow runs manually. Open the deployed site before creating links to send to another device.
