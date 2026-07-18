import fs from "node:fs";
import { chromium } from "playwright";
import QRCode from "qrcode";

const args = process.argv.slice(2);
const overlayExisting = args.includes("--overlay-existing");
const positional = args.filter((arg) => arg !== "--overlay-existing");
const [source, output = "public/social-preview.png", testUrl = "https://carolineli352.github.io/travel-personality-v2/"] = positional;
if (!source) {
  throw new Error(
    "Usage: node scripts/render-social-preview.mjs <background.png> [output.png] [test-url] [--overlay-existing]",
  );
}

const background = fs.readFileSync(source).toString("base64");
const qrCode = await QRCode.toDataURL(testUrl, {
  errorCorrectionLevel: "H",
  margin: 1,
  width: 104,
  color: { dark: "#17142f", light: "#ffffff" },
});
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.setContent(`
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; width: 1200px; height: 630px; overflow: hidden; font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", Arial, sans-serif; }
    main { position: relative; width: 1200px; height: 630px; overflow: hidden; color: #fffdf7; background: #17142f; }
    .art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(23,20,47,.98) 0%, rgba(23,20,47,.88) 34%, rgba(23,20,47,.14) 64%, transparent 100%); }
    .content { position: absolute; inset: 52px 56px 44px 64px; display: flex; flex-direction: column; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 14px; font-size: 18px; font-weight: 900; letter-spacing: -.02em; }
    .logo { display: grid; place-items: center; width: 48px; height: 48px; border: 3px solid #17142f; border-radius: 14px; color: #17142f; background: #c8ff55; box-shadow: 5px 5px 0 #7657ff; transform: rotate(-5deg); font-size: 19px; }
    .badge { margin-top: 48px; border-radius: 999px; padding: 9px 16px; color: #17142f; background: #c8ff55; font-size: 17px; font-weight: 900; box-shadow: 4px 4px 0 #ff4fa3; }
    h1 { margin: 22px 0 0; max-width: 590px; font-family: "Arial Rounded MT Bold", "Avenir Next", Arial, sans-serif; font-size: 67px; font-weight: 900; line-height: .88; letter-spacing: -.06em; }
    h1 span { color: #ffd84d; }
    .tagline { margin: 25px 0 0; max-width: 530px; font-size: 29px; font-weight: 900; letter-spacing: -.03em; }
    .codes-cleanup { position: absolute; left: 54px; bottom: 0; z-index: 1; width: 700px; height: 100px; overflow: hidden; background: #17142f; clip-path: polygon(0 0, 80% 0, 100% 100%, 0 100%); }
    .codes-cleanup::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, #201647, #392579); clip-path: polygon(62% 0, 100% 100%, 38% 100%); }
    .qr-card { position: absolute; left: 64px; bottom: 42px; z-index: 2; display: flex; align-items: center; gap: 13px; width: 258px; padding: 10px 14px 10px 10px; border: 2px solid rgba(255,255,255,.32); border-radius: 17px; color: #fffdf7; background: rgba(23,20,47,.9); box-shadow: 4px 4px 0 rgba(118,87,255,.65); }
    .qr-card img { display: block; flex: 0 0 auto; width: 104px; height: 104px; border-radius: 7px; }
    .qr-copy { min-width: 0; }
    .qr-card strong { display: block; font-size: 18px; font-weight: 900; line-height: 1.15; letter-spacing: -.03em; }
    .qr-card small { display: block; margin-top: 8px; color: #c8ff55; font-size: 13px; font-weight: 900; line-height: 1.3; }
  </style>
  <main>
    <img class="art" src="data:image/png;base64,${background}" alt="">
    ${overlayExisting ? "" : `
      <div class="shade"></div>
      <section class="content">
        <div class="brand"><span class="logo">TP</span>Travel Personality Indicator</div>
        <div class="badge">⚡ 16 道互联网行为题</div>
        <h1>YOUR TRAVEL<br><span>PERSONALITY</span></h1>
        <p class="tagline">AI 看穿你的旅行人格。</p>
      </section>
    `}
    ${overlayExisting ? '<div class="codes-cleanup"></div>' : ""}
    <aside class="qr-card" aria-label="扫码进入测试">
      <img src="${qrCode}" alt="测试页面二维码">
      <span class="qr-copy">
        <strong>扫码进入<br>旅行人格测试</strong>
        <small>测测你是哪种</small>
      </span>
    </aside>
  </main>
`);

await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
await page.screenshot({ path: output, type: "png" });
await browser.close();
