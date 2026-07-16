import { dimensionLabels } from "@/lib/constants";
import { getTopDimensions } from "@/lib/scoring";
import type { Analysis, Answer, DimensionId, Persona, Scores, World } from "@/lib/types";

const strategies = [
  { name: "旅行人格扫描", opening: "AI 看完你的答案，决定先从你最藏不住的旅行习惯讲起。" },
  { name: "上头行为审计", opening: "系统对你的十六次选择进行了审计，发现理智经常只负责最后签字。" },
  { name: "旅行事故复盘", opening: "系统预演了你的一趟旅行，并提前写好了三份事故复盘。" },
  { name: "朋友圈素材分析", opening: "系统翻完你的选择，确认你不是去旅行，是去生产一整季内容。" },
  { name: "同行风险评估", opening: "系统站在未来旅伴的角度看完答案，默默把保险额度调高了一档。" },
  { name: "异世界安置计划", opening: "现实世界暂时无法完整承载你的旅行需求，系统已开始研究异地安置。" },
];

const punchlines: Record<DimensionId, string[]> = {
  npc: [
    "你擅长把选择题变成转发题：谁靠谱，就把决定权转给谁。",
    "你的“都可以”通常不是没想法，而是在等群里出现一个能负责的人。",
    "只要队友方向明确，你就能精准出现在快乐发生的地方。",
  ],
  chaos: [
    "对你来说，走错路不叫事故，叫路线突然有了原创性。",
    "只要故事足够好笑，下雨、绕路和临时改计划都算增值服务。",
    "计划负责开场，你负责把后半段改成观众没见过的版本。",
  ],
  hype: [
    "你和“仅剩两个名额”之间，通常只隔着一次 Face ID。",
    "别人需要三天考虑，你只需要一句“现在不去就晚了”。",
    "你的理智不是缺席，只是每次都比付款通知晚到半分钟。",
  ],
  spend: [
    "你不是乱花钱，你只是坚定反对用体力解决预算问题。",
    "只要能少排队、多睡觉、拍得好看，你的钱包就会主动参加讨论。",
    "你擅长把加价项目重新命名为“购买情绪稳定”。",
  ],
  camera: [
    "你对光线的判断，常常比对方向的判断快半拍。",
    "景点可以没看懂，但黄金十分钟绝对不能浪费。",
    "你的相册不是旅行记录，是一套等待上线的视觉资产。",
  ],
  control: [
    "你嘴上说都可以，脑内其实已经跑完三套备选方案。",
    "自由活动在你这里也有开始时间、集合地点和逾期预案。",
    "别人打开地图找路，你打开地图是在接管这座城市。",
  ],
};

const personaNarratives: Record<string, { lines: { text: string; emphasis?: boolean }[]; signatureLine: string }> = {
  "chaos-traveller": {
    lines: [
      { text: "别人在完成主线。" },
      { text: "你在疯狂解锁隐藏剧情。", emphasis: true },
      { text: "去东京三天，有两天都在计划之外。" },
      { text: "AI 不建议和你一起旅行。" },
      { text: "因为计划基本没有生还可能。", emphasis: true },
    ],
    signatureLine: "来都来了。",
  },
  "food-hunter": {
    lines: [
      { text: "别人按照景点排路线，你按照饭点规划城市。" },
      { text: "对你来说，旅行不是从机场开始，是从第一口开始。", emphasis: true },
      { text: "AI 看完你的计划，只发现景点需要预约，胃不接受预约。" },
    ],
    signatureLine: "先吃，再研究去哪。",
  },
  "luxury-escaper": {
    lines: [
      { text: "你不反对吃苦，只是不理解为什么花了钱还要吃苦。" },
      { text: "能用预算解决的问题，不应该升级成体力测试。", emphasis: true },
      { text: "AI 认为你的旅行哲学很稳定：风景负责震撼，酒店负责把你救回来。" },
    ],
    signatureLine: "这个可以升级吗？",
  },
  "main-character": {
    lines: [
      { text: "别人看风景，你和风景一起等光。" },
      { text: "旅行可以没有计划，但不能没有能发出去的那一张。", emphasis: true },
      { text: "AI 怀疑，你不是经过一座城市，是在给它提供出镜机会。" },
    ],
    signatureLine: "再来一张，刚才风不对。",
  },
  "fomo-rocketeer": {
    lines: [
      { text: "别人等年假，你等周五六点和“最后两个名额”。" },
      { text: "别人考虑值不值得，你已经收好包并开始考虑穿什么去了。", emphasis: true },
      { text: "AI 建议你付款前冷静十分钟，但周末和限定都只给你十秒。" },
    ],
    signatureLine: "先抢再说。",
  },
  "soft-life-migrant": {
    lines: [
      { text: "别人旅行回来需要休息。" },
      { text: "你去旅行，本身就是为了练习如何更专业地休息。", emphasis: true },
      { text: "AI 统计了你的行程：最大景点是床，最远路线是去楼下喝咖啡。" },
    ],
    signatureLine: "几点退房？",
  },
  "social-compass": {
    lines: [
      { text: "你从来没有制定过旅行计划，但不知道为什么总能跟着别人玩得最开心。" },
      { text: "你最大的超能力就是：永远有人帮你做攻略。", emphasis: true },
      { text: "AI 怀疑，你的人生按钮只有两个：" },
      { text: "“行。”", emphasis: true },
      { text: "“都可以。”", emphasis: true },
    ],
    signatureLine: "你们定，我准时到。",
  },
  "budget-alchemist": {
    lines: [
      { text: "别人做攻略，你在同时管理路线、预算和误机预案。" },
      { text: "为了省下八十块，你愿意投入八小时，以及三个版本的行程表。", emphasis: true },
      { text: "AI 没发现旅行漏洞，只发现同行者还没读完你发的最新版。" },
    ],
    signatureLine: "我发群里了，记得看省钱版最新版。",
  },
  "planet-earth-expat": {
    lines: [
      { text: "城市信号越满，你越想把自己切成飞行模式。" },
      { text: "别人担心没有网络，你担心山顶突然出现一群人。", emphasis: true },
      { text: "AI 联系不上你，但根据最后定位判断，你应该玩得很好。" },
    ],
    signatureLine: "没信号更好。",
  },
};

