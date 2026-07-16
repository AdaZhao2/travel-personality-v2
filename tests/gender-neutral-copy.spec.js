const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

test("questions, answers and generated result copy stay gender-neutral", () => {
  const files = [
    "data/questions.json",
    "data/catalog.ts",
    "lib/analysis.ts",
    "components/hero.tsx",
    "components/quiz.tsx",
    "components/result.tsx",
  ];
  const copy = files
    .map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8"))
    .join("\n")
    .replace(/"airport-dad": "[^"]+",/, ""); // non-visible legacy URL alias
  const forbidden = [
    /\b(?:dad|daddy|mom|mommy|mother|father|boy|girl|man|woman|male|female|husband|wife|boyfriend|girlfriend|he|she|him|her|his|hers)\b/i,
    /(?:老父亲|父亲|爸爸|妈妈|母亲|男友|女友|男朋友|女朋友|老公|老婆|男人|女人|男生|女生|男性|女性|哥哥|姐姐|弟弟|妹妹|小姐姐|小哥哥|少爷|公主|王子|闺蜜|兄弟|姐妹|先生|女士|爷爷|奶奶|叔叔|阿姨)/,
    /[他她]/,
    /👗/,
  ];

  const violations = forbidden.flatMap((pattern) => copy.match(pattern) ?? []);
  expect(violations).toEqual([]);
});
