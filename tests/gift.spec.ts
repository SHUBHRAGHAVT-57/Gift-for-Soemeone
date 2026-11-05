import { test, expect } from "@playwright/test";
import { encodeGift } from "../src/gift";

const gift = {
  v: 1,
  to: "Maya 💗",
  from: "Alex",
  note: "You are my favorite ordinary day.\nतुम खास हो।",
  theme: "rose",
} as const;

async function fillGift(page: import("@playwright/test").Page) {
  await page.getByLabel("Their name").fill(gift.to);
  await page.getByLabel("Your name").fill(gift.from);
  await page.getByLabel("Your note").fill(gift.note);
}

test("creator previews a gift, reveals its note and preserves the draft on return", async ({
  page,
}) => {
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("button", { name: "Preview gift" }).click();
  await expect(
    page.getByRole("heading", { name: "Maya 💗, this is for you." }),
  ).toBeVisible();
  await expect(page.getByText(gift.note, { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Replay the reveal" }).click();
  await expect(
    page.getByRole("button", { name: "Open your gift" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to editing" }).click();
  await expect(page.getByLabel("Your note")).toHaveValue(gift.note);
  await expect(
    page.getByRole("button", { name: "Preview gift" }),
  ).toBeFocused();
});

test("share link opens a dedicated recipient view without editor controls", async ({
  page,
}) => {
  await page.goto("./#" + encodeGift(gift));
  await expect(
    page.getByRole("heading", { name: "Maya 💗, this is for you." }),
  ).toBeVisible();
  await expect(page.getByLabel("Their name")).toHaveCount(0);
  await page.getByRole("button", { name: "Open your gift" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
  await expect(
    page.getByText("With love, Alex", { exact: true }),
  ).toBeVisible();
});

test("preview never exposes untrusted note text as HTML", async ({ page }) => {
  await page.goto(
    "./#" +
      encodeGift({ ...gift, note: '<img src=x onerror="window.bad=true">' }),
  );
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(
    page.getByText('<img src=x onerror="window.bad=true">', { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.querySelector(".letter img")),
  ).toBeNull();
});

test("malformed gifts have a recoverable error", async ({ page }) => {
  await page.goto("./#gift=broken!!!!");
  await expect(
    page.getByRole("heading", { name: "This gift needs a little help." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create a new gift" }).click();
  await expect(page.getByLabel("Their name")).toBeVisible();
});

test("denied clipboard provides a selectable link, and editing invalidates it", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    }),
  );
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("button", { name: "Create gift link" }).click();
  const link = page.getByLabel("Your gift link");
  await expect(link).toBeVisible();
  const url = await link.inputValue();
  expect(url).toContain("#gift=");
  await expect(page.getByRole("status")).toContainText("Copy the link");
  await page.getByLabel("Their name").fill("A different person");
  await expect(link).toBeHidden();
});

test("theme changes update the scene and the generated gift", async ({
  page,
}) => {
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("radio", { name: /Diamond ring/ }).check();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-theme",
    "ring",
  );
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "aria-label",
    /diamond ring/,
  );
  await page.getByRole("button", { name: "Preview gift" }).click();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-theme",
    "ring",
  );
  await page.getByRole("button", { name: "Back to editing" }).click();
  await expect(page.getByRole("radio", { name: /Diamond ring/ })).toBeChecked();
});

test("reduced motion opens the gift without a continuous animation loop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#" + encodeGift(gift));
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
});

test("WebGL absence preserves the static sculpture and personal note", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("./#" + encodeGift(gift));
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
  await expect(page.locator(".fallback-art")).toBeVisible();
  const bounds = await page.locator(".fallback-art").evaluate((svg) => {
    const box = (svg as SVGGraphicsElement).getBBox();
    return {
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(400);
  expect(bounds.bottom).toBeLessThanOrEqual(480);
});

test("context loss switches to a deliberate fallback", async ({ page }) => {
  await page.goto("./#" + encodeGift(gift));
  await page.getByRole("button", { name: "Open your gift" }).click();
  await page.locator(".sculpture canvas").waitFor();
  await page
    .locator(".sculpture canvas")
    .evaluate((canvas) =>
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(page.locator(".fallback-art")).toBeVisible();
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
});

test("phone layouts stay within the viewport and accept touch interactions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("button", { name: "Preview gift" }).click();
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("native share cancellation is not reported as a successful share", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new DOMException("Canceled", "AbortError");
      },
    }),
  );
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("button", { name: "Share gift" }).click();
  await expect(page.locator('[role="status"]')).toBeEmpty();
});

test("maximum length Unicode names and notes wrap in the recipient view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(
    "./#" +
      encodeGift({ ...gift, to: "💗".repeat(60), note: "言".repeat(600) }),
  );
  await page.getByRole("button", { name: "Open your gift" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".letter")).toBeVisible();
});

