// @ts-check
const { expect, test } = require("@playwright/test");

const payload = {
  p: "fomo-rocketeer",
  s: { npc: 35, chaos: 75, hype: 100, spend: 70, camera: 65, control: 20 },
  a: "aaaaaaaaaaaaaaaa",
};

function encodedResult() {
  return Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

test("宝可梦世界入口生成订单、攻略与五站打卡图片", async ({ page }) => {
  await page.goto(`/?result=${encodeURIComponent(encodedResult())}`);
  const entry = page.getByTestId("pokemon-world-entry");
  await expect(entry).toHaveText(/不试试，怎么知道/);
  await entry.click();

  await expect(page).toHaveURL(/\/pokemon\/.*stage=world/);
  await expect(page.getByTestId("pokemon-world")).toBeVisible();
  await page.getByRole("button", { name: /领取你的训练家冒险订单/ }).click();

  const order = page.getByTestId("pokemon-order");
  await expect(order).toBeVisible();
  await expect.poll(() => order.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
  await expect(order.getByRole("article")).toHaveCount(3);
  await order.getByRole("button", { name: /3 张票待验/ }).click();

  const map = page.getByTestId("pokemon-map");
  await expect(map).toBeVisible();
  const routeMap = map.locator('img[src*="/world-maps/pokemon.webp"]');
  await expect(routeMap).toBeVisible();
  expect(await routeMap.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  const stops = [
    ["真新镇研究所", "皮卡丘", "research-center"],
    ["常青森林", "妙蛙种子", "viridian-forest"],
    ["月见山晶洞", "皮皮", "moon-mountain"],
    ["华蓝海岸", "沼王", "cerulean-coast-quagsire"],
    ["石英高原", "喷火龙", "indigo-plateau"],
  ];

  for (const [name, companion, imageName] of stops) {
    await map.getByRole("button", { name: new RegExp(name) }).click();
    await expect(map.getByText(`本次同行：${companion}`)).toBeVisible();
    const image = page.locator(`[data-testid="pokemon-checkin-image"] img[src*="${imageName}"]`);
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  }

  await expect(page.getByRole("button", { name: "保存图片" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享打卡图片" })).toHaveCount(0);
  await page.getByTestId("pokemon-return-reality").click();
  const reality = page.getByTestId("reality-section");
  await expect(reality).toBeVisible();
  await expect.poll(() => reality.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
});

test("非宝可梦理论世界不显示宝可梦入口", async ({ page }) => {
  const other = { ...payload, p: "chaos-traveller" };
  const encoded = Buffer.from(JSON.stringify(other), "utf8").toString("base64url");
  await page.goto(`/?result=${encodeURIComponent(encoded)}`);
  await expect(page.getByTestId("pokemon-world-entry")).toHaveCount(0);
});
