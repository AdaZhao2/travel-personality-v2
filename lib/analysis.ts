import { dimensionLabels } from "@/lib/constants";
import { getTopDimensions } from "@/lib/scoring";
import type { Language } from "@/lib/i18n";
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
      { text: "别人收藏景点。" },
      { text: "你收藏意外。", emphasis: true },
      { text: "攻略只负责出发，不负责结局。" },
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
  language: Language = "zh",
): Analysis {
  const seed = hashAnswers(answers, scores);
  const variant = seed % strategies.length;
  if (language === "en") return createEnglishAnalysis(scores, persona, world, seed, variant);
  const strategy = strategies[variant];
  const [first, second, lowest] = getTopDimensions(scores);
  const worldReasons = [
    `你的画风已经不属于现实世界。理论上，${world.name}才是你的常驻服务器。`,
    `综合你的精神状态，现实目的地只能算平替，${world.name}才是完整版。`,
    `你的旅行设定已经成功跨服。下一站：${world.name}。`,
    `AI 找遍了整个现实世界，最后发现：${world.name}更像你的老家。`,
    `系统推荐：建议切换服务器至 ${world.name}，体验更加流畅。`,
    `AI 已为你匹配最佳世界观。恭喜解锁：${world.name}。`,
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
    destinationReasons: world.destinations.map(
      (destination) => `${destination.city}：${destination.reason} ${destination.connection}`,
    ),
  };
}

const englishStrategies = [
  ["Travel behaviour scan", "AI reviewed your answers and immediately found the habit your friends complain about in private."],
  ["Financial impulse audit", "Sixteen choices later, the system confirms your common sense is mostly employed in an advisory capacity."],
  ["Pre-emptive incident report", "AI simulated one trip with you and has already opened a case number."],
  ["Content operations review", "The evidence suggests you do not go on holiday. You launch a limited series."],
  ["Travel companion risk review", "AI read your answers from your future travel partner’s perspective and quietly upgraded the insurance."],
  ["Alternative-universe relocation", "The real world cannot meet your travel requirements. The system is checking other servers."],
] as const;

const englishPunchlines: Record<DimensionId, string[]> = {
  npc: ["You don’t avoid decisions. You simply believe they belong to whoever brought the spreadsheet.", "Your ‘I’m easy’ translates to: ‘Wake me when a competent adult has chosen.’", "Pair you with one decisive friend and you will appear at the fun with almost supernatural accuracy."],
  chaos: ["You have never been lost. You have, however, discovered several routes Google was too cowardly to suggest.", "Rain, missed trains, and minor disasters are acceptable if they improve the story later.", "The itinerary writes the pilot episode. By Day Two, you have replaced the entire writers’ room."],
  hype: ["You see ‘only two left’ and suddenly your bank card has main-character agency.", "Some people need three working days to decide. You need one red countdown timer.", "Your common sense is not absent. It simply arrives after the confirmation email."],
  spend: ["You are not bad with money. You are deeply committed to not being uncomfortable on principle.", "If an upgrade buys sleep, skips a queue, or improves the lighting, your wallet would like a seat at the table.", "You don’t overspend. You make strategic investments in not having a terrible time."],
  camera: ["Your sense of direction is negotiable. Your awareness of golden hour is military-grade.", "You may forget the monument’s name, but you know exactly which side had better light.", "Your camera roll is not storage. It is an unreleased content slate."],
  control: ["You say ‘let’s keep it spontaneous’ with three backup routes already downloaded.", "Even your free time has a meeting point, buffer window, and cancellation policy.", "Other people use Maps to find the city. You use Maps to acquire it."],
};

