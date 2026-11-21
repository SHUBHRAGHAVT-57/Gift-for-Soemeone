// This component also runs directly inside the downloadable, offline gift.
class GiftReader extends HTMLElement {
  connectedCallback() {
    this.lifecycle = new AbortController();
    this.chapters = Array.from(this.querySelectorAll("[data-chapter]"));
    this.pages = Array.from(this.querySelectorAll("[data-page]"));
    this.position = 0;
    this.page = 0;
    this.frame = 0;
    this.preference = matchMedia("(prefers-reduced-motion: reduce)");
    const options = { signal: this.lifecycle.signal };
    this.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("[data-action]");
        if (!button || button.disabled) return;
        switch (button.dataset.action) {
          case "next":
            this.show(this.position + 1);
            break;
          case "previous":
            this.show(this.position - 1);
            break;
          case "letter":
            this.show(this.chapters.length - 1);
            break;
          case "replay":
            this.page = 0;
            this.show(0);
            break;
          case "page-prev":
            this.turn(-1);
            break;
          case "page-next":
            this.turn(1);
            break;
          case "zoom": {
            const dialog = this.querySelector(".photo-dialog");
            const selected = this.pages[this.page].querySelector("img");
            const enlarged = dialog.querySelector("img");
            enlarged.src = selected.src;
            enlarged.alt = selected.alt;
            dialog.showModal();
            break;
          }
          case "close-photo":
            this.querySelector(".photo-dialog").close();
            break;
        }
      },
      options,
    );
    const book = this.querySelector(".book-binding");
    if (book) {
      let start;
      book.addEventListener(
        "touchstart",
        (event) => {
          start = event.touches.length === 1 ? event.touches[0] : undefined;
        },
        { ...options, passive: true },
      );
      book.addEventListener(
        "touchend",
        (event) => {
          if (!start || event.touches.length) return;
          const dx = event.changedTouches[0].clientX - start.clientX;
          const dy = event.changedTouches[0].clientY - start.clientY;
          start = undefined;
          if (Math.abs(dx) > 55 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
            if (event.cancelable) event.preventDefault();
            this.turn(dx < 0 ? 1 : -1);
          }
        },
        { ...options, passive: false },
      );
      this.addEventListener(
        "keydown",
        (event) => {
          if (
            this.chapters[this.position].dataset.chapter !== "Album" ||
            this.querySelector("dialog[open]")
          )
            return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            this.turn(event.key === "ArrowRight" ? 1 : -1);
            this.pages[this.page]
              .querySelector("button")
              .focus({ preventScroll: true });
          }
        },
        options,
      );
    }
    this.preference.addEventListener(
      "change",
      () => this.paintHeart(),
      options,
    );
    document.addEventListener(
      "visibilitychange",
      () => this.paintHeart(),
      options,
    );
    this.show(0, false);
    this.dataset.ready = "";
  }
  disconnectedCallback() {
    this.lifecycle?.abort();
    cancelAnimationFrame(this.frame);
  }
  static get observedAttributes() {
    return ["data-paused"];
  }
  attributeChangedCallback() {
    if (this.chapters) this.paintHeart();
  }
  show(index, focus = true) {
    this.position = Math.min(this.chapters.length - 1, Math.max(0, index));
    this.chapters.forEach((chapter, i) => {
      chapter.hidden = i !== this.position;
    });
    const chapter = this.chapters[this.position];
    this.querySelector("[data-progress]").textContent =
      `${this.position + 1} / ${this.chapters.length} · ${chapter.dataset.chapter}`;
    this.querySelector('[data-action="previous"]').disabled =
      this.position === 0;
    this.querySelector('[data-action="letter"]').hidden =
      this.position === this.chapters.length - 1;
    if (chapter.dataset.chapter === "Album") this.turn(0);
    this.paintHeart();
    if (focus) {
      chapter.querySelector("h1,h2").focus({ preventScroll: true });
      this.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  turn(delta) {
    this.page = Math.max(0, Math.min(this.pages.length - 1, this.page + delta));
    this.pages.forEach((page, index) => {
      page.hidden = index !== this.page;
    });
    this.querySelector("[data-page-number]").textContent =
      `Photo ${this.page + 1} of ${this.pages.length}`;
    this.querySelector('[data-action="page-prev"]').disabled = this.page === 0;
    this.querySelector('[data-action="page-next"]').disabled =
      this.page === this.pages.length - 1;
  }
  paintHeart() {
    cancelAnimationFrame(this.frame);
    if (
      this.chapters[this.position]?.dataset.chapter !== "Light" ||
      document.hidden
    )
      return;
    const canvas = this.querySelector(".heart-stage canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.previousElementSibling.hidden = true;
    const staticFrame =
      this.preference.matches || this.hasAttribute("data-paused");
    const start = performance.now();
    const ring = this.dataset.theme === "ring";
    // Each particle follows the same path backwards and forwards on replay.
    const points = Array.from({ length: 1650 }, (_, i) => {
      const angle = i * 2.39996323,
        radius = Math.sqrt(((i * 173) % 1651) / 1651);
      const z = Math.sin(i * 4.17),
        petal = 0.54 + 0.46 * Math.abs(Math.cos(2.5 * angle + radius * 2));
      const initialRadius = ring ? 88 + z * 5 : 110 * radius * petal;
      return {
        x: Math.cos(angle) * initialRadius,
        y: Math.sin(angle) * initialRadius,
        hx: 9.3 * Math.pow(Math.sin(angle), 3) * 16 * radius,
        hy:
          -9.3 *
          (13 * Math.cos(angle) -
            5 * Math.cos(2 * angle) -
            2 * Math.cos(3 * angle) -
            Math.cos(4 * angle)) *
          radius,
        size: 0.7 + (z + 1) * 0.48,
        color: i % 6 === 0 ? "#ffe8b9" : i % 3 === 0 ? "#f3a4bd" : "#d85e8b",
        z,
      };
    });
    const draw = (now) => {
      const t = staticFrame
        ? 1
        : Math.max(0, Math.min(1, (now - start - 360) / 1450));
      const progress = t * t * (3 - 2 * t);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of points) {
        const x = 260 + p.x + (p.hx - p.x) * progress;
        const y = 194 + p.y + (p.hy - p.y) * progress;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.56 + (p.z + 1) * 0.21;
        ctx.fillRect(x, y, p.size, p.size);
      }
      if (t < 1) this.frame = requestAnimationFrame(draw);
    };
    draw(start);
  }
}
customElements.define("gift-reader", GiftReader);
