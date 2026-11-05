import type { Theme } from "./gift";

export function fallbackArt(theme: Theme): string {
  if (theme === "ring")
    return /* HTML */ `<svg
      class="fallback-art"
      viewBox="0 0 400 480"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="metal"
          x1="100"
          y1="140"
          x2="300"
          y2="400"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#f7ecdf" />
          <stop offset=".5" stop-color="#8b90ae" />
          <stop offset="1" stop-color="#f7ecdf" />
        </linearGradient>
      </defs>
      <ellipse
        cx="200"
        cy="295"
        rx="91"
        ry="99"
        stroke="url(#metal)"
        stroke-width="12"
      />
      <ellipse
        cx="200"
        cy="295"
        rx="91"
        ry="99"
        stroke="#fff4eb"
        stroke-width="1"
      />
      <path
        d="m200 215-62-79 28-33h68l28 33-62 79Zm-62-79h124m-96-33 34 112 34-112m-34 112-34-79 34-33 34 33-34 79"
        stroke="#eee6ff"
        stroke-width="2"
      />
      <path d="m150 180 12 33m88-33-12 33" stroke="#d4c5b8" stroke-width="5" />
    </svg>`;
  const petals = Array.from(
    { length: 16 },
    (_, i) =>
      `<path d="M0 46C-68 28-94-30-48-56C-15-78 34-58 36-15C38 15 14 33 0 46Z" fill="${i % 2 ? "#a7526d" : "#d48199"}" fill-opacity=".2" stroke="#edabc0" stroke-opacity=".65" stroke-width="1.2" transform="rotate(${i * 137.5}) scale(${1 - i * 0.045})"/>`,
  ).join("");
  return /* HTML */ `<svg
    class="fallback-art"
    viewBox="0 0 400 480"
    fill="none"
    aria-hidden="true"
  >
    <path d="M200 177c-14 79 15 139-4 241" stroke="#8aa590" stroke-width="3" />
    <path
      d="M200 289c39-69 80-54 80-54-7 38-35 62-80 54Zm-1 61c-32-62-78-53-78-53 9 37 39 57 78 53Z"
      fill="#496a55"
      stroke="#98b29c"
      stroke-width="1"
    />
    <g transform="translate(200 145)">${petals}</g>
    <path
      d="M190 145c-30-26 24-53 36-25s-31 48-45 17 18-54 40-42"
      stroke="#f4b1c4"
      stroke-width="2"
    />
  </svg>`;
}

export const flowerMark = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 27V15m0 8c-7 0-9-4-9-4 6-1 9 4 9 4Zm0-5c6 0 9-4 9-4-6-1-9 4-9 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 16C3 13 6 4 11 6c0-6 10-6 10 0 6-2 8 8-5 10Z" stroke="currentColor" stroke-width="1.5"/></svg>`;
export const arrow = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