const englishNarratives: Record<string, { lines: { text: string; emphasis?: boolean }[]; signatureLine: string }> = {
  "chaos-traveller": { lines: [{text:"Other people collect landmarks."},{text:"You collect incidents that require a group-chat debrief.",emphasis:true},{text:"The guidebook gets you through the opening credits. After that, the plot is legally unsupervised."},{text:"AI would not travel with you."},{text:"AI would absolutely watch the recap.",emphasis:true}], signatureLine:"Well, we’re here now." },
  "food-hunter": { lines: [{text:"Other people fit restaurants around the itinerary. You fit the city between lunch and dinner."},{text:"Your holiday begins at the first bite, not the departure gate.",emphasis:true},{text:"AI found three museums marked ‘maybe’ and eleven restaurants marked ‘non-negotiable’."}], signatureLine:"Let’s eat, then emotionally prepare for more food." },
  "luxury-escaper": { lines: [{text:"You are not against hardship. You simply refuse to pay for the privilege."},{text:"If money can fix it, it does not need to become character development.",emphasis:true},{text:"Your system is simple: the view changes your life; the hotel puts it back together."}], signatureLine:"What exactly does the upgrade include?" },
  "main-character": { lines: [{text:"Other people look at the view. You and the view wait for better light."},{text:"The itinerary is optional. The one photo that looks accidental but took 43 attempts is not.",emphasis:true},{text:"AI suspects cities do not host you. They audition for your carousel."}], signatureLine:"Again. That one looked posed." },
  "fomo-rocketeer": { lines: [{text:"Other people wait for annual leave. You wait for Friday evening and a countdown timer."},{text:"By the time they ask ‘is it worth it?’, you have booked, packed, and posted the airport coffee.",emphasis:true},{text:"AI recommends a ten-minute cooling-off period. The early-bird offer expires in nine."}], signatureLine:"Book it. We can panic afterwards." },
  "soft-life-migrant": { lines: [{text:"Other people need a holiday after their holiday."},{text:"You have bravely removed the middleman and made resting the main event.",emphasis:true},{text:"AI reviewed your route: bed, coffee, gentle wander, heroic return to bed."}], signatureLine:"Do they do late checkout?" },
  "social-compass": { lines: [{text:"You have never made a full itinerary, yet somehow keep appearing on excellent trips."},{text:"Your greatest travel hack is having organised friends.",emphasis:true},{text:"AI found two settings in your operating system:"},{text:"‘Sounds good.’",emphasis:true},{text:"‘Whatever works.’",emphasis:true}], signatureLine:"Send me the pin. I’ll be there." },
  "budget-alchemist": { lines: [{text:"Other people plan a holiday. You run a small transport ministry."},{text:"You will spend eight hours to save £18—and feel spiritually richer for it.",emphasis:true},{text:"AI found no flaws in the itinerary. It did find six friends still reading version four."}], signatureLine:"Ignore the old PDF. I’ve sent FINAL-v7." },
  "planet-earth-expat": { lines: [{text:"The more notifications a city has, the more urgently you need a mountain."},{text:"Other people fear losing signal. You fear arriving at the viewpoint with everyone else.",emphasis:true},{text:"AI cannot reach you. This appears to be exactly how you wanted it."}], signatureLine:"No signal. Perfect." },
};

function createEnglishAnalysis(scores: Scores, persona: Persona, world: World, seed: number, variant: number): Analysis {
  const [first, second] = getTopDimensions(scores);
  const narrative = englishNarratives[persona.id] ?? { lines: [{ text: persona.tagline, emphasis: true }], signatureLine: "We’re already here." };
  const rhythm = scores.control >= 70 ? "Lock in the important bits, then leave 30% of the day unsupervised. Not every walk needs a project plan." : scores.hype >= 70 ? "Give each day one headline event—and give every limited-time offer a ten-minute cooling-off period." : scores.camera >= 70 ? "Build around the light: slow morning, flexible afternoon, union-protected golden hour." : scores.spend >= 70 ? "Move less, enjoy more, and spend only where it buys back time, sleep, or genuine delight." : scores.npc >= 70 ? "Let one organised person lead, but perform the sacred duties of replying and turning up on time." : "Give each day one main quest. Weather, appetite, and strange little streets can write the side plots.";
  const worldReasons = [`Your travel settings have exceeded Earth’s recommended limits. Your natural habitat is clearly ${world.name}.`, `Reality has some decent alternatives, but ${world.name} is the version with all features unlocked.`, `Your holiday energy has crossed into another franchise. Next stop: ${world.name}.`, `AI searched the entire real world and reluctantly concluded that ${world.name} is more your speed.`, `System recommendation: migrate to ${world.name} for better personality compatibility.`, `The matching engine briefly caught fire, then returned one answer: ${world.name}.`];
  return {
    variant: variant + 1,
    strategy: englishStrategies[variant][0],
    opening: englishStrategies[variant][1],
    roast: `${pick(englishPunchlines[first], seed, 1)} ${pick(englishPunchlines[second], seed, 2)}`,
    narrative: narrative.lines,
    signatureLine: narrative.signatureLine,
    travelAdvice: `Your ideal trip: ${persona.travelStyle}. ${rhythm} Best paired with ${persona.companion}.`,
    worldReason: pick(worldReasons, seed, 4),
    destinationReasons: world.destinations.map((destination) => `${destination.city}: ${destination.reason} ${destination.connection}`),
  };
}
