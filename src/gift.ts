export type Theme = "rose" | "ring";
export interface Gift {
  v: 1;
  to: string;
  from: string;
  note: string;
  theme: Theme;
}

const MAX_PAYLOAD = 16000;
const fields = ["v", "to", "from", "note", "theme"];

export function validateGift(value: unknown): Gift {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("This gift is not valid.");
  const data = value as Record<string, unknown>;
  if (
    Object.keys(data).length !== fields.length ||
    fields.some((key) => !Object.hasOwn(data, key))
  ) {
    throw new Error("This gift has an unsupported format.");
  }
  if (data.v !== 1 || (data.theme !== "rose" && data.theme !== "ring"))
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
    v: 1,
    to: text("to", 60),
    from: text("from", 60),
    note: text("note", 600),
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
  if (!payload.startsWith("gift=") || payload.length > MAX_PAYLOAD)
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
  return url.href;
}
