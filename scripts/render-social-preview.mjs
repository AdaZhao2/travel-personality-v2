import fs from "node:fs";
import { chromium } from "playwright";

const [source, output = "public/social-preview.png"] = process.argv.slice(2);
if (!source) throw new Error("Usage: node scripts/render-social-preview.mjs <background.png> [output.png]");

const background = fs.readFileSync(source).toString("base64");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

await page.setContent(`
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; width: 1200px; height: 630px; overflow: hidden; font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", Arial, sans-serif; }
    main { position: relative; width: 1200px; height: 630px; overflow: hidden; color: #fffdf7; background: #17142f; }
    .art { position: absolute; inset: 0; background: url(data:image/png;base64,${background}) center/cover no-repeat; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(23,20,47,.98) 0%, rgba(23,20,47,.88) 34%, rgba(23,20,47,.14) 64%, transparent 100%); }
    .content { position: absolute; inset: 52px 56px 44px 64px; display: flex; flex-direction: column; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 14px; font-size: 18px; font-weight: 900; letter-spacing: -.02em; }
    .logo { display: grid; place-items: center; width: 48px; height: 48px; border: 3px solid #17142f; border-radius: 14px; color: #17142f; background: #c8ff55; box-shadow: 5px 5px 0 #7657ff; transform: rotate(-5deg); font-size: 19px; }
    .badge { margin-top: 48px; border-radius: 999px; padding: 9px 16px; color: #17142f; background: #c8ff55; font-size: 17px; font-weight: 900; box-shadow: 4px 4px 0 #ff4fa3; }
    h1 { margin: 22px 0 0; max-width: 590px; font-family: "Arial Rounded MT Bold", "Avenir Next", Arial, sans-serif; font-size: 67px; font-weight: 900; line-height: .88; letter-spacing: -.06em; }
    h1 span { color: #ffd84d; }
    .tagline { margin: 25px 0 0; max-width: 530px; font-size: 29px; font-weight: 900; letter-spacing: -.03em; }
    .codes { margin-top: auto; display: flex; align-items: center; gap: 8px; color: #fffdf7; font-size: 15px; font-weight: 900; letter-spacing: .06em; }
    .codes strong { border: 2px solid rgba(255,255,255,.3); border-radius: 999px; padding: 7px 11px; background: rgba(118,87,255,.48); }
  </style>
  <main>
    <div class="art"></div>
    <div class="shade"></div>
    <section class="content">
      <div class="brand"><span class="logo">TP</span>Travel Personality Indicator</div>
      <div class="badge">⚡ 16 道互联网行为题</div>
      <h1>YOUR TRAVEL<br><span>PERSONALITY</span></h1>
      <p class="tagline">AI 看穿你的旅行人格。</p>
      <div class="codes"><strong>JOKER</strong><strong>FOOD</strong><strong>FOMO</strong><strong>ZZZZ</strong><strong>NPC</strong><strong>GPS</strong><strong>404</strong></div>
    </section>
  </main>
`);

await page.screenshot({ path: output, type: "png" });
await browser.close();
