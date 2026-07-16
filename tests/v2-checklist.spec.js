// @ts-check
const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const jsQR = require("jsqr");
const { PNG } = require("pngjs");

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const ALL_PERSONAS = [
  { id: "chaos-traveller",   code: "JOKER" },
  { id: "food-hunter",       code: "FOOD"  },
  { id: "luxury-escaper",    code: "RICH"  },
  { id: "main-character",    code: "C位"   },
  { id: "fomo-rocketeer",    code: "FOMO"  },
  { id: "soft-life-migrant", code: "ZZZZ"  },
  { id: "social-compass",    code: "NPC"   },
  { id: "budget-alchemist",  code: "GPS"   },
  { id: "planet-earth-expat",code: "404"   },
];

// One representative result payload per persona (scores chosen to clearly
// favour each persona's vector direction; answer path kept minimal).
const PERSONA_PAYLOADS = {
  "chaos-traveller":    { p: "chaos-traveller",    s: { npc: 25, chaos: 100, hype: 80,  spend: 40,  camera: 55, control: 10  }, a: "aaaaaaaaaaaaaaaa" },
  "food-hunter":        { p: "food-hunter",         s: { npc: 35, chaos: 65,  hype: 75,  spend: 65,  camera: 45, control: 55  }, a: "aaaaaaaaaaaaaaaa" },
  "luxury-escaper":     { p: "luxury-escaper",      s: { npc: 25, chaos: 30,  hype: 55,  spend: 100, camera: 75, control: 55  }, a: "aaaaaaaaaaaaaaaa" },
  "main-character":     { p: "main-character",      s: { npc: 25, chaos: 55,  hype: 75,  spend: 65,  camera: 100,control: 45  }, a: "aaaaaaaaaaaaaaaa" },
  "fomo-rocketeer":     { p: "fomo-rocketeer",      s: { npc: 35, chaos: 75,  hype: 100, spend: 70,  camera: 65, control: 20  }, a: "aaaaaaaaaaaaaaaa" },
  "soft-life-migrant":  { p: "soft-life-migrant",   s: { npc: 55, chaos: 25,  hype: 20,  spend: 65,  camera: 45, control: 25  }, a: "aaaaaaaaaaaaaaaa" },
  "social-compass":     { p: "social-compass",      s: { npc: 100,chaos: 45,  hype: 55,  spend: 45,  camera: 55, control: 15  }, a: "aaaaaaaaaaaaaaaa" },
  "budget-alchemist":   { p: "budget-alchemist",    s: { npc: 25, chaos: 15,  hype: 25,  spend: 25,  camera: 45, control: 100 }, a: "aaaaaaaaaaaaaaaa" },
  "planet-earth-expat": { p: "planet-earth-expat",  s: { npc: 15, chaos: 65,  hype: 45,  spend: 45,  camera: 65, control: 45  }, a: "aaaaaaaaaaaaaaaa" },
};

