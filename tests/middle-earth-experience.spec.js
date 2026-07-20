// @ts-check
const { expect, test } = require("@playwright/test");

const payload = { p: "soft-life-migrant", s: { npc: 55, chaos: 25, hype: 20, spend: 65, camera: 45, control: 25 }, a: "aaaaaaaaaaaaaaaa" };
const encoded = (value) => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

test("中土世界生成远征订单、攻略和五站旅伴打卡图", async ({ page }) => {
  await page.goto(`/?result=${encoded(payload)}`);
  const entry = page.getByTestId("middle-earth-entry");
  await expect(entry).toHaveText(/门外，就是史诗/);
  await entry.click();
  await expect(page).toHaveURL(/\/middle-earth\/.*stage=world/);
  await page.getByRole("button", { name: /领取中土远征订单/ }).click();
  const order = page.getByTestId("middle-earth-order");
  await expect.poll(() => order.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
  await expect(order.getByRole("article")).toHaveCount(3);
  await order.getByRole("button", { name: /3 张凭证待验/ }).click();
  const map = page.getByTestId("middle-earth-map");
  const routeMap = map.locator('img[src*="/world-maps/middle-earth.webp"]');
  await expect(routeMap).toBeVisible();
  expect(await routeMap.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  const stops = [
    ["霍比屯", "霍比特旅人", "hobbiton"], ["瑞文戴尔", "灰袍巫师", "rivendell"],
    ["洛丝萝林", "精灵弓手", "lothlorien"], ["洛汗平原", "北境游侠", "rohan"],
    ["末日火山", "忠诚园丁", "mount-doom"],
  ];
  for (const [name, companion, image] of stops) {
    await map.getByRole("button", { name: new RegExp(name) }).click();
    await expect(map.getByText(`本次同行：${companion}`)).toBeVisible();
    const img = page.locator(`[data-testid="middle-earth-checkin-image"] img[src*="${image}"]`);
    await expect(img).toBeVisible();
    expect(await img.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByRole("button", { name: "保存图片" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享打卡图片" })).toHaveCount(0);
  await page.getByRole("button", { name: /远征结束，返回现实/ }).click();
  const reality = page.getByTestId("reality-section");
  await expect(reality).toBeVisible();
  await expect.poll(() => reality.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
});

test("中土入口仅在对应虚拟世界显示", async ({ page }) => {
  await page.goto(`/?result=${encoded({ ...payload, p: "chaos-traveller" })}`);
  await expect(page.getByTestId("middle-earth-entry")).toHaveCount(0);
});
