import "./style.css";
import { decodeGift, giftUrl, validateGift } from "./gift";
import type { Gift, Theme } from "./gift";
import { arrow, fallbackArt, flowerMark } from "./art";
import type { Sculpture, SceneState } from "./scene";

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
  document.title = "For You — a little universe, just for them";
  app.innerHTML = /* HTML */ `${header()}
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="intro">For your favorite person</p>
          <h1 id="hero-title">A little universe.<br />Just for them.</h1>
          <p class="hero-description">
            Some feelings deserve more than a text.<br />Give yours a little
            room to bloom.
          </p>
          <a class="button button-light hero-cta" href="#compose"
            >Make something beautiful ${arrow}</a
          >
          <p class="hero-footnote">Your words. A little wonder. One link.</p>
        </div>
        <div class="hero-art">
          ${stage(draft.theme)}
          <div class="art-caption">
            <span class="caption-line"></span>
            <p id="art-caption">
              ${draft.theme === "rose" ? "A rose, made of light." : "A promise, written in stardust."}
            </p>
            <span class="caption-line"></span>
          </div>
          <p class="art-detail">Made to be opened by someone special</p>
        </div>
        <div class="hero-bottom">
          <span>A small gesture can mean everything.</span
          ><a href="#compose"
            >Put your heart into it <span aria-hidden="true">↓</span></a
          >
        </div>
      </section>
      <section
        class="compose-section"
        id="compose"
        aria-labelledby="compose-title"
      >
        <div class="compose-intro">
          <span class="little-flower" aria-hidden="true">${flowerMark}</span>
          <h2 id="compose-title">Make it<br />theirs.</h2>
          <p>
            A name. A few honest words.<br />
            A little magic to carry them.
          </p>
          <div class="how-it-works">
            <h3>From your heart to their screen</h3>
            <ol>
              <li>Choose a little wonder.</li>
              <li>Add the words only you could write.</li>
              <li>Send a link. Let them open it.</li>
            </ol>
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
                placeholder="Your favorite person"
                required
                aria-describedby="name-hint"
              />
            </div>
            <div class="field">
              <label for="sender">Your name</label
              ><input
                id="sender"
                name="from"
                autocomplete="given-name"
                placeholder="The one who loves them"
                required
                aria-describedby="name-hint"
              />
            </div>
          </div>
          <span class="name-hint" id="name-hint"
            >Up to 60 characters per name.</span
          >
          <div class="field note-field">
            <label for="note"
              >Your note <span>Make it sound like you.</span></label
            ><textarea
              id="note"
              name="note"
              rows="5"
              placeholder="I don't say it enough, but life is a little softer, a little brighter, and a lot more beautiful with you in it."
              required
              aria-describedby="note-count"
            ></textarea
            ><span class="note-count" id="note-count">0 / 600</span>
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
            <div class="share-heading"><label for="gift-link">Your gift link</label><a class="open-link" id="open-link" target="_blank" rel="noopener">Open gift ${arrow}<span class="sr-only"> in a new tab</span></a></div>
            <div class="link-row">
              <input id="gift-link" readonly spellcheck="false" /><button
                type="button"
                class="copy-again"
              >
                Copy link
              </button>
            </div>
          </div>
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
            >No account needed. Anyone with the link can read your gift.
          </p>
        </form>
      </section>
      <section class="closing">
        <p>Not every beautiful thing needs an occasion.</p>
        <span>Sometimes, “I thought of you” is enough.</span>
      </section>
    </main>
    <footer>
      <a class="footer-brand" href="#main">for you.</a
      ><span>A little code. A lot of feeling.</span
      ><a href="#compose">Make their day ${arrow}</a>
    </footer>`;
  $("#recipient").setAttribute("value", draft.to);
  $("#sender").setAttribute("value", draft.from);
  $<HTMLTextAreaElement>("#note").value = draft.note;
  $("#note-count").textContent = `${[...draft.note].length} / 600`;
  wireHeader();
  void mountScene(draft.theme, "display");
  const form = $<HTMLFormElement>("#gift-form");
  form.addEventListener("input", () => {
    ++renderToken;
    readDraft();
    $("#share-result").hidden = true;
    $(".share-status").textContent = "";
    $("#form-error").hidden = true;
    const count = [...draft.note].length;
    $("#note-count").textContent = `${count} / 600`;
    $("#note-count").classList.toggle("over-limit", count > 600);
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
      draft.theme === "rose"
        ? "A rose, made of light."
        : "A promise, written in stardust.";
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
  if (navigator.share) {
    $("#native-share").hidden = false;
    $("#native-share").addEventListener("click", async () => {
      const gift = validatedDraft();
      if (!gift) return;
      const token = renderToken;
      try {
        await navigator.share({
          title: "Something made just for you",
          url: giftUrl(gift, location.href),
        });
      } catch (error) {
        if (
          token === renderToken &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          $(".share-status").textContent =
            "Sharing is unavailable. Create a gift link to copy instead.";
        }
      }
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

function validatedDraft(): Gift | undefined {
  if (!$<HTMLFormElement>("#gift-form").reportValidity()) return undefined;
  readDraft();
  try {
    const gift = validateGift({ v: 1, ...draft });
    $("#form-error").hidden = true;
    return gift;
  } catch (error) {
    $("#form-error").textContent =
      error instanceof Error
        ? error.message
        : "Please check your names and note.";
    $("#form-error").hidden = false;
    return undefined;
  }
}

async function shareLink() {
  const gift = validatedDraft();
  if (!gift) return;
  const url = giftUrl(gift, location.href);
  const token = renderToken;
  const field = $<HTMLInputElement>("#gift-link");
  field.value = url;
  $("#open-link").setAttribute("href", url);
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
      renderRecipient(validateGift({ v: 1, ...draft }), true);
    } catch {
      route();
    }
  } else if (view === "preview") {
    route();
  }
});
route();
