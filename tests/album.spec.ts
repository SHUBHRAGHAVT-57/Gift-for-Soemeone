import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

async function writeDraft(page: Page) {
  await page.goto("./");
  await page.getByLabel("Their name").fill("River");
  await page.getByLabel("Your name").fill("Robin");
  await page
    .getByLabel("Your letter")
    .fill("I kept the ticket.\n\nHere is the whole story <in ink>.");
}

async function addPhotos(page: Page) {
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    for (let y = 0; y < 800; y += 8) {
      for (let x = 0; x < 1200; x += 8) {
        ctx.fillStyle = `hsl(${(x * 17 + y * 23) % 360} 42% 58%)`;
        ctx.fillRect(x, y, 8, 8);
      }
    }
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const photo = {
    name: "synthetic-original-name.png",
    mimeType: "image/png",
    buffer: Buffer.from(bytes, "base64"),
  };
  await page.locator("#album-files").setInputFiles([photo, photo]);
  await expect(page.locator("#album-pages img")).toHaveCount(2);
  await page.getByLabel("Caption for photo 1").fill("Paper boats");
  await page.getByLabel("Caption for photo 2").fill("Second print");
  await page.getByRole("button", { name: "Earlier · photo 2" }).click();
}

async function readAlbum(page: Page) {
  await page.getByRole("button", { name: "Open your gift" }).click();
  await page.getByRole("button", { name: "Open our album" }).click();
  await expect(page.getByRole("img", { name: "Second print" })).toBeVisible();
  await page.getByRole("button", { name: "Enlarge photo 1" }).click();
  await expect(
    page.getByRole("dialog").getByRole("img", { name: "Second print" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close photo" }).click();
  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(page.getByRole("img", { name: "Paper boats" })).toBeVisible();
  await page.getByRole("button", { name: "A few words" }).click();
  await expect(
    page.getByRole("heading", { name: "I kept the ticket." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Unfold the letter" }).click();
  await expect(page.locator(".written-note")).toHaveText(
    "I kept the ticket.\n\nHere is the whole story <in ink>.",
  );
}

test("album link opens in a separate browser context and preview keeps the draft", async ({
  page,
  browser,
}) => {
  await writeDraft(page);
  await addPhotos(page);
  await page.getByRole("button", { name: "Preview gift" }).click();
  await readAlbum(page);
  await page.getByRole("button", { name: "Back to editing" }).click();
  await expect(page.getByLabel("Caption for photo 1")).toHaveValue(
    "Second print",
  );
  await page.getByRole("button", { name: "Create gift link" }).click();
  await expect(page.getByLabel("Your gift link")).toBeVisible();
  const link = await page.getByLabel("Your gift link").inputValue();
  expect(link.length).toBeLessThan(97000);
  const recipient = await browser.newContext({
    viewport: { width: 360, height: 780 },
  });
  try {
    const received = await recipient.newPage();
    await received.goto(link);
    await readAlbum(received);
    expect(
      await received.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(received.getByRole("textbox")).toHaveCount(0);
  } finally {
    await recipient.close();
  }
});

test("download contains the whole gift and opens offline without external requests", async ({
  page,
  browser,
}, testInfo) => {
  await writeDraft(page);
  await addPhotos(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download full-size gift" }).click();
  const filename = testInfo.outputPath("offline.html");
  await (await download).saveAs(filename);
  const html = await readFile(filename, "utf8");
  expect(html).not.toContain("synthetic-original-name");
  const context = await browser.newContext({
    offline: true,
    reducedMotion: "reduce",
  });
  try {
    const offline = await context.newPage();
    const outgoing: string[] = [];
    offline.on("request", (r) => {
      if (/^https?:/.test(r.url())) outgoing.push(r.url());
    });
    await offline.goto(pathToFileURL(filename).href);
    await readAlbum(offline);
    expect(outgoing).toEqual([]);
  } finally {
    await context.close();
  }
});

test("unsupported uploads leave the existing album intact and the next creator starts blank", async ({
  page,
}) => {
  await writeDraft(page);
  await addPhotos(page);
  await page
    .locator("#album-files")
    .setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("plain text"),
    });
  await expect(page.locator("#album-feedback")).toContainText("Choose JPG");
  await expect(page.locator("#album-pages img")).toHaveCount(2);
  await page.getByRole("button", { name: "Remove · photo 1" }).click();
  await expect(page.getByLabel("Caption for photo 1")).toHaveValue(
    "Paper boats",
  );
  await page.reload();
  await expect(page.locator("#album-pages img")).toHaveCount(0);
  await expect(page.getByLabel("Your letter")).toBeEmpty();
  await expect(page.getByLabel("Their name")).toBeEmpty();
});
