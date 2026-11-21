import "./style.css";
import { decodeGift, LETTER_LIMIT, validateGift } from "./gift";
import type { Gift, Keepsake, Photo, Theme } from "./gift";
import { arrow, fallbackArt, flowerMark } from "./art";
import type { Sculpture, SceneState } from "./scene";

import { mountAlbumEditor } from "./album-editor";
import { compactGiftUrl } from "./photos";
import { giftFile, readerMarkup } from "./reader";
import "./studio.css";

const photos: Photo[] = [];
const app = document.querySelector<HTMLDivElement>("#app")!;
let scene: Sculpture | undefined;
let sceneToken = 0;
let paused = false;
let view: "creator" | "gift" | "preview" | "error" = "creator";
let draft = { to: "", from: "", note: "", theme: "rose" as Theme };
let renderToken = 0;
let sceneState: SceneState = "display";
const sculptureLabels = {
  rose: "A rose formed from thousands of glowing particles",
  ring: "A sparkling particle diamond ring",
};
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  app.querySelector<T>(selector)!;

function stage(theme: Theme): string {
  return /* HTML */ `<div
    class="sculpture"
    data-theme="${theme}"
    data-renderer="loading"
    role="img"
    aria-label="${sculptureLabels[theme]}"
  >
    ${fallbackArt(theme)}
  </div>`;
}

async function mountScene(theme: Theme, state: SceneState) {
  sceneState = state;
  const token = ++sceneToken;
  scene?.dispose();
  scene = undefined;
  const host = $(".sculpture");
  try {
    const { createSculpture } = await import("./scene");
    if (token !== sceneToken || !host.isConnected) return;
    scene = createSculpture(host, theme, sceneState);
    scene.setPaused(paused);
  } catch {
    if (host.isConnected) host.dataset.renderer = "fallback";
  }
}

function header(recipient = false): string {
  return /* HTML */ `<a class="skip-link" href="#main">Skip to content</a>
    <header class="header">
      <a class="brand" href="./" aria-label="For You home"
        >${flowerMark}<span>for you<span class="brand-dot">.</span></span></a
      >
      <div class="header-right">
        <button
          class="motion-button"
          type="button"
          aria-pressed="${paused}"
          aria-label="${paused ? "Resume animation" : "Pause animation"}"
        >
          <span class="motion-indicator" aria-hidden="true"></span
          ><span class="motion-label"
            >Motion ${paused ? "off" : "on"}</span
          ></button
        >${recipient ? "" : '<a class="header-create" href="#compose">Create a gift <span aria-hidden="true">↗</span></a>'}
      </div>
    </header>`;
}

function wireHeader() {
  $(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    const main = $("#main");
    main.tabIndex = -1;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
  });
  $(".motion-button").addEventListener("click", () => {
    paused = !paused;
    scene?.setPaused(paused);
    app.querySelector("gift-reader")?.toggleAttribute("data-paused", paused);
    $(".motion-button").setAttribute("aria-pressed", String(paused));
    $(".motion-button").setAttribute(
      "aria-label",
      paused ? "Resume animation" : "Pause animation",
    );
    $(".motion-label").textContent = `Motion ${paused ? "off" : "on"}`;
  });
  $(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    goToCreator();
    window.scrollTo(0, 0);
  });
}

function clearScene() {
  ++sceneToken;
  scene?.dispose();
  scene = undefined;
}