function hashAnswers(answers: Answer[], scores: Scores) {
  const answerHash = answers.reduce((hash, answer, index) => {
    const code = answer.optionId.charCodeAt(0) + answer.questionId.length * 7 + index * 13;
    return (hash * 31 + code) >>> 0;
  }, 2166136261);
  return Object.values(scores).reduce((hash, score) => (hash * 17 + score) >>> 0, answerHash);
}

function pick<T>(items: T[], seed: number, salt = 0) {
  return items[(seed + salt * 97) % items.length];
}

function getRhythm(scores: Scores) {
  if (scores.control >= 65 && scores.chaos >= 55) return "框架型自由：交通住宿先锁死，下午三点以后允许宇宙临时改稿。";
  if (scores.control >= 70) return "七分确定、三分留白；每天两个锚点足够，不要给散步也建甘特图。";
  if (scores.hype >= 70) return "短周期、高反馈：一天一个重头体验，付款前强制冷静十分钟。";
  if (scores.camera >= 70) return "跟着光线走：上午慢启动，日落前后留出完整拍摄窗口。";
  if (scores.spend >= 70) return "少换城市、多享受；把预算集中在真正能买回时间和睡眠的地方。";
  if (scores.npc >= 70) return "跟队但不失联：让一个人做主，你负责及时回复和准时出现。";
  return "一天一个主线任务，其余时间交给天气、食欲和路边突然出现的东西。";
}

function getCompanion(persona: Persona, scores: Scores, lowest: DimensionId) {
  const balance: Record<DimensionId, string> = {
    npc: "最好还愿意明确表达意见，避免全队互相说随便",
    chaos: "最好临场反应快，但不会为了整活把证件弄丢",
    hype: "最好能在你上头时负责问一句“真的有假吗”",
    spend: "最好预算透明，既不扫兴也不默认所有升级",
    camera: "最好拍照有耐心，同时记得提醒你抬头看风景",
    control: "最好方向感稳定，能在计划失效时接管现场",
  };
  return `${persona.companion}；${balance[lowest]}。`;
}

export function createRuleBasedAnalysis(
  scores: Scores,
  persona: Persona,
  world: World,
  answers: Answer[] = [],
): Analysis {
  const seed = hashAnswers(answers, scores);
  const variant = seed % strategies.length;
  const strategy = strategies[variant];
  const [first, second, lowest] = getTopDimensions(scores);
  const worldReasons = [
    `你的「${dimensionLabels[first]} × ${dimensionLabels[second]}」组合已经超过普通城市承载范围。理论上，${world.name} 才是你的常驻服务器。`,
    `综合你的${dimensionLabels[first]}和${dimensionLabels[second]}浓度，现实目的地只能算平替，${world.name} 才是完整版。`,
    `系统把你的旅行参数输入现实世界，返回“配置过高”。换到 ${world.name}，一切突然合理。`,
  ];
  const narrative = personaNarratives[persona.id] ?? {
    lines: [{ text: `${persona.tagline}`, emphasis: true }],
    signatureLine: "来都来了。",
  };

  return {
    variant: variant + 1,
    strategy: strategy.name,
    opening: strategy.opening,
    roast: `${pick(punchlines[first], seed, 1)} ${pick(punchlines[second], seed, 2)}`,
    narrative: narrative.lines,
    signatureLine: narrative.signatureLine,
    travelAdvice: `最适合你的，是${persona.travelStyle}。${getRhythm(scores)} 旅伴请锁定${getCompanion(persona, scores, lowest)}`,
    worldReason: pick(worldReasons, seed, 4),
    destinationReasons: world.destinations.map((destination, index) => {
      const endings = [
        `很适合你 ${scores[first]} 分的「${dimensionLabels[first]}」发挥。`,
        `既接得住「${dimensionLabels[first]}」，又不会把「${dimensionLabels[lowest]}」逼到加班。`,
        `这是 ${world.name} 在现实世界里最容易订到票的替身之一。`,
      ];
      return `${destination.city}：${destination.reason} ${destination.connection} ${endings[(variant + index) % endings.length]}`;
    }),
  };
}
