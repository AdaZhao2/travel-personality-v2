// @ts-check
const { expect, test } = require("@playwright/test");

const payload = {
  p: "chaos-traveller",
  s: { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 },
  a: "aaaaaaaaaaaaaaaa",
};

function encodedResult() {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

test("伟大航路入口生成订单、攻略和五位角色背影打卡图", async ({ page }) => {
  await page.goto(`/?result=${encodeURIComponent(encodedResult())}`);
  const entry = page.getByTestId("grand-line-entry");
  await expect(entry).toHaveText(/海图有了，还不上船/);
  await entry.click();

  await expect(page).toHaveURL(/\/grand-line\/.*stage=world/);
  await expect(page.getByTestId("grand-line-world")).toBeVisible();
  await page.getByRole("button", { name: /领取伟大航路出航订单/ }).click();

  const order = page.getByTestId("grand-line-order");
  await expect.poll(() => order.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
  await expect(order.getByRole("article")).toHaveCount(3);
  await order.getByRole("button", { name: /3 张凭证待验/ }).click();

  const map = page.getByTestId("grand-line-map");
  await expect(map).toBeVisible();
  const routeMap = map.locator('img[src*="/world-maps/grand-line.webp"]');
  await expect(routeMap).toBeVisible();
  expect(await routeMap.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  const stops = [
    ["颠倒山·双子岬", "路飞", "reverse-mountain"],
    ["威士忌山峰", "索隆", "whisky-peak"],
    ["小花园", "娜美", "little-garden"],
    ["阿拉巴斯坦", "罗宾", "alabasta"],
    ["空岛·白白海", "香吉士", "skypiea"],
  ];

  for (const [name, character, imageName] of stops) {
    await map.getByRole("button", { name: new RegExp(name.replace("·", ".")) }).click();
    await expect(map.getByText(`本次同行：${character}`)).toBeVisible();
    const image = page.locator(`[data-testid="grand-line-checkin-image"] img[src*="${imageName}"]`);
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  }

  await expect(page.getByRole("button", { name: "保存图片" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享打卡图片" })).toHaveCount(0);
  await page.getByTestId("grand-line-return-reality").click();
  const reality = page.getByTestId("reality-section");
  await expect(reality).toBeVisible();
  await expect.poll(() => reality.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
});

test("伟大航路按钮仅在对应虚拟世界显示", async ({ page }) => {
  const other = { ...payload, p: "fomo-rocketeer" };
  const encoded = Buffer.from(JSON.stringify(other), "utf8").toString("base64url");
  await page.goto(`/?result=${encodeURIComponent(encoded)}`);
  await expect(page.getByTestId("grand-line-entry")).toHaveCount(0);
});
