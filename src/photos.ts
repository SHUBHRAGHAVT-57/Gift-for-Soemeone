import { giftUrl, LINK_LIMIT, PHOTO_LIMIT } from "./gift";
import type { Keepsake, Photo } from "./gift";

async function rasterize(
  source: string,
  edge: number,
  quality: number,
): Promise<string> {
  const picture = new Image();
  picture.src = source;
  await picture.decode();
  if (
    !picture.naturalWidth ||
    picture.naturalWidth * picture.naturalHeight > 50_000_000
  )
    throw new Error("This photo is too large. Choose a smaller copy.");
  const scale = Math.min(
    1,
    edge / Math.max(picture.naturalWidth, picture.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(picture.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(picture.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not prepare the photo.");
  ctx.fillStyle = "#f5ecdf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function preparePhotos(
  files: File[],
  existing: number,
): Promise<Photo[]> {
  if (files.length + existing > PHOTO_LIMIT)
    throw new Error(
      `An album holds up to ${PHOTO_LIMIT} photos. Choose fewer files.`,
    );
  const pages: Photo[] = [];
  for (const file of files) {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 12 * 1024 * 1024
    )
      throw new Error("Choose JPG, PNG or WebP images under 12 MB each.");
    const source = URL.createObjectURL(file);
    try {
      let image = await rasterize(source, 1200, 0.78);
      if (image.length > 850000) image = await rasterize(source, 850, 0.68);
      pages.push({ image, caption: "" });
    } catch {
      throw new Error(
        "A photo could not be opened. Try a smaller JPG, PNG or WebP copy.",
      );
    } finally {
      URL.revokeObjectURL(source);
    }
  }
  return pages;
}

// Keep the full local pages for preview and file export. Only the link gets thumbnails.
export async function compactGiftUrl(
  gift: Keepsake,
  base: string,
): Promise<string> {
  if (!gift.photos.length) return giftUrl(gift, base);
  const perPhoto = Math.floor(
    (LINK_LIMIT * 0.72 - new TextEncoder().encode(gift.note).length - 4500) /
      gift.photos.length,
  );
  const photos: Photo[] = [];
  for (const photo of gift.photos) {
    let image = photo.image;
    for (const [edge, quality] of [
      [480, 0.66],
      [320, 0.59],
      [220, 0.52],
      [152, 0.46],
      [100, 0.42],
      [72, 0.38],
    ]) {
      if (image.length <= perPhoto) break;
      image = await rasterize(photo.image, edge, quality);
    }
    photos.push({ ...photo, image });
  }
  return giftUrl({ ...gift, photos }, base);
}
