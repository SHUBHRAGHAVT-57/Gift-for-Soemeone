import type { Keepsake } from "./gift";
import "./reader-controls.js";
import "./reader.css";
import css from "./reader.css?inline";
import controls from "./reader-controls.js?raw";
import wide from "./scenery/garden-wide.webp";
import tall from "./scenery/garden-portrait.webp";

function escapeText(value: string): string {
  return value.replace(
    /[&<>"']/gu,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

const chapterButton = (label: string, action = "next") =>
  `<button type="button" class="reader-button" data-action="${action}">${label} <span aria-hidden="true">→</span></button>`;

export function readerMarkup(
  gift: Keepsake,
  landscape = wide,
  portrait = tall,
): string {
  const to = escapeText(gift.to);
  const from = escapeText(gift.from);
  const paragraphs = gift.note
    .split(/\n\s*\n/u)
    .map((p) => p.trim())
    .filter(Boolean);
  const openingWords =
    paragraphs.length > 1 && [...paragraphs[0]].length <= 280
      ? paragraphs[0]
      : "";
  const afterLight = gift.photos.length
    ? "Open our album"
    : openingWords
      ? "A few words"
      : "Read your letter";
  const album = gift.photos
    .map(
      ({ image, caption }, index) => `
    <figure class="book-spread" data-page>
      <button type="button" class="book-print" data-action="zoom" aria-label="Enlarge photo ${index + 1}"><img src="${image}" alt="${escapeText(caption || `Album photograph ${index + 1}`)}" /></button>
      <figcaption><span class="reader-label">Memory ${String(index + 1).padStart(2, "0")}</span>
      ${caption ? `<p>${escapeText(caption)}</p>` : '<span class="book-floret" aria-hidden="true">❧</span>'}
      <small>${index + 1} / ${gift.photos.length}</small></figcaption>
    </figure>`,
    )
    .join("");
  return `<gift-reader data-theme="${gift.theme}" style="--garden-wide:url('${landscape}');--garden-tall:url('${portrait}')">
    <section class="reader-cover" data-chapter="Garden">
      <div class="cover-type"><p class="reader-label">A gift from ${from}</p><h1 tabindex="-1">${to}, this is for you.</h1>
      ${chapterButton("Open your gift")}</div>
    </section>
    <section class="reader-light" data-chapter="Light">
      <p class="reader-label">A flower written in light</p>
      <h2 tabindex="-1">${gift.theme === "rose" ? "From a bloom to a heartbeat." : "A promise, held in light."}</h2>
      <div class="heart-stage"><span aria-hidden="true">♥</span><canvas width="520" height="420" aria-label="Particles gather into a glowing heart"></canvas></div>
      ${chapterButton(afterLight)}
    </section>
    ${
      album
        ? `<section class="reader-album" data-chapter="Album">
      <p class="reader-label">The photographs</p><h2 tabindex="-1">Our little album.</h2>
      <div class="book-binding">${album}</div>
      <dialog class="photo-dialog" aria-label="Enlarged photograph"><button type="button" data-action="close-photo" autofocus>Close photo</button><img alt="" /></dialog>
      <div class="book-controls"><button type="button" data-action="page-prev" aria-label="Previous photo">←</button>
        <span data-page-number aria-live="polite"></span><button type="button" data-action="page-next" aria-label="Next photo">→</button></div>
      ${chapterButton(openingWords ? "A few words" : "Read your letter")}</section>`
        : ""
    }
    ${
      openingWords
        ? `<section class="reader-words" data-chapter="Words"><p class="reader-label">In your words</p>
      <h2 tabindex="-1">${escapeText(openingWords)}</h2>${chapterButton("Unfold the letter")}</section>`
        : ""
    }
    <section class="reader-letter" data-chapter="Letter"><article class="letter-sheet">
      <p class="reader-label">Personal correspondence</p><h2 tabindex="-1">Dear ${to},</h2>
      <div class="written-note">${escapeText(gift.note)}</div><p class="written-signature">With love, ${from}</p>
    </article>${chapterButton("Replay the reveal", "replay")}</section>
    <nav class="reader-nav" aria-label="Gift chapters"><button type="button" data-action="previous">← Back</button>
      <span data-progress aria-live="polite"></span><button type="button" data-action="letter">Skip to letter</button></nav>
  </gift-reader>`;
}

async function embedAsset(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("The garden artwork could not load. Try saving again.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("The garden artwork could not be included."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function giftFile(gift: Keepsake): Promise<File> {
  const [landscape, portrait] = await Promise.all([
    embedAsset(wide),
    embedAsset(tall),
  ]);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
    <title>A gift for you</title><style>body{margin:0;background:#100d12}body>gift-reader{--reader-height:100svh}${css}</style></head>
    <body>${readerMarkup(gift, landscape, portrait)}<script>${controls}</script></body></html>`;
  return new File([html], "a-gift-for-you.html", { type: "text/html" });
}
