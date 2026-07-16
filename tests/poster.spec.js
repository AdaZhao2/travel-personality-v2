const { expect, test } = require("@playwright/test");
const jsQR = require("jsqr");
const { PNG } = require("pngjs");

test("generates a fixed poster with a working invitation QR code", async ({ page }) => {
  const payload = Buffer.from(JSON.stringify({
    p: "chaos-traveller",
    s: { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 },
    a: "aaaaaaaaaaaaaaaa",
  })).toString("base64");

  await page.goto(`/?result=${encodeURIComponent(payload)}`);
  await expect(page.getByTestId("persona-code")).toHaveText("JOKER");

  await page.getByRole("button", { name: "生成人格海报" }).click();
  await expect(page.getByRole("dialog", { name: "人格海报预览" })).toBeVisible();
  await expect(page.getByAltText("JOKER 人格海报预览")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存图片" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();

  const png = PNG.sync.read(require("node:fs").readFileSync(path));
  expect({ width: png.width, height: png.height }).toEqual({ width: 1080, height: 1440 });

  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded).not.toBeNull();
  const invite = new URL(decoded.data);
  expect(invite.origin).toBe(new URL(page.url()).origin);
  expect(invite.searchParams.get("from")).toBe("chaos-traveller");
  expect(invite.searchParams.has("result")).toBe(false);
});

test("shares exactly one poster file without duplicate clipboard representations", async ({ page }) => {
  const payload = Buffer.from(JSON.stringify({
    p: "chaos-traveller",
    s: { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 },
    a: "aaaaaaaaaaaaaaaa",
  })).toString("base64");

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (data) => Array.isArray(data.files) && data.files.length === 1,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data) => {
        window.__posterSharePayload = {
          keys: Object.keys(data).sort(),
          fileCount: data.files?.length ?? 0,
          fileType: data.files?.[0]?.type,
        };
      },
    });
  });

  await page.goto(`/?result=${encodeURIComponent(payload)}`);
  await page.getByRole("button", { name: "生成人格海报" }).click();
  await expect(page.getByRole("dialog", { name: "人格海报预览" })).toBeVisible();
  await page.getByRole("button", { name: "分享到社交软件" }).click();
  await expect(page.getByText("已打开系统分享", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__posterSharePayload)).toEqual({
    keys: ["files"],
    fileCount: 1,
    fileType: "image/png",
  });
});
