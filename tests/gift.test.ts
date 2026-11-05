import { test } from "node:test";
import assert from "node:assert/strict";
import { validateGift, encodeGift, decodeGift, giftUrl } from "../src/gift.ts";

const gift = {
  v: 1,
  to: "Ananya 💗",
  from: "Alex",
  note: "You make ordinary days beautiful.\nतुम खास हो。",
  theme: "rose",
} as const;

test("Unicode notes round trip without corrupting line breaks", () => {
  assert.deepEqual(decodeGift(encodeGift(gift)), gift);
  assert.deepEqual(decodeGift("#" + encodeGift(gift)), gift);
});

test("normalizes only surrounding whitespace and validates character limits", () => {
  assert.equal(validateGift({ ...gift, to: "  Maya  " }).to, "Maya");
  assert.doesNotThrow(() =>
    validateGift({ ...gift, to: "💗".repeat(60), note: "x".repeat(600) }),
  );
  for (const values of [
    { to: "" },
    { from: "  " },
    { note: "\n" },
    { to: "x".repeat(61) },
    { from: "x".repeat(61) },
    { note: "x".repeat(601) },
  ]) {
    assert.throws(() => validateGift({ ...gift, ...values }));
  }
});

test("strict schema rejects unsupported versions, themes and value types", () => {
  for (const value of [
    null,
    [],
    "gift",
    { ...gift, v: 2 },
    { ...gift, theme: "unknown" },
    { ...gift, to: 3 },
    { ...gift, extra: "surprise" },
  ]) {
    assert.throws(() => validateGift(value));
  }
  assert.equal(validateGift({ ...gift, theme: "ring" }).theme, "ring");
});

test("malformed, invalid UTF-8 and oversized link data are rejected", () => {
  for (const fragment of [
    "",
    "#",
    "%bad",
    "#gift=!!!!",
    "#gift=_w",
    "#gift=" + "a".repeat(16001),
    "#gift=e30",
  ]) {
    assert.throws(() => decodeGift(fragment));
  }
});

test("HTML-like content remains literal data", () => {
  const unsafe = { ...gift, note: '<img src=x onerror=alert(1)> & "love"' };
  assert.equal(decodeGift(encodeGift(unsafe)).note, unsafe.note);
});

test("links keep a GitHub Pages subpath and drop unrelated search/hash", () => {
  const url = new URL(
    giftUrl(gift, "https://example.github.io/for-you/?utm_source=old#old"),
  );
  assert.equal(url.pathname, "/for-you/");
  assert.equal(url.search, "");
  assert.deepEqual(decodeGift(url.hash), gift);
  assert.throws(() => giftUrl(gift, "javascript:alert(1)"));
});
