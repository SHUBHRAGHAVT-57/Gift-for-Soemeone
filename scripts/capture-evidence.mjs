import assert from "node:assert/strict";
import { mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { chromium, webkit, expect } from "@playwright/test";

const root = new URL("../", import.meta.url);
const media = new URL("docs/media/", root);
const baseURL = "http://127.0.0.1:4403/Gift-for-Soemeone/";
const sample = {
  to: "Maya 💗",
  from: "Alex",
  note: "You make ordinary days beautiful.\nतुम खास हो।",
};
await mkdir(media, { recursive: true });
const errors = [];
const origins = new Set();
const captures = [];

async function capture(page, name, fullPage = false) {
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, media)), fullPage });
  const geometry = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    contentWidth: document.documentElement.scrollWidth,
    renderer: document.querySelector(".sculpture")?.getAttribute("data-renderer"),
    motion: document.querySelector(".sculpture")?.getAttribute("data-motion"),
  }));
  assert(geometry.contentWidth <= geometry.viewport.width, `${name} overflows horizontally`);
  captures.push({ name, ...geometry });
}

for (const [engineName, engine, viewport] of [
  ["desktop-chromium", chromium, { width: 1440, height: 960 }],
  ["phone-webkit", webkit, { width: 390, height: 844 }],
]) {
  const browser = await engine.launch();
  const context = await browser.newContext({
    viewport,
    hasTouch: engineName.startsWith("phone"),
    isMobile: engineName.startsWith("phone"),
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) => origins.add(new URL(request.url()).origin));
    await page.goto(baseURL);
    await expect(page.locator(".sculpture")).toHaveAttribute("data-renderer", "webgl");
    await capture(page, `${engineName}-creator`, engineName.startsWith("phone"));
    await page.getByLabel("Their name").fill(sample.to);
    await page.getByLabel("Your name").fill(sample.from);
    await page.getByLabel("Your note").fill(sample.note);
    await page.getByRole("button", { name: "Create gift link" }).click();
    const link = await page.getByLabel("Your gift link").inputValue();
    assert.equal(new URL(link).pathname, "/Gift-for-Soemeone/");
    await expect(page.getByRole("link", { name: /Open gift/ })).toHaveAttribute("href", link);
    await page.locator(".share-result").scrollIntoViewIfNeeded();
    await capture(page, `${engineName}-share`);
    await page.getByRole("button", { name: "Preview gift" }).click();
    await expect(page.locator("#gift-title")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Open your gift" })).toBeFocused();
    await capture(page, `${engineName}-keyboard-preview`, true);
    await page.keyboard.press("Enter");
    await expect(page.locator(".personal-note")).toHaveText(sample.note);
    await expect(page.locator(".personal-note")).toBeFocused();
    await expect(page.locator(".sculpture")).toHaveAttribute("data-motion", "reduced");
    await capture(page, `${engineName}-reveal`, true);
    await page.getByRole("button", { name: "Replay the reveal" }).click();
    await page.getByRole("button", { name: "Back to editing" }).click();
    await expect(page.getByLabel("Your note")).toHaveValue(sample.note);
    await page.getByRole("radio", { name: /Diamond ring/ }).check();
    await page.getByRole("button", { name: "Preview gift" }).click();
    await page.getByRole("button", { name: "Open your gift" }).click();
    await expect(page.locator(".sculpture")).toHaveAttribute("data-renderer", "webgl");
    await capture(page, `${engineName}-ring`, true);
    await page.goto(link);
    await page.locator(".sculpture canvas").waitFor();
    await page.locator(".sculpture canvas").evaluate((canvas) => {
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    });
    await page.getByRole("button", { name: "Open your gift" }).click();
    await expect(page.locator(".fallback-art")).toBeVisible();
    await expect(page.locator(".personal-note")).toHaveText(sample.note);
    await capture(page, `${engineName}-fallback`, true);
  } finally {
    await context.close();
    await browser.close();
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  recordVideo: { dir: fileURLToPath(media), size: { width: 1280, height: 900 } },
});
const page = await context.newPage();
const video = page.video();
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => origins.add(new URL(request.url()).origin));
try {
  await page.goto(baseURL);
  await expect(page.locator(".sculpture")).toHaveAttribute("data-renderer", "webgl");
  await page.waitForTimeout(700);
  await page.getByRole("link", { name: /Make something beautiful/ }).click();
  await page.getByLabel("Their name").fill(sample.to);
  await page.getByLabel("Your name").fill(sample.from);
  await page.getByLabel("Your note").fill(sample.note);
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Preview gift" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.locator(".sculpture")).toHaveAttribute("data-progress", "1.00", { timeout: 10000 });
  await expect(page.locator(".personal-note")).toHaveText(sample.note);
  await page.locator(".letter").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Replay the reveal" }).click();
  await page.getByRole("button", { name: "Back to editing" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Create gift link" }).click();
  await expect(page.getByLabel("Your gift link")).toBeVisible();
  await page.waitForTimeout(1000);
} finally {
  await context.close();
  await browser.close();
}
assert(video);
const originalVideo = await video.path();
await rename(originalVideo, fileURLToPath(new URL("walkthrough.webm", media)));

const assets = [];
for (const name of await readdir(new URL("dist/assets/", root))) {
  const path = new URL(`dist/assets/${name}`, root);
  const data = await readFile(path);
  assets.push({ name, bytes: (await stat(path)).size, gzipBytes: gzipSync(data).length });
}
assert.deepEqual(errors, []);
assert.deepEqual([...origins], [new URL(baseURL).origin]);
const result = { capturedAt: new Date().toISOString(), sampleContent: "Synthetic demo only", captures, origins: [...origins], pageErrors: errors, assets };
await writeFile(new URL("capture-results.json", media), JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
