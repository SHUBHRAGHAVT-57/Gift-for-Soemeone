export type Theme = "rose" | "ring";
interface Message {
  to: string;
  from: string;
  note: string;
  theme: Theme;
}
export type Gift = Message & ({ v: 1 } | { v: 2; photos: Photo[] });
export type Keepsake = Extract<Gift, { v: 2 }>;
export interface Photo {
  image: string;
  caption: string;
}
export const PHOTO_LIMIT = 10;
export const LETTER_LIMIT = 4000;
export const LINK_LIMIT = 96000;

function validatePhotos(value: unknown): Photo[] {
  if (!Array.isArray(value) || value.length > PHOTO_LIMIT)
    throw new Error(`Choose up to ${PHOTO_LIMIT} photos.`);
  return value.map((photo) => {
    if (
      !photo ||
      typeof photo.image !== "string" ||
      photo.image.length > 850000 ||
      !/^data:image\/jpeg;base64,\/9j\/[a-zA-Z0-9+/]+=*$/u.test(photo.image) ||
      typeof photo.caption !== "string" ||
      [...photo.caption].length > 160
    )
      throw new Error("One of the album pages could not be read.");
    return { image: photo.image, caption: photo.caption.trim() };
  });
}

export function validateGift(value: unknown): Gift {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("This gift is not valid.");
  const data = value as Record<string, unknown>;
  const fields = ["v", "to", "from", "note", "theme"];
  if (data.v === 2) fields.push("photos");
  if (
    Object.keys(data).length !== fields.length ||
    fields.some((key) => !Object.hasOwn(data, key))
  ) {
    throw new Error("This gift has an unsupported format.");
  }
  if (
    (data.v !== 1 && data.v !== 2) ||
    (data.theme !== "rose" && data.theme !== "ring")
  )
    throw new Error("This gift has an unsupported format.");
  const text = (key: string, limit: number) => {
    const raw = data[key];
    if (typeof raw !== "string")
      throw new Error("Please add a name and a personal note.");
    const normalized = raw.trim();
    const label =
      key === "note" ? "Your note" : key === "to" ? "Their name" : "Your name";
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(normalized)) {
      throw new Error(
        `${label} contains unsupported control characters. Remove them and try again.`,
      );
    }
    if (!normalized || [...normalized].length > limit) {
      throw new Error(`${label} must be between 1 and ${limit} characters.`);
    }
    return normalized;
  };
  return {
    ...(data.v === 1
      ? { v: 1 as const }
      : { v: 2 as const, photos: validatePhotos(data.photos) }),
    to: text("to", 60),
    from: text("from", 60),
    note: text("note", data.v === 1 ? 600 : LETTER_LIMIT),
    theme: data.theme,
  };
}

export function encodeGift(gift: Gift): string {
  const bytes = new TextEncoder().encode(JSON.stringify(validateGift(gift)));
  const encoded = btoa(
    Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
  );
  return (
    "gift=" +
    encoded.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "")
  );
}

export function decodeGift(fragment: string): Gift {
  const payload = fragment.replace(/^#/u, "");
  if (!payload.startsWith("gift=") || payload.length > LINK_LIMIT)
    throw new Error("This gift link is incomplete or too long.");
  const encoded = payload.slice(5);
  if (!/^[A-Za-z0-9_-]+$/u.test(encoded) || encoded.length % 4 === 1)
    throw new Error("This gift link is damaged.");
  try {
    const bytes = Uint8Array.from(
      atob(encoded.replaceAll("-", "+").replaceAll("_", "/")),
      (char) => char.charCodeAt(0),
    );
    return validateGift(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
    );
  } catch {
    throw new Error("This gift link is damaged or uses an unsupported format.");
  }
}

export function giftUrl(gift: Gift, base: string): string {
  const url = new URL(base);
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new Error("Open the website over HTTP or HTTPS before sharing.");
  url.search = "";
  url.hash = encodeGift(gift);
  if (url.hash.length > LINK_LIMIT)
    throw new Error("This album needs a smaller link or a gift file.");
  return url.href;
}
