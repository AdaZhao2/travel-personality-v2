// @ts-check
const { expect, test } = require("@playwright/test");

const payload = { p: "main-character", s: { npc: 25, chaos: 55, hype: 75, spend: 65, camera: 100, control: 45 }, a: "aaaaaaaaaaaaaaaa" };
const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

test("从下方开始并在上方收尾可解锁贪婪之岛完整流程", async ({ page }) => {
  await page.goto(`/?result=${encoded}`);
  for (const screwId of ["bottom-left", "top-left", "bottom-right", "top-right"]) {
    await page.getByTestId(`hidden-world-screw-${screwId}`).click();
  }

  await expect(page).toHaveURL(/\/greed-island\/.*stage=world/);
  await expect(page.getByTestId("greed-island-world")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Greed Island/ })).toBeVisible();
  await expect(page.getByText("你的聪明，人类难以想象！")).toBeVisible();
  await expect(page.getByText(/这里不属于某一种人格/)).toBeVisible();
  await expect(page.getByText(/这份路线属于/)).toHaveCount(0);
  await expect(page.getByText(/已绑定人格代码/)).toHaveCount(0);
  const frog = page.getByRole("img", { name: "知道隐藏入口秘密的小青蛙" });
  await expect(frog).toBeVisible();
  expect(await frog.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);

  await page.getByRole("button", { name: /领取贪婪之岛入岛订单/ }).click();
  const order = page.getByTestId("greed-island-order");
  await expect.poll(() => order.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
  await expect(order.getByText(/不限旅行人格，隐藏规则验证通过/)).toBeVisible();
  await expect(order.getByRole("article")).toHaveCount(3);
  await order.getByRole("button", { name: /3 张凭证待验/ }).click();

  const map = page.getByTestId("greed-island-map");
  const routeMap = map.locator('img[src*="/world-maps/greed-island.webp"]');
  await expect(routeMap).toBeVisible();
  expect(await routeMap.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  const stops = [
    ["arrival-gate", "小杰"], ["antokiba", "奇犽"], ["masadora", "小杰与奇犽"],
    ["aiai", "小杰"], ["card-castle", "小杰与奇犽"],
  ];
  for (const [id, companion] of stops) {
    await page.getByTestId(`greed-island-stop-${id}`).click();
    await expect(map.getByText(`本次同行：${companion}`)).toBeVisible();
    const image = page.locator(`[data-testid="greed-island-checkin-image"] img[src*="${id}"]`);
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.getByRole("button", { name: "保存图片" })).toBeVisible();
  await expect(page.getByRole("button", { name: /分享/ })).toHaveCount(0);
  await page.getByTestId("themed-return-reality").click();
  const reality = page.getByTestId("reality-section");
  await expect(reality).toBeVisible();
  await expect.poll(() => reality.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
});

test("不满足首下尾上的顺序仍进入霍格沃兹", async ({ page }) => {
  await page.goto(`/?result=${encoded}`);
  for (const screwId of ["bottom-left", "top-left", "top-right", "bottom-right"]) {
    await page.getByTestId(`hidden-world-screw-${screwId}`).click();
  }
  await expect(page).toHaveURL(/\/hogwarts\/.*stage=world/);
  await expect(page.getByTestId("hogwarts-world")).toBeVisible();
});