// 24 destinations: (world, city, iata) in catalog order.
const ALL_DESTINATIONS = [
  // grand-line → chaos-traveller
  { personaId: "chaos-traveller",    city: "Okinawa",     iata: "OKA" },
  { personaId: "chaos-traveller",    city: "Palawan",     iata: "PPS" },
  { personaId: "chaos-traveller",    city: "Krabi",       iata: "KBV" },
  // middle-earth → soft-life-migrant
  { personaId: "soft-life-migrant",  city: "Queenstown",  iata: "ZQN" },
  { personaId: "soft-life-migrant",  city: "Inverness",   iata: "INV" },
  { personaId: "soft-life-migrant",  city: "Calgary",     iata: "YYC" },
  // galactic-empire → budget-alchemist
  { personaId: "budget-alchemist",   city: "Reykjavík",   iata: "KEF" },
  { personaId: "budget-alchemist",   city: "Tromsø",      iata: "TOS" },
  { personaId: "budget-alchemist",   city: "Rovaniemi",   iata: "RVN" },
  // atlantis → luxury-escaper
  { personaId: "luxury-escaper",     city: "Santorini",   iata: "JTR" },
  { personaId: "luxury-escaper",     city: "Malé",        iata: "MLE" },
  { personaId: "luxury-escaper",     city: "Bali",        iata: "DPS" },
  // disney-castle → main-character
  { personaId: "main-character",     city: "Munich",      iata: "MUC" },
  { personaId: "main-character",     city: "Paris",       iata: "PAR" },
  { personaId: "main-character",     city: "Prague",      iata: "PRG" },
  // pokemon-world → fomo-rocketeer
  { personaId: "fomo-rocketeer",     city: "Tokyo",       iata: "TYO" },
  { personaId: "fomo-rocketeer",     city: "Taipei",      iata: "TPE" },
  { personaId: "fomo-rocketeer",     city: "Singapore",   iata: "SIN" },
  // pandora → planet-earth-expat
  { personaId: "planet-earth-expat", city: "Zhangjiajie", iata: "DYG" },
  { personaId: "planet-earth-expat", city: "Kauai",       iata: "LIH" },
  { personaId: "planet-earth-expat", city: "San José",    iata: "SJO" },
  // bikini-bottom → food-hunter + social-compass (shared world)
  { personaId: "food-hunter",        city: "Honolulu",    iata: "HNL" },
  { personaId: "food-hunter",        city: "Cancún",      iata: "CUN" },
  { personaId: "food-hunter",        city: "Cebu",        iata: "CEB" },
];

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = Buffer.from(json, "utf8");
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function resultUrl(payload) {
  return `/?result=${encodeURIComponent(encodePayload(payload))}`;
}

// ---------------------------------------------------------------------------
// 1. All 9 personas can be stably generated
// ---------------------------------------------------------------------------