test("both themes render real particles without browser or shader errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("./");
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  const canvas = page.locator(".sculpture canvas");
  expect((await canvas.screenshot()).length).toBeGreaterThan(7000);
  await page.getByRole("radio", { name: /Diamond ring/ }).check();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-theme",
    "ring",
  );
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  expect((await canvas.screenshot()).length).toBeGreaterThan(7000);
  expect(errors).toEqual([]);
});

test("an early open survives a delayed scene module", async ({ page }) => {
  await page.route("**/assets/scene-*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto("./#" + encodeGift(gift));
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  await expect
    .poll(async () =>
      Number(await page.locator(".sculpture").getAttribute("data-progress")),
    )
    .toBe(1);
});

test("pausing and reduced motion stop frame scheduling", async ({ page }) => {
  await page.addInitScript(() => {
    const original = requestAnimationFrame;
    const counter = { frames: 0 };
    Object.assign(window, { frameCounter: counter });
    window.requestAnimationFrame = (callback) =>
      original((time) => {
        counter.frames++;
        callback(time);
      });
  });
  await page.goto("./");
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  await page.getByRole("button", { name: "Pause animation" }).click();
  const getFrames = () =>
    page.evaluate(
      () =>
        (window as unknown as { frameCounter: { frames: number } }).frameCounter
          .frames,
    );
  const paused = await getFrames();
  await page.waitForTimeout(250);
  expect(await getFrames()).toBe(paused);
  await page.getByRole("button", { name: "Resume animation" }).click();
  await expect.poll(getFrames).toBeGreaterThan(paused);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".sculpture")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  const reduced = await getFrames();
  await page.waitForTimeout(250);
  expect(await getFrames()).toBe(reduced);
});

test("a pending clipboard result cannot resurrect an outdated link after editing", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () =>
          new Promise<void>((resolve) => {
            Object.assign(window, { finishCopy: resolve });
          }),
      },
    }),
  );
  await page.goto("./");
  await fillGift(page);
  await page.getByRole("button", { name: "Create gift link" }).click();
  await page.getByLabel("Their name").fill("Someone else");
  await page.evaluate(() =>
    (window as unknown as { finishCopy: () => void }).finishCopy(),
  );
  await expect(page.locator('[role="status"]')).toBeEmpty();
  await expect(page.getByLabel("Your gift link")).toBeHidden();
});

test("recipient skip link preserves the gift and moves focus to its content", async ({
  page,
}) => {
  await page.goto("./#" + encodeGift(gift));
  const giftUrl = page.url();
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Maya 💗, this is for you." }),
  ).toBeVisible();
  await expect(page.locator("#main")).toBeFocused();
  expect(page.url()).toBe(giftUrl);
  await page.getByRole("button", { name: "Open your gift" }).click();
  await expect(page.getByText(gift.note, { exact: true })).toBeVisible();
});

test("paused motion retains the correct accessible action across preview", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Pause animation" }).click();
  await fillGift(page);
  await page.getByRole("button", { name: "Preview gift" }).click();
  await expect(
    page.getByRole("button", { name: "Resume animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Back to editing" }).click();
  await expect(
    page.getByRole("button", { name: "Resume animation" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("a copied production link preserves the repository path and opens the intended gift", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("./?old-query=ignored");
  await fillGift(page);
  await page.getByRole("button", { name: "Create gift link" }).click();
  await expect(page.getByRole("status")).toContainText("Link copied");
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(link).pathname).toBe("/Gift-for-Soemeone/");
  expect(new URL(link).search).toBe("");
  const recipient = await context.newPage();
  await recipient.goto(link);
  await recipient.getByRole("button", { name: "Open your gift" }).click();
  await expect(recipient.getByText(gift.note, { exact: true })).toBeVisible();
  await expect(recipient.getByLabel("Their name")).toHaveCount(0);
});
