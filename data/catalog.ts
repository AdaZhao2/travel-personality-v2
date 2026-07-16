import type { Persona, World } from "@/lib/types";

export const worlds: World[] = [
  {
    id: "grand-line",
    name: "Grand Line 伟大航路",
    emoji: "🏴‍☠️",
    unavailable: "你的整活指数已突破现实海域，但本船暂不承保海王类事故。",
    color: "linear-gradient(135deg, #075985 0%, #0e7490 55%, #92400e 100%)",
    destinations: [
      { city: "Okinawa", country: "日本", emoji: "🇯🇵", iata: "OKA", reason: "岛屿、公路和海风，自带出航片头。", connection: "最像可以随时招募伙伴的现实海域。" },
      { city: "Palawan", country: "菲律宾", emoji: "🇵🇭", iata: "PPS", reason: "跳岛路线每天都像随机副本。", connection: "石灰岩海岛很有异世界航线感。" },
      { city: "Krabi", country: "泰国", emoji: "🇹🇭", iata: "KBV", reason: "长尾船一开，冒险氛围自动加载。", connection: "把热血航海翻译成可订票的假期。" }
    ]
  },
  {
    id: "middle-earth",
    name: "Middle-earth 中土世界",
    emoji: "🌿",
    unavailable: "你的假期很适合护送魔戒，遗憾的是公司只批了五天年假。",
    color: "linear-gradient(135deg, #065f46 0%, #3f6212 55%, #854d0e 100%)",
    destinations: [
      { city: "Queenstown", country: "新西兰", emoji: "🇳🇿", iata: "ZQN", reason: "雪山、湖泊和公路都像史诗片场。", connection: "中土气质最浓的现实基地。" },
      { city: "Inverness", country: "英国", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iata: "INV", reason: "高地、古堡和湖泊让每段公路都像远征开场。", connection: "适合从一座安静基地进入辽阔又带传说感的地图。" },
      { city: "Calgary", country: "加拿大", emoji: "🇨🇦", iata: "YYC", reason: "从城市补给完毕，就能继续前往班夫的雪山、森林和冰川湖。", connection: "像现实世界通往史诗山谷的一座传送门。" }
    ]
  },
  {
    id: "galactic-empire",
    name: "银河帝国边境",
    emoji: "🌌",
    unavailable: "系统建议你进行星际迁徙，但当前机票搜索还不支持光年。",
    color: "linear-gradient(135deg, #020617 0%, #3730a3 55%, #0e7490 100%)",
    destinations: [
      { city: "Reykjavík", country: "冰岛", emoji: "🇮🇸", iata: "KEF", reason: "黑沙、熔岩和极光像另一颗行星。", connection: "银河边境的现实取景地。" },
      { city: "Tromsø", country: "挪威", emoji: "🇳🇴", iata: "TOS", reason: "追极光这件事本身就很太空任务。", connection: "把观星仪式感拉到满格。" },
      { city: "Rovaniemi", country: "芬兰", emoji: "🇫🇮", iata: "RVN", reason: "雪原安静到像信号离开地球。", connection: "适合需要暂时退出人类频道的人。" }
    ]
  },
  {
    id: "atlantis",
    name: "Atlantis 亚特兰蒂斯",
    emoji: "🧜",
    unavailable: "你的度假需求已经沉入海底，防水充电器尚未通过安检。",
    color: "linear-gradient(135deg, #1e3a8a 0%, #0e7490 55%, #115e59 100%)",
    destinations: [
      { city: "Santorini", country: "希腊", emoji: "🇬🇷", iata: "JTR", reason: "悬崖蓝白建筑把海景变成仪式。", connection: "像亚特兰蒂斯浮出海面的高级分区。" },
      { city: "Malé", country: "马尔代夫", emoji: "🇲🇻", iata: "MLE", reason: "水屋让“住在海上”不再只是设定。", connection: "最接近海底王国的氪金入口。" },
      { city: "Bali", country: "印度尼西亚", emoji: "🇮🇩", iata: "DPS", reason: "海、酒店和仪式感都能一站配齐。", connection: "现实版热带神殿与水世界混合地图。" }
    ]
  },
  {
    id: "disney-castle",
    name: "Disney Castle 童话城堡",
    emoji: "🏰",
    unavailable: "系统认为你需要一个每天都有烟花的世界，可惜现实物业不同意。",
    color: "linear-gradient(135deg, #9d174d 0%, #86198f 55%, #1d4ed8 100%)",
    destinations: [
      { city: "Munich", country: "德国", emoji: "🇩🇪", iata: "MUC", reason: "可顺路奔赴新天鹅堡完成童话 KPI。", connection: "现实里最像手绘城堡成真的地方。" },
      { city: "Paris", country: "法国", emoji: "🇫🇷", iata: "PAR", reason: "城堡、橱窗与 Disneyland 都很懂出片。", connection: "主角感从城市延续到乐园。" },
      { city: "Prague", country: "捷克", emoji: "🇨🇿", iata: "PRG", reason: "尖塔和石板路让普通散步也像剧情。", connection: "不买乐园票也能拥有童话滤镜。" }
    ]
  },
  {
    id: "pokemon-world",
    name: "Pokémon World 宝可梦世界",
    emoji: "⚡",
    unavailable: "博士已经发来初始宝可梦领取通知，可惜你的图鉴还没同步到现实航司。",
    color: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 48%, #eab308 100%)",
    destinations: [
      { city: "Tokyo", country: "日本", emoji: "🇯🇵", iata: "TYO", reason: "官方 Pokémon Center、Pokémon Cafe 和城市支线密度都很高。", connection: "像一座补给站齐全、随时能开始冒险的现实主城。" },
      { city: "Taipei", country: "中国台湾", emoji: "🇨🇳", iata: "TPE", reason: "信义区有官方 Pokémon Center，逛街、吃饭和收集快乐可以无缝连招。", connection: "适合用轻松城市节奏完成一场现实版图鉴任务。" },
      { city: "Singapore", country: "新加坡", emoji: "🇸🇬", iata: "SIN", reason: "Jewel Changi 内就有官方 Pokémon Center，落地即进入主题补给点。", connection: "机场像传送大厅，城市则是一张紧凑又高完成度的新地图。" }
    ]
  },
  {
    id: "pandora",
    name: "Pandora 潘多拉星球",
    emoji: "🚀",
    unavailable: "你的自然浓度已不适合地球城市，但跨星球签证仍在审核。",
    color: "linear-gradient(135deg, #312e81 0%, #7e22ce 55%, #0e7490 100%)",
    destinations: [
      { city: "Zhangjiajie", country: "中国", emoji: "🇨🇳", iata: "DYG", reason: "悬浮山原型级视觉，云一来直接异星。", connection: "潘多拉地貌最直观的现实替身。" },
      { city: "Kauai", country: "美国", emoji: "🇺🇸", iata: "LIH", reason: "峡谷、雨林和海岸拥有超现实饱和度。", connection: "像一颗生态系统开满特效的星球。" },
      { city: "San José", country: "哥斯达黎加", emoji: "🇨🇷", iata: "SJO", reason: "雨林、火山与野生动物让日程充满生命力。", connection: "适合尊重自然又忍不住探索的人。" }
    ]
  },
  {
    id: "bikini-bottom",
    name: "Bikini Bottom 比奇堡",
    emoji: "🍍",
    unavailable: "你适合住进菠萝屋，但房东要求用水母币支付押金。",
    color: "linear-gradient(135deg, #92400e 0%, #be185d 55%, #0e7490 100%)",
    destinations: [
      { city: "Honolulu", country: "美国", emoji: "🇺🇸", iata: "HNL", reason: "海滩、冲浪和无厘头快乐全天供应。", connection: "最容易进入比奇堡精神状态的城市。" },
      { city: "Cancún", country: "墨西哥", emoji: "🇲🇽", iata: "CUN", reason: "快乐很直给，度假不需要复杂论证。", connection: "适合把脑子寄存在酒店前台。" },
      { city: "Cebu", country: "菲律宾", emoji: "🇵🇭", iata: "CEB", reason: "跳岛、潜水和便宜快乐都很充足。", connection: "现实海底邻居体验卡。" }
    ]
  }
];

