import { expect, test } from "@playwright/test";
import { skyscannerUrl } from "../lib/scoring";
import { createResultHash } from "../lib/share";
import { dimensionLevel } from "../lib/constants";

test("turns numeric travel DNA scores into share-friendly levels", () => {
  expect([0, 39, 40, 59, 60, 79, 80, 100].map(dimensionLevel)).toEqual([
    "低调", "低调", "在线", "在线", "高能", "高能", "爆表", "爆表",
  ]);
});

test("creates a stable result hash from persona, scores and answers", () => {
  const scores = { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 };
  const first = createResultHash("chaos-traveller", scores, "aaaaaaaaaaaaaaaa");
  expect(first).toMatch(/^#TPI-[0-9A-F]{8}$/);
  expect(createResultHash("chaos-traveller", scores, "aaaaaaaaaaaaaaaa")).toBe(first);
  expect(createResultHash("chaos-traveller", scores, "baaaaaaaaaaaaaaa")).not.toBe(first);
});

test("builds China and UK departure links from the interface language", () => {
  const zh = new URL(skyscannerUrl("EDI", "zh"));
  expect(Object.fromEntries(zh.searchParams)).toMatchObject({
    origin: "CN", destination: "EDI", market: "CN", locale: "zh-CN", currency: "CNY",
  });

  const en = new URL(skyscannerUrl("EDI", "en"));
  expect(Object.fromEntries(en.searchParams)).toMatchObject({
    origin: "UK", destination: "EDI", market: "UK", locale: "en-GB", currency: "GBP",
  });
});

test("completes the 16-question experience and renders a shareable result", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /AI看穿\s*你的旅行人格/ })).toBeVisible();
  await page.getByRole("button", { name: /开始暴露自己/ }).click();

  for (let index = 1; index <= 16; index += 1) {
    await expect(page.getByTestId("question")).toHaveCount(1);
    const question = page.getByTestId("question");
    const questionId = await question.getAttribute("data-question-id");
    await page.getByTestId("answer-a").click();
    if (index < 16) {
      await page.waitForFunction((previousId) => {
        const questions = document.querySelectorAll('[data-testid="question"]');
        return questions.length === 1 && questions[0].getAttribute("data-question-id") !== previousId;
      }, questionId);
    }
  }

  await expect(page.getByText("Local roast engine", { exact: true })).toBeVisible();
  await expect(page.getByText("AI 总结", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/方案 [1-6] ·/)).toBeVisible();
  await expect(page.getByTestId("travel-advice")).toContainText("旅行建议");
  await expect(page.getByTestId("travel-advice")).not.toContainText(/\d+ 分/);
  await expect(page.getByText("互联网行为小票")).toHaveCount(0);
  await expect(page.getByText("旅行处方")).toHaveCount(0);
  await expect(page.getByTestId("persona-code")).toHaveText(/^(JOKER|FOOD|RICH|C位|FOMO|ZZZZ|NPC|GPS|404)$/);
  await expect(page.getByTestId("result-hash")).toHaveText(/^#TPI-[0-9A-F]{8}$/);
  await expect(page.locator('[aria-label="旅行人格六维雷达图"] svg')).toBeVisible();
  const flightLinks = page.getByRole("link", { name: /从中国飞往/ });
  await expect(flightLinks).toHaveCount(3);
  for (const href of await flightLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
    const url = new URL(String(href));
    expect(`${url.origin}${url.pathname}`).toBe("https://www.skyscanner.net/g/referrals/v1/flights/browse-view");
    expect(url.searchParams.get("origin")).toBe("CN");
    expect(url.searchParams.get("destination")).toMatch(/^[A-Z]{3}$/);
    expect(url.searchParams.get("market")).toBe("CN");
    expect(url.searchParams.get("locale")).toBe("zh-CN");
    expect(url.searchParams.get("currency")).toBe("CNY");
  }
  await expect(page.getByRole("button", { name: "生成人格海报" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享结果链接" })).toBeVisible();
  await expect(page.getByRole("button", { name: "邀请朋友来测" })).toBeVisible();
});

test("ships without an AI analysis endpoint", async ({ request }) => {
  const response = await request.post("/api/analyze", { data: { answers: [] } });
  expect(response.status()).toBe(404);
});

test("opens an invited quiz with a neutral invitation", async ({ page }) => {
  await page.goto("/?from=chaos-traveller");
  await expect(page.getByText(/Chaos Traveller.*邀请你来对答案/)).toBeVisible();
  await expect(page.getByText(/伟大航路/)).toHaveCount(1); // teaser card only; no inviter result disclosure
});

test("keeps old Airport Dad links working after its persona merge", async ({ page }) => {
  await page.goto("/?from=airport-dad");
  await expect(page.getByText(/GPS · Budget Alchemist.*邀请你来对答案/)).toBeVisible();
  await expect(page.getByText(/Airport Dad|老父亲/)).toHaveCount(0);
});

test("maps retired persona links to their closest retained result", async ({ page }) => {
  const aliases = [
    ["weekend-goblin", /FOMO · FOMO Rocketeer/],
    ["airport-guardian", /GPS · Budget Alchemist/],
    ["spreadsheet-pilot", /GPS · Budget Alchemist/],
    ["maps-believer", /GPS · Budget Alchemist/],
    ["aesthetic-smuggler", /C位 · Main Character Traveller/],
    ["dopamine-nomad", /FOMO · FOMO Rocketeer/],
    ["off-grid-oracle", /404 · Planet Earth Expat/],
    ["hidden-gem-collector", /404 · Planet Earth Expat/],
    ["culture-time-traveller", /GPS · Budget Alchemist/],
  ] as const;

  for (const [legacyId, expected] of aliases) {
    await page.goto(`/?from=${legacyId}`);
    await expect(page.getByText(new RegExp(`${expected.source}.*邀请你来对答案`))).toBeVisible();
  }
});

test("copies a URL-safe result link that restores the shared result", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4173" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  });
  const payload = Buffer.from(JSON.stringify({
    p: "chaos-traveller",
    s: { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 },
    a: "aaaaaaaaaaaaaaaa",
  })).toString("base64");
  await page.goto(`/?result=${encodeURIComponent(payload)}`);

  await page.getByRole("button", { name: "分享结果链接" }).click();
  await expect(page.getByText("结果链接已复制，可直接粘贴打开")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  const sharedUrl = new URL(copied);
  expect(sharedUrl.searchParams.has("rid")).toBe(false);
  expect(sharedUrl.hash).toMatch(/^#TPI-[0-9A-F]{8}$/);
  const encodedResult = sharedUrl.searchParams.get("result");
  expect(encodedResult).toMatch(/^[A-Za-z0-9_-]+$/);

  const receiver = await context.newPage();
  await receiver.goto(copied);
  await expect(receiver.getByTestId("persona-code")).toHaveText("JOKER");
  await expect(receiver.getByTestId("result-hash")).toHaveText(/^#TPI-[0-9A-F]{8}$/);
  await expect(receiver.getByText("AI 总结", { exact: true })).toBeVisible();
  await expect(receiver.getByText("你在疯狂解锁隐藏剧情。")).toBeVisible();
  await expect(receiver.getByText("“来都来了。”")).toBeVisible();
});