function renderCreator(focusPreview = false) {
  if (history.state?.preview === true)
    history.replaceState(null, "", location.href);
  ++renderToken;
  clearScene();
  view = "creator";
  document.title = "For You · The gift studio";
  app.innerHTML = /* HTML */ `${header()}
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="intro">The gift studio</p>
          <h1 id="hero-title">A garden for<br /><em>the two of you.</em></h1>
          <p class="hero-description">
            Give them a place to open your photos and read a letter in your own
            words.
          </p>
          <a class="button button-light hero-cta" href="#compose"
            >Create a free gift ${arrow}</a
          >
        </div>
        <div class="hero-art">
          ${stage(draft.theme)}
          <div class="art-caption">
            <span class="caption-line"></span>
            <p id="art-caption">
              ${draft.theme === "rose" ? "The rose garden" : "The promise ring"}
            </p>
            <span class="caption-line"></span>
          </div>
        </div>
      </section>
      <section
        class="compose-section"
        id="compose"
        aria-labelledby="compose-title"
      >
        <div class="compose-intro">
          <p class="studio-label">Your gift</p>
          <h2 id="compose-title">Inside the<br /><em>envelope.</em></h2>
          <p>
            Choose the opening, arrange your album and write the letter they’ll
            find at the end.
          </p>
          <div class="chapter-list" aria-label="Recipient chapters">
            <span>The garden</span><span>A heart of light</span
            ><span>Your photographs</span><span>The letter</span>
          </div>
        </div>
        <form id="gift-form">
          <fieldset class="theme-picker">
            <legend>Choose your gesture</legend>
            <div class="theme-options">
              <label class="theme-option"
                ><input
                  type="radio"
                  name="theme"
                  value="rose"
                  ${draft.theme === "rose" ? "checked" : ""} /><span
                  class="option-icon rose-icon"
                  aria-hidden="true"
                  >${flowerMark}</span
                ><span
                  ><strong>Particle rose</strong
                  ><small>For love, just because</small></span
                ><span class="radio-mark" aria-hidden="true"></span></label
              ><label class="theme-option"
                ><input
                  type="radio"
                  name="theme"
                  value="ring"
                  ${draft.theme === "ring" ? "checked" : ""} /><span
                  class="option-icon"
                  aria-hidden="true"
                  ><svg viewBox="0 0 32 32" fill="none">
                    <circle
                      cx="16"
                      cy="21"
                      r="7"
                      stroke="currentColor"
                      stroke-width="1.2"
                    />
                    <path
                      d="m16 15-5-7 2-3h6l2 3-5 7ZM11 8h10m-8-3 3 10 3-10"
                      stroke="currentColor"
                      stroke-width="1.2"
                    /></svg></span
                ><span
                  ><strong>Diamond ring</strong
                  ><small>For a proposal</small></span
                ><span class="radio-mark" aria-hidden="true"></span
              ></label>
            </div>
          </fieldset>
          <div class="name-fields">
            <div class="field">
              <label for="recipient">Their name</label
              ><input
                id="recipient"
                name="to"
                autocomplete="off"
                placeholder="Their first name"
                required
                aria-describedby="name-hint"
              />
            </div>
            <div class="field">
              <label for="sender">Your name</label
              ><input
                id="sender"
                name="from"
                autocomplete="off"
                placeholder="Your signature"
                required
                aria-describedby="name-hint"
              />
            </div>
          </div>
          <span class="sr-only" id="name-hint"
            >Up to 60 characters per name.</span
          >
          <fieldset class="album-field">
            <legend>Your photo album <small>Optional</small></legend>
            <p id="photo-hint">
              Choose up to 10 photos in reading order. JPG, PNG or WebP, up to
              12 MB each.
            </p>
            <label class="file-picker" for="album-files"
              >Add photos<input
                id="album-files"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                aria-describedby="photo-hint"
            /></label>
            <p id="album-feedback" aria-live="polite"></p>
            <ol id="album-pages"></ol>
          </fieldset>
          <div class="field note-field">
            <label for="note"
              >Your letter <span>Up to 4,000 characters</span></label
            ><textarea
              id="note"
              name="note"
              rows="5"
              placeholder="What’s one moment with them you still think about?"
              required
              aria-describedby="note-count"
            ></textarea
            ><span class="note-count" id="note-count">0 / 4000</span>
          </div>
          <p class="form-error" id="form-error" role="alert" hidden></p>
          <div class="form-actions">
            <button class="button button-ink" type="submit">
              Create gift link ${arrow}</button
            ><button class="preview-button" id="preview" type="button">
              Preview gift
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  stroke-width="1.4"
                />
              </svg></button
            ><button
              class="share-button"
              id="native-share"
              type="button"
              hidden
            >
              Share gift
            </button>
          </div>
          <div class="share-result" id="share-result" hidden>
            <label for="gift-link">Your gift link</label>
            <div class="link-row">
              <input id="gift-link" readonly spellcheck="false" /><button
                type="button"
                class="copy-again"
              >
                Copy link
              </button>
            </div>
          </div>
          <button class="file-save" id="save-gift" type="button">
            Download full-size gift
          </button>
          <p class="send-hint">
            Links use smaller photos and can be long. For a full-size album,
            send the downloaded HTML file as a document and open it in a
            browser.
          </p>
          <p class="share-status" role="status" aria-live="polite"></p>
          <p class="privacy-note">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="3.5"
                y="7"
                width="9"
                height="7"
                rx="1.5"
                stroke="currentColor"
              />
              <path
                d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7"
                stroke="currentColor"
              /></svg
            >Free to create. Your photos stay in this tab until you share.
            Anyone with the link or file can open it.
          </p>
        </form>
      </section>
    </main>
    <footer>
      <a class="footer-brand" href="#main">for you.</a
      ><a href="#compose">Create a gift ${arrow}</a>
    </footer>`;
  $("#recipient").setAttribute("value", draft.to);
  $("#sender").setAttribute("value", draft.from);
  $<HTMLTextAreaElement>("#note").value = draft.note;
  $("#note-count").textContent = `${[...draft.note].length} / 4000`;
  wireHeader();
  void mountScene(draft.theme, "display");
  const form = $<HTMLFormElement>("#gift-form");
  const invalidateShare = () => {
    ++renderToken;
    $("#share-result").hidden = true;
    $<HTMLInputElement>("#gift-link").value = "";
    $(".share-status").textContent = "";
  };
  mountAlbumEditor(form, photos, invalidateShare);
  form.addEventListener("input", () => {
    invalidateShare();
    readDraft();
    $("#form-error").hidden = true;
    const count = [...draft.note].length;
    $("#note-count").textContent = `${count} / 4000`;
    $("#note-count").classList.toggle("over-limit", count > LETTER_LIMIT);
  });
  form.addEventListener("change", (event) => {
    if ((event.target as HTMLInputElement).name !== "theme") return;
    readDraft();
    const host = $(".sculpture");
    host.dataset.theme = draft.theme;
    host.setAttribute("aria-label", sculptureLabels[draft.theme]);
    host.dataset.renderer = "loading";
    host.innerHTML = fallbackArt(draft.theme);
    $("#art-caption").textContent =
      draft.theme === "rose" ? "The rose garden" : "The promise ring";
    void mountScene(draft.theme, "display");
  });
  $("#preview").addEventListener("click", () => {
    const gift = validatedDraft();
    if (gift) {
      history.pushState({ preview: true }, "", location.href);
      renderRecipient(gift, true);
      window.scrollTo(0, 0);
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void shareLink();
  });
  $(".copy-again").addEventListener("click", () => {
    void shareLink();
  });
  $("#save-gift").addEventListener("click", async () => {
    const gift = validatedDraft();
    if (!gift) return;
    const token = renderToken;
    try {
      const file = await giftFile(gift);
      if (token !== renderToken) return;
      const url = URL.createObjectURL(file);
      const download = document.createElement("a");
      download.href = url;
      download.download = file.name;
      document.body.append(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      $(".share-status").textContent =
        "Gift saved. Send the HTML document to your person.";
    } catch {
      if (token === renderToken)
        $(".share-status").textContent =
          "Could not save the gift. Please try again.";
    }
  });
  if (typeof navigator.share === "function") {
    $("#native-share").hidden = false;
    $("#native-share").addEventListener("click", () => {
      void shareLink(true);
    });
  }
  if (focusPreview) {
    $("#preview").focus();
    $("#compose").scrollIntoView({ block: "start" });
  }
}

function readDraft() {
  draft = {
    to: $<HTMLInputElement>("#recipient").value,
    from: $<HTMLInputElement>("#sender").value,
    note: $<HTMLTextAreaElement>("#note").value,
    theme: $<HTMLInputElement>('input[name="theme"]:checked').value as Theme,
  };
}

function validatedDraft(): Keepsake | undefined {
  if ($("#gift-form").getAttribute("aria-busy") === "true") return;
  if (!$<HTMLFormElement>("#gift-form").reportValidity()) return undefined;
  readDraft();
  try {
    const gift = validateGift({ v: 2, ...draft, photos });
    $("#form-error").hidden = true;
    return gift.v === 2 ? gift : undefined;
  } catch (error) {
    $("#form-error").textContent =
      error instanceof Error
        ? error.message
        : "Please check your names and note.";
    $("#form-error").hidden = false;
    return undefined;
  }
}

async function shareLink(native = false) {
  const gift = validatedDraft();
  if (!gift) return;
  const token = renderToken;
  let url: string;
  try {
    url = await compactGiftUrl(gift, location.href);
  } catch {
    if (token === renderToken)
      $(".share-status").textContent =
        "Could not prepare a link. Download the full-size gift instead.";
    return;
  }
  if (token !== renderToken) return;
  if (native) {
    try {
      await navigator.share({ title: "A gift for you", url });
      return;
    } catch (error) {
      if (
        token !== renderToken ||
        (error instanceof DOMException && error.name === "AbortError")
      )
        return;
    }
  }
  const field = $<HTMLInputElement>("#gift-link");
  field.value = url;
  $("#share-result").hidden = false;
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(url);
    if (token !== renderToken) return;
    $(".share-status").textContent = "Link copied. Send a little love.";
  } catch {
    if (token !== renderToken) return;
    $(".share-status").textContent = "Copy the link below to send your gift.";
    field.focus();
    field.select();
  }
}

function renderRecipient(gift: Gift, preview = false) {
  ++renderToken;
  clearScene();
  view = preview ? "preview" : "gift";
  document.title = "For You — someone made you a little universe";
  if (gift.v === 2) {
    app.innerHTML = `${header(true)}<main id="main" class="keepsake">
    ${preview ? '<div class="preview-tools"><button class="back-button" type="button">← Back to editing</button><span>Recipient preview</span></div>' : ""}
    ${readerMarkup(gift)}</main>`;
    wireHeader();
    app.querySelector("gift-reader")?.toggleAttribute("data-paused", paused);
    if (preview)
      $(".back-button").addEventListener("click", () => history.back());
    $("gift-reader h1").focus({ preventScroll: true });
    return;
  }
  app.innerHTML = /* HTML */ `${header(true)}
    <main class="recipient" id="main">
      <div class="recipient-top">
        ${preview ? '<button type="button" class="back-button">← Back to editing</button><span class="preview-indicator">This is what they’ll see</span>' : '<span class="recipient-intro">Someone has been thinking of you.</span>'}
      </div>
      <section class="gift-stage">
        <div class="recipient-heading">
          <p class="from-line"></p>
          <h1 id="gift-title" tabindex="-1"></h1>
          <p class="invitation">A little something, made of light and love.</p>
        </div>
        <div class="gift-art">${stage(gift.theme)}</div>
        <div class="open-controls">
          <button class="button button-light open-gift" type="button">
            Open your gift ${arrow}
          </button>
          <p>One small tap. Something just for you.</p>
        </div>
        <section class="letter" aria-label="Your personal note" hidden>
          <span class="letter-mark" aria-hidden="true">${flowerMark}</span>
          <p class="personal-note"></p>
          <p class="signature"></p>
          <button class="replay-button" type="button">
            Replay the reveal <span aria-hidden="true">↻</span>
          </button>
        </section>
      </section>
      <div class="recipient-bottom">
        <span>A small gesture. A whole lot of feeling.</span
        ><button type="button" class="make-your-own">
          Make a gift for someone
        </button>
      </div>
    </main>
    <footer class="recipient-footer">
      <span class="footer-brand">for you.</span
      ><span>Some things are better felt.</span>
    </footer>`;
  $("#gift-title").textContent = `${gift.to}, this is for you.`;
  $(".from-line").textContent = `A little universe from ${gift.from}`;
  $(".personal-note").textContent = gift.note;
  $(".signature").textContent = `With love, ${gift.from}`;
  wireHeader();
  void mountScene(gift.theme, "waiting");
  $(".open-gift").addEventListener("click", () => {
    $(".open-controls").hidden = true;
    $(".letter").hidden = false;
    sceneState = "opened";
    scene?.setState("opened");
    const note = $(".personal-note");
    note.tabIndex = -1;
    note.focus({ preventScroll: true });
  });
  $(".replay-button").addEventListener("click", () => {
    $(".letter").hidden = true;
    $(".open-controls").hidden = false;
    sceneState = "waiting";
    scene?.setState("waiting");
    $(".open-gift").focus({ preventScroll: true });
  });
  if (preview)
    $(".back-button").addEventListener("click", () => history.back());
  $(".make-your-own").addEventListener("click", goToCreator);
  $("#gift-title").focus({ preventScroll: true });
}

function goToCreator() {
  history.pushState(null, "", location.pathname + location.search);
  renderCreator();
  window.scrollTo(0, 0);
}

function route() {
  const hash = location.hash;
  if (!hash.startsWith("#gift=")) {
    renderCreator(view === "preview");
    return;
  }
  try {
    renderRecipient(decodeGift(hash));
  } catch {
    ++renderToken;
    clearScene();
    view = "error";
    app.innerHTML = /* HTML */ `${header(true)}
      <main id="main" class="error-page">
        ${flowerMark}
        <h1>This gift needs a little help.</h1>
        <p>
          The link may be incomplete or damaged. Ask the sender to copy it
          again, or make a new gift below.
        </p>
        <button class="button button-light" type="button">
          Create a new gift ${arrow}
        </button>
      </main>`;
    wireHeader();
    $(".error-page button").addEventListener("click", goToCreator);
  }
}

window.addEventListener("hashchange", () => {
  // In-page creator anchors must not rebuild the form and discard a draft.
  if (location.hash.startsWith("#gift=") || view === "gift" || view === "error")
    route();
});
window.addEventListener("popstate", (event) => {
  if (event.state?.preview === true) {
    try {
      renderRecipient(validateGift({ v: 2, ...draft, photos }), true);
    } catch {
      route();
    }
  } else if (view === "preview") {
    route();
  }
});
route();