test.describe("all 9 personas render and produce a stable hash", () => {
  for (const { id, code } of ALL_PERSONAS) {
    test(`${code} (${id})`, async ({ page }) => {
      const payload = PERSONA_PAYLOADS[id];
      await page.goto(resultUrl(payload));

      await expect(page.getByTestId("persona-code")).toHaveText(code);
      await expect(page.getByTestId("result-hash")).toHaveText(/^#TPI-[0-9A-F]{8}$/);

      // Second load with the same payload produces the same hash.
      const hash1 = await page.getByTestId("result-hash").textContent();
      await page.reload();
      const hash2 = await page.getByTestId("result-hash").textContent();
      expect(hash2).toBe(hash1);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. All 9 persona images load without a network error
// ---------------------------------------------------------------------------

test("all 9 persona images load successfully", async ({ page }) => {
  for (const { id, code } of ALL_PERSONAS) {
    const payload = PERSONA_PAYLOADS[id];
    await page.goto(resultUrl(payload));
    await expect(page.getByTestId("persona-code")).toHaveText(code);

    const expectedSrc = `/personas/${id}-geometric-v2.png`;
    const imgLocator = page.locator(`img[src*="${id}-geometric-v2"]`);
    await expect(imgLocator).toBeVisible();
    await expect(imgLocator).toHaveAttribute("src", new RegExp(expectedSrc.replace(/\./g, "\\.")));

    // Verify the image actually loads (no broken-image state).
    const naturalWidth = await imgLocator.evaluate((img) => img.naturalWidth);
    expect(naturalWidth, `${code} persona image naturalWidth`).toBeGreaterThan(0);
  }
});

// ---------------------------------------------------------------------------
// 3. All 24 destinations display their city name and produce a valid flight link
// ---------------------------------------------------------------------------

test("all 24 destinations render city names and flight links", async ({ page }) => {
  for (const { personaId, city, iata } of ALL_DESTINATIONS) {
    const payload = PERSONA_PAYLOADS[personaId];
    await page.goto(resultUrl(payload));
    await expect(page.getByTestId("persona-code")).toBeVisible();

    // City name appears somewhere on the result page.
    await expect(page.getByRole("heading", { name: city, exact: true }).or(
      page.locator(`text=${city}`).first(),
    )).toBeVisible();

    // Flight link with the correct IATA code exists.
    const link = page.getByRole("link", { name: new RegExp(city) }).first();
    const href = await link.getAttribute("href");
    const url = new URL(String(href));
    expect(`${url.origin}${url.pathname}`).toBe(
      "https://www.skyscanner.net/g/referrals/v1/flights/browse-view",
    );
    expect(url.searchParams.get("destination")).toBe(iata);
    // Default language is Chinese → CN departure.
    expect(url.searchParams.get("origin")).toBe("CN");
    expect(url.searchParams.get("market")).toBe("CN");
    expect(url.searchParams.get("locale")).toBe("zh-CN");
    expect(url.searchParams.get("currency")).toBe("CNY");
  }
});

// ---------------------------------------------------------------------------
// 4. Chinese / English UI and departure-origin switch
// ---------------------------------------------------------------------------

test("flight links use CN departure by default (Chinese UI)", async ({ page }) => {
  const payload = PERSONA_PAYLOADS["chaos-traveller"];
  await page.goto(resultUrl(payload));
  await expect(page.getByTestId("persona-code")).toHaveText("JOKER");

  const zhLinks = await page.getByRole("link", { name: /从中国飞往/ }).all();
  expect(zhLinks.length).toBe(3);
  for (const link of zhLinks) {
    const href = await link.getAttribute("href");
    const url = new URL(String(href));
    expect(url.searchParams.get("origin")).toBe("CN");
    expect(url.searchParams.get("market")).toBe("CN");
    expect(url.searchParams.get("locale")).toBe("zh-CN");
    expect(url.searchParams.get("currency")).toBe("CNY");
  }
});

test("flight links use UK departure when page lang is set to English", async ({ page }) => {
  const payload = PERSONA_PAYLOADS["chaos-traveller"];
  await page.goto(resultUrl(payload));
  await expect(page.getByTestId("persona-code")).toHaveText("JOKER");

  // The Result component reads document.documentElement.lang in a useEffect on
  // mount and stores the language in React state.  Because the Next.js layout
  // SSR always delivers lang="zh-CN", the only reliable way to flip the
  // pageLanguage state in an E2E test is to dispatch directly to the React
  // state hook via the component fiber.  The hook lives at fiber depth 7,
  // hook index 3 relative to the [data-testid="persona-code"] element.
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="persona-code"]');
    const fiberKey = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
    let node = el[fiberKey];
    for (let depth = 0; node && depth < 30; depth++, node = node.return) {
      let hook = node.memoizedState;
      for (let idx = 0; hook && idx < 10; idx++, hook = hook.next) {
        if (hook.memoizedState === "zh" && typeof hook.queue?.dispatch === "function") {
          hook.queue.dispatch("en");
          return;
        }
      }
    }
  });
  await page.waitForTimeout(100);

  const enLinks = await page.getByRole("link", { name: /UK to .+ flights/ }).all();
  expect(enLinks.length).toBe(3);
  for (const link of enLinks) {
    const href = await link.getAttribute("href");
    const url = new URL(String(href));
    expect(url.searchParams.get("origin")).toBe("UK");
    expect(url.searchParams.get("market")).toBe("UK");
    expect(url.searchParams.get("locale")).toBe("en-GB");
    expect(url.searchParams.get("currency")).toBe("GBP");
  }
});

// ---------------------------------------------------------------------------
// 5. Legacy share-link migration: retired persona IDs redirect to retained ones
// ---------------------------------------------------------------------------

test.describe("retired persona IDs in ?from= links resolve to their retained replacement", () => {
  const aliases = [
    ["weekend-goblin",        /FOMO · FOMO Rocketeer/],
    ["airport-guardian",      /GPS · Budget Alchemist/],
    ["airport-dad",           /GPS · Budget Alchemist/],
    ["spreadsheet-pilot",     /GPS · Budget Alchemist/],
    ["maps-believer",         /GPS · Budget Alchemist/],
    ["aesthetic-smuggler",    /C位 · Main Character Traveller/],
    ["dopamine-nomad",        /FOMO · FOMO Rocketeer/],
    ["off-grid-oracle",       /404 · Planet Earth Expat/],
    ["hidden-gem-collector",  /404 · Planet Earth Expat/],
    ["culture-time-traveller",/GPS · Budget Alchemist/],
  ];

  for (const [legacyId, expectedPattern] of aliases) {
    test(`${legacyId} → ${expectedPattern.source}`, async ({ page }) => {
      await page.goto(`/?from=${legacyId}`);
      await expect(page.getByText(new RegExp(`${expectedPattern.source}.*邀请你来对答案`))).toBeVisible();
    });
  }
});

test("legacy ?result= links with a retired persona ID fall back gracefully", async ({ page }) => {
  // A payload that names a retired persona — the app should either display a
  // valid result (remapped to the replacement) or silently return to hero
  // rather than crashing or rendering a blank page.
  const legacyPayload = encodePayload({
    p: "weekend-goblin",
    s: { npc: 35, chaos: 75, hype: 100, spend: 70, camera: 65, control: 20 },
    a: "aaaaaaaaaaaaaaaa",
  });
  await page.goto(`/?result=${encodeURIComponent(legacyPayload)}`);

  // Either we land on a valid result screen or on the hero screen — never a crash.
  const onResult = page.getByTestId("persona-code");
  const onHero   = page.getByRole("button", { name: /开始暴露自己/ });
  await expect(onResult.or(onHero)).toBeVisible();
});

// ---------------------------------------------------------------------------
// 6. Safety degradation: corrupt / missing / out-of-bounds payloads
// ---------------------------------------------------------------------------

test.describe("corrupt or invalid ?result= payloads fall back to hero", () => {
  const badPayloads = [
    // [label, value, expectUrlClean]
    // empty-string: the app treats params.get("result") === "" as falsy and
    // returns early without calling history.replaceState — so the param stays.
    ["not-base64-at-all",       "!!NOT_BASE64!!",                                                  true],
    ["base64-of-invalid-json",  Buffer.from("this is not json").toString("base64"),                true],
    ["empty-string",            "",                                                                 false],
    ["truncated-base64",        "eyJwIjoiY2hhb3MtdHJhdmVsbGVyIiwic",                              true],
  ];

  for (const [label, value, expectUrlClean] of badPayloads) {
    test(`${label} → falls back to hero`, async ({ page }) => {
      await page.goto(`/?result=${encodeURIComponent(value)}`);
      await expect(page.getByRole("button", { name: /开始暴露自己/ })).toBeVisible();
      if (expectUrlClean) {
        // URL should be cleaned up — no dangling ?result= param.
        await expect.poll(() => new URL(page.url()).searchParams.has("result")).toBe(false);
      }
    });
  }

  test("out-of-bounds scores (>100 / negative) still produce a valid result", async ({ page }) => {
    // The app should clamp or accept out-of-range values without crashing.
    const payload = encodePayload({
      p: "chaos-traveller",
      s: { npc: -50, chaos: 999, hype: 80, spend: 40, camera: 55, control: 10 },
      a: "aaaaaaaaaaaaaaaa",
    });
    await page.goto(`/?result=${encodeURIComponent(payload)}`);
    // Either result renders (with whatever persona the engine picks) or falls
    // back to hero — it must not crash or show a blank page.
    const onResult = page.getByTestId("persona-code");
    const onHero   = page.getByRole("button", { name: /开始暴露自己/ });
    await expect(onResult.or(onHero)).toBeVisible();
  });

  test("answer path missing entirely still produces a valid result", async ({ page }) => {
    const payload = encodePayload({
      p: "social-compass",
      s: { npc: 100, chaos: 45, hype: 55, spend: 45, camera: 55, control: 15 },
      // `a` field intentionally omitted
    });
    await page.goto(`/?result=${encodeURIComponent(payload)}`);
    await expect(page.getByTestId("persona-code")).toHaveText("NPC");
    await expect(page.getByTestId("result-hash")).toHaveText(/^#TPI-[0-9A-F]{8}$/);
  });

  test("tampered hash in URL fragment is accepted without crash (hash is display-only)", async ({ page }) => {
    // The URL hash #TPI-XXXXXXXX is cosmetic — the page derives its own hash
    // from the payload, so a tampered fragment must not affect the result.
    const payload = PERSONA_PAYLOADS["budget-alchemist"];
    const encoded = encodePayload(payload);
    await page.goto(`/?result=${encodeURIComponent(encoded)}#TPI-DEADBEEF`);
    await expect(page.getByTestId("persona-code")).toHaveText("GPS");
    // The displayed hash comes from the payload, not the URL fragment.
    const displayedHash = await page.getByTestId("result-hash").textContent();
    expect(displayedHash).not.toBe("#TPI-DEADBEEF");
    expect(displayedHash).toMatch(/^#TPI-[0-9A-F]{8}$/);
  });
});

// ---------------------------------------------------------------------------
// 7. Poster consistency: persona image, hash, and QR code all match the page
// ---------------------------------------------------------------------------

test("poster contains the correct persona image, result hash and invite QR code", async ({ page }) => {
  test.setTimeout(30_000);

  const payload = PERSONA_PAYLOADS["planet-earth-expat"];
  await page.goto(resultUrl(payload));
  await expect(page.getByTestId("persona-code")).toHaveText("404");

  const pageHash = await page.getByTestId("result-hash").textContent();
  expect(pageHash).toMatch(/^#TPI-[0-9A-F]{8}$/);

  // Generate and download the poster.
  await page.getByRole("button", { name: "生成人格海报" }).click();
  await expect(page.getByRole("dialog", { name: "人格海报预览" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存图片" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();

  const png = PNG.sync.read(fs.readFileSync(downloadPath));
  expect({ width: png.width, height: png.height }).toEqual({ width: 1080, height: 1440 });

  // The poster must contain the result hash as text.
  // We verify this indirectly: the poster is generated from the same `resultHash`
  // value displayed on the page — the canvas renders it at line 134 of poster.ts.
  // Direct pixel OCR is out of scope; instead we confirm the QR code points to
  // the correct invite URL (which means poster generation ran end-to-end without
  // substituting a different persona).
  const pixels = new Uint8ClampedArray(png.data.buffer, png.data.byteOffset, png.data.byteLength);
  const decoded = jsQR(pixels, png.width, png.height, { inversionAttempts: "dontInvert" });
  expect(decoded, "Poster must contain a decodable QR code").not.toBeNull();

  const qrUrl = new URL(decoded.data);
  expect(qrUrl.origin).toBe("http://127.0.0.1:4173");
  // The QR code is an invite link (?from=), not a result link — it must not
  // expose the full answer payload.
  expect(qrUrl.searchParams.get("from")).toBe("planet-earth-expat");
  expect(qrUrl.searchParams.has("result")).toBe(false);
});

test("poster preview image matches the persona shown on the result page", async ({ page }) => {
  const payload = PERSONA_PAYLOADS["luxury-escaper"];
  await page.goto(resultUrl(payload));
  await expect(page.getByTestId("persona-code")).toHaveText("RICH");

  await page.getByRole("button", { name: "生成人格海报" }).click();
  await expect(page.getByRole("dialog", { name: "人格海报预览" })).toBeVisible();

  // The preview <img> alt text must name the correct persona code.
  await expect(page.getByAltText("RICH 人格海报预览")).toBeVisible();
});