export const personas: Persona[] = [
  { id: "chaos-traveller", code: "JOKER", codeMeaning: "翻车也能变成段子", name: "Chaos Traveller", emoji: "🤡", tagline: "计划只是宇宙发给你的一份参考文件。", traits: ["随机副本", "临场发挥", "事故变素材"], strength: "任何翻车最后都能被你讲成神故事。", weakness: "你的旅伴可能需要旅行险和心理险。", travelStyle: "只订第一晚的开放式冒险", companion: "边界感稳定的乐子人", worldId: "grand-line", vector: { npc: 25, chaos: 100, hype: 80, spend: 40, camera: 55, control: 10 } },
  { id: "food-hunter", code: "FOOD", codeMeaning: "Food First 干饭优先", name: "Food Hunter", emoji: "🍜", tagline: "景点可以关门，饭点绝对不能乱。", traits: ["菜单冒险", "排队耐受", "胃部导航"], strength: "全队最幸福的三顿饭都由你负责。", weakness: "一天五顿时会把步数称为消食。", travelStyle: "以餐厅为锚点的城市路线", companion: "不忌口且能共享每一道菜的人", worldId: "bikini-bottom", vector: { npc: 35, chaos: 65, hype: 75, spend: 65, camera: 45, control: 55 } },
  { id: "luxury-escaper", code: "RICH", codeMeaning: "能花钱解决就不硬扛", name: "Luxury Escaper", emoji: "🛁", tagline: "你不是去旅行，你是去升级生活操作系统。", traits: ["体验优先", "酒店即目的地", "拒绝硬扛"], strength: "非常清楚什么钱能买回时间和心情。", weakness: "账单偶尔会比风景更令人难忘。", travelStyle: "一地长住的高质感度假", companion: "预算观接近、懂得享受的人", worldId: "atlantis", vector: { npc: 25, chaos: 30, hype: 55, spend: 100, camera: 75, control: 55 } },
  { id: "main-character", code: "C位", codeMeaning: "镜头一开自动站到主角位", name: "Main Character Traveller", emoji: "🎬", tagline: "城市不是目的地，是你本季故事的取景地。", traits: ["BGM 自带", "仪式感满格", "镜头意识"], strength: "总能把普通一天过成预告片。", weakness: "同行者可能兼任摄影、灯光与场务。", travelStyle: "日落、街景与造型驱动路线", companion: "审美在线且拍照不敷衍的人", worldId: "disney-castle", vector: { npc: 25, chaos: 55, hype: 75, spend: 65, camera: 100, control: 45 } },
  { id: "fomo-rocketeer", code: "FOMO", codeMeaning: "错过什么都不能错过限定", name: "FOMO Rocketeer", emoji: "🚀", tagline: "“仅剩两个名额”是你的发射按钮。", traits: ["秒下单", "热点雷达", "先冲再说"], strength: "新鲜体验永远赶得上第一班车。", weakness: "收藏和订单都可能比年假多。", travelStyle: "节庆、限定与高浓度体验", companion: "能在十分钟内收拾好行李的人", worldId: "pokemon-world", vector: { npc: 35, chaos: 75, hype: 100, spend: 70, camera: 65, control: 20 } },
  { id: "soft-life-migrant", code: "ZZZZ", codeMeaning: "自然醒才是旅行主线", name: "Soft Life Migrant", emoji: "☁️", tagline: "旅行的意义，是暂时不做一个很努力的人。", traits: ["低速生活", "情绪回血", "拒绝赶场"], strength: "很会把休息当作正经日程。", weakness: "可能住了五天还没走出酒店两公里。", travelStyle: "咖啡、散步与自然醒", companion: "安静、松弛、不问“下一站呢”的人", worldId: "middle-earth", vector: { npc: 55, chaos: 25, hype: 20, spend: 65, camera: 45, control: 25 } },
  { id: "social-compass", code: "NPC", codeMeaning: "No Plan, Chill 跟队也快乐", name: "Social Compass", emoji: "🫂", tagline: "去哪不重要，和谁一起才决定地图颜色。", traits: ["气氛感知", "随队切换", "群体快乐"], strength: "能让不同性格的人都玩得舒服。", weakness: "问你意见时，经常得到一句“我都行”。", travelStyle: "朋友主导的多人轻计划", companion: "愿意明确做决定的组织者", worldId: "bikini-bottom", vector: { npc: 100, chaos: 45, hype: 55, spend: 45, camera: 55, control: 15 } },
  { id: "budget-alchemist", code: "GPS", codeMeaning: "Good Price System 省钱导航", name: "Budget Alchemist", emoji: "🧪", tagline: "预算、路线和时间，都能被你导航到最优解。", traits: ["比价天赋", "路线优化", "备选方案"], strength: "省钱不等于受苦，规划也不等于扫兴。", weakness: "为了省 80，可能研究了 8 小时。", travelStyle: "错峰、高性价比与精密路线", companion: "准时、记账清楚且愿意看最新版行程的人", worldId: "galactic-empire", vector: { npc: 25, chaos: 15, hype: 25, spend: 25, camera: 45, control: 100 } },
  { id: "planet-earth-expat", code: "404", codeMeaning: "信号未找到，人已离线", name: "Planet Earth Expat", emoji: "🌍", tagline: "城市信号太满，你想去自然里切飞行模式。", traits: ["野外回血", "大景偏好", "低人密度"], strength: "对真正壮阔的风景有稳定判断力。", weakness: "网络消失后才想起攻略也在云端。", travelStyle: "自驾、徒步与荒野长线", companion: "体力稳定又尊重自然的人", worldId: "pandora", vector: { npc: 15, chaos: 65, hype: 45, spend: 45, camera: 65, control: 45 } },
];

export function getPersona(id: string) {
  const aliases: Record<string, string> = {
    "airport-dad": "budget-alchemist",
    "airport-guardian": "budget-alchemist",
    "weekend-goblin": "fomo-rocketeer",
    "spreadsheet-pilot": "budget-alchemist",
    "maps-believer": "budget-alchemist",
    "aesthetic-smuggler": "main-character",
    "dopamine-nomad": "fomo-rocketeer",
    "off-grid-oracle": "planet-earth-expat",
    "hidden-gem-collector": "planet-earth-expat",
    "culture-time-traveller": "budget-alchemist",
  };
  const resolvedId = aliases[id] ?? id;
  return personas.find((persona) => persona.id === resolvedId) ?? personas[0];
}

export function getWorld(id: string) {
  return worlds.find((world) => world.id === id) ?? worlds[0];
}
