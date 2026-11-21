import { preparePhotos } from "./photos";
import type { Photo } from "./gift";

export function mountAlbumEditor(
  form: HTMLFormElement,
  photos: Photo[],
  changed: () => void,
) {
  const files = form.querySelector<HTMLInputElement>("#album-files")!;
  const list = form.querySelector<HTMLOListElement>("#album-pages")!;
  const feedback = form.querySelector<HTMLElement>("#album-feedback")!;
  function draw() {
    list.replaceChildren();
    photos.forEach((photo, i) => {
      const item = document.createElement("li");
      const image = document.createElement("img");
      image.src = photo.image;
      image.alt = `Selected photo ${i + 1}`;
      const fields = document.createElement("div");
      const caption = document.createElement("input");
      caption.placeholder = "Add a caption (optional)";
      caption.setAttribute("aria-label", `Caption for photo ${i + 1}`);
      caption.maxLength = 160;
      caption.value = photo.caption;
      caption.oninput = () => {
        photo.caption = caption.value;
      };
      const actions = document.createElement("div");
      actions.className = "photo-actions";
      for (const [label, offset] of [
        ["Earlier", -1],
        ["Later", 1],
        ["Remove", 0],
      ] as const) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.setAttribute("aria-label", `${label} · photo ${i + 1}`);
        button.disabled =
          offset !== 0 && (i + offset < 0 || i + offset >= photos.length);
        button.onclick = () => {
          photos.splice(i, 1);
          if (offset) photos.splice(i + offset, 0, photo);
          draw();
          changed();
          const next = list.children[Math.min(i, photos.length - 1)];
          (next?.querySelector<HTMLInputElement>("input") ?? files).focus();
        };
        actions.append(button);
      }
      fields.append(caption, actions);
      item.append(image, fields);
      list.append(item);
    });
    feedback.textContent = photos.length ? `${photos.length} of 10 photos` : "";
  }
  files.onchange = async () => {
    const batch = Array.from(files.files ?? []);
    if (!batch.length) return;
    files.disabled = true;
    form.setAttribute("aria-busy", "true");
    const buttons = form.querySelectorAll<HTMLButtonElement>(
      ".form-actions button,.copy-again,#save-gift",
    );
    buttons.forEach((button) => {
      button.disabled = true;
    });
    changed();
    feedback.textContent = "Preparing photos…";
    try {
      const additions = await preparePhotos(batch, photos.length);
      if (!form.isConnected) return;
      photos.push(...additions);
      draw();
    } catch (error) {
      feedback.textContent =
        error instanceof Error ? error.message : "Could not open these photos.";
    } finally {
      files.disabled = false;
      files.value = "";
      buttons.forEach((button) => {
        button.disabled = false;
      });
      form.removeAttribute("aria-busy");
    }
  };
  draw();
}
