// @ts-check
const { expect, test } = require("@playwright/test");

const worlds = [
  { id: "galactic-empire", persona: "budget-alchemist", entry: "下一站，按光年算", cta: "领取星际迁徙订单", stops: [["双日沙漠前哨", "装甲导航员与侦察机器人", "twin-suns"], ["冰月极光站", "装甲导航员与侦察机器人", "ice-moon"], ["小行星自由港", "装甲导航员与侦察机器人", "asteroid-port"], ["森林卫星圣坛", "装甲导航员与侦察机器人", "forest-moon"], ["帝国环形空间站", "装甲导航员与侦察机器人", "ring-station"]] },
  { id: "atlantis", persona: "luxury-escaper", entry: "下潜，去海底度假", cta: "领取深海度假订单", stops: [["沉没之门", "亚特兰蒂斯绘图师", "sunken-gate"], ["珊瑚宫殿", "亚特兰蒂斯绘图师", "coral-palace"], ["鳐鱼花园", "亚特兰蒂斯绘图师", "manta-garden"], ["鲸歌档案馆", "亚特兰蒂斯绘图师", "whale-archive"], ["深渊神殿", "亚特兰蒂斯绘图师", "abyss-temple"]] },
  { id: "disney-castle", persona: "main-character", entry: "烟花前，进城堡", cta: "领取童话主角订单", stops: [["玫瑰桥", "童话公主旅行者", "rose-bridge"], ["魔法图书馆", "童话公主旅行者", "magic-library"], ["水晶花园", "童话公主旅行者", "crystal-garden"], ["灯笼村", "童话公主旅行者", "lantern-village"], ["烟花露台", "童话公主旅行者", "fireworks-terrace"]] },
  { id: "pandora", persona: "planet-earth-expat", entry: "地球之外，也能徒步", cta: "领取潘多拉探索订单", stops: [["哈利路亚悬浮山", "蓝色森林族生态探索者", "floating-mountains"], ["灵魂树", "蓝色森林族生态探索者", "spirit-tree"], ["荧光河", "蓝色森林族生态探索者", "glow-river"], ["翼兽巢穴", "蓝色森林族生态探索者", "ikran-nest"], ["礁海族海湾", "蓝色礁海族探索者", "reef-bay"]] },
  { id: "bikini-bottom", persona: "food-hunter", entry: "今天住进菠萝屋", cta: "领取比奇堡快乐订单", stops: [["菠萝屋", "海绵宝宝", "pineapple-home"], ["蟹堡餐厅", "红蟹餐厅老板", "krab-restaurant"], ["水母田", "章鱼音乐家", "jellyfish-fields"], ["酷乐湖", "粉红海星", "goo-lagoon"], ["树屋圆顶", "松鼠科学家", "tree-dome"]] },
];

const encoded = (persona) => Buffer.from(JSON.stringify({ p: persona, s: { npc: 45, chaos: 45, hype: 55, spend: 55, camera: 65, control: 55 }, a: "aaaaaaaaaaaaaaaa" }), "utf8").toString("base64url");

for (const world of worlds) {
  test(`${world.id} 完成订单、攻略和五站主题打卡流程`, async ({ page }) => {
    await page.goto(`/?result=${encoded(world.persona)}`);
    const entry = page.getByTestId(`${world.id}-entry`);
    await expect(entry).toHaveText(new RegExp(world.entry));
    await entry.click();
    await expect(page).toHaveURL(new RegExp(`/${world.id}/.*stage=world`));
    await expect(page.getByTestId(`${world.id}-world`)).toBeVisible();
    await page.getByRole("button", { name: new RegExp(world.cta) }).click();
    const order = page.getByTestId(`${world.id}-order`);
    await expect.poll(() => order.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
    await expect(order.getByRole("article")).toHaveCount(3);
    await order.getByRole("button", { name: /3 张凭证待验/ }).click();
    const map = page.getByTestId(`${world.id}-map`);
    await expect(map).toBeVisible();
    const routeMap = map.locator(`img[src*="/world-maps/${world.id}.webp"]`);
    await expect(routeMap).toBeVisible();
    expect(await routeMap.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
    for (const [name, companion, imageName] of world.stops) {
      await page.getByTestId(`${world.id}-stop-${imageName}`).click();
      await expect(map.getByText(`本次同行：${companion}`)).toBeVisible();
      const image = page.locator(`[data-testid="${world.id}-checkin-image"] img[src*="${imageName}"]`);
      await expect(image).toBeVisible();
      expect(await image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0);
      await expect(image).toHaveAttribute("alt", new RegExp(name));
    }
    await expect(page.getByRole("button", { name: "保存图片" })).toBeVisible();
    await expect(page.getByRole("button", { name: "分享打卡图片" })).toHaveCount(0);
    await page.getByTestId("themed-return-reality").click();
    const reality = page.getByTestId("reality-section");
    await expect(reality).toBeVisible();
    await expect.poll(() => reality.evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(80);
  });
}

test("比奇堡入口同时适配 FOOD 与 NPC 两种人格", async ({ page }) => {
  await page.goto(`/?result=${encoded("social-compass")}`);
  await expect(page.getByTestId("bikini-bottom-entry")).toBeVisible();
});
