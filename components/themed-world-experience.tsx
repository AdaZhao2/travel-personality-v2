"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Camera, Compass, Download, MapPin, ScrollText, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPersona } from "@/data/catalog";
import { createResultHash, decodeSharedResult, encodeSharedResult } from "@/lib/share";
import type { Persona, Scores } from "@/lib/types";

export type ThemedWorldId = "greed-island" | "galactic-empire" | "atlantis" | "disney-castle" | "pandora" | "bikini-bottom";
type Stage = "world" | "order" | "map" | "checkin";
type Result = { persona: Persona; scores: Scores; answerPath: string; resultHash: string };
type Pass = { kind: string; service: string; from: string; to: string; depart: string; arrive: string; duration: string; note: string };
type Stop = { id: string; name: string; companion: string; image: string; time: string; route: string; activity: string; stamp: string; x: string; y: string };
type Config = {
  id: ThemedWorldId; name: string; cn: string; eyebrow: string; intro: string; cta: string; hero: string; map: string; heroAlt: string;
  accent: string; secondary: string; background: string; orderTitle: string; guideTitle: string; routeSummary: string;
  passes: Pass[]; stops: Stop[]; hidden?: boolean; surprise?: string; mascot?: string;
};

const configs: Record<ThemedWorldId, Config> = {
  "greed-island": {
    id: "greed-island", name: "Greed Island", cn: "贪婪之岛", hidden: true, surprise: "你的聪明，人类难以想象！", mascot: "/greed-island-frog-v2.webp",
    eyebrow: "这不是偶然发现，是隐藏规则终于承认了你", hero: "/greed-island-hero.webp", map: "/world-maps/greed-island.webp", heroAlt: "小杰与奇犽背对镜头眺望贪婪之岛", accent: "#bef264", secondary: "#facc15", background: "#082f24", cta: "领取贪婪之岛入岛订单", orderTitle: "贪婪之岛玩家订单已生成", guideTitle: "游戏开始，五张指定卡片正在等你", routeSummary: "入岛草原 → 安多奇拔 → 玛莎多拉 → 爱爱都市 → 指定口袋城堡", intro: "无论从哪一种旅行人格的虚拟世界出发，只要从下方开始、在上方收尾，正确拆下四枚螺丝，就能打开这层更深的隐藏入口。这里不属于某一种人格——小杰和奇犽正在岛上等每一位发现规则的玩家。",
    passes: [
      { kind: "猎人游戏登录证", service: "JOY STATION · 念能力登录程序", from: "现实世界游戏机", to: "贪婪之岛入岛草原", depart: "NOW", arrive: "读取完成", duration: "一瞬间", note: "双手保持在主机感应范围内；进入后所有物品都会转化为卡片规则。" },
      { kind: "咒语卡移动许可", service: "ACCOMPANY / MAGNETIC FORCE · 同行与磁力", from: "安多奇拔", to: "玛莎多拉 / 爱爱都市", depart: "任务完成后", arrive: "咒语生效时", duration: "1 张卡", note: "同行可带队友一起移动，磁力只会把你送到已经见过的人身边。" },
      { kind: "指定口袋挑战函", service: "100 SLOT CLEARANCE · 百卡收集线", from: "爱爱都市", to: "指定口袋城堡", depart: "99 张卡集齐", arrive: "最终问答后", duration: "最后一关", note: "第 100 张卡不会奖励运气，只奖励观察、合作和真正理解规则的人。" },
    ],
    stops: [
      { id: "arrival-gate", name: "入岛起始草原", companion: "小杰", image: "/greed-island-checkins/arrival-gate.webp", time: "08:00", route: "完成念能力登录后向石门前进，先确认卡片化与书本指令。", activity: "和小杰一起站在巨型游戏石门前，拍下只有真正玩家才看得到的第一幕。", stamp: "GAME START", x: "14%", y: "76%" },
      { id: "antokiba", name: "安多奇拔悬赏城", companion: "奇犽", image: "/greed-island-checkins/antokiba.webp", time: "11:20", route: "沿主路进入圆形竞技城区，在悬赏塔领取第一个限时任务。", activity: "让奇犽替你判断任务陷阱，在热闹的挑战城留下冷静玩家的背影。", stamp: "BOUNTY CLEARED", x: "29%", y: "34%" },
      { id: "masadora", name: "玛莎多拉魔法商店", companion: "小杰与奇犽", image: "/greed-island-checkins/masadora.webp", time: "17:40", route: "用同行卡抵达紫顶商店街，先补充防御卡再尝试随机卡包。", activity: "和小杰、奇犽一起翻开收集册，让飞舞的咒语卡替三个人点亮整条街。", stamp: "SPELL CARD READY", x: "51%", y: "52%" },
      { id: "aiai", name: "恋爱都市爱爱", companion: "小杰", image: "/greed-island-checkins/aiai.webp", time: "18:50", route: "沿运河进入剧情区，不要跳过突然出现的恋爱事件与选择题。", activity: "和一脸意外的小杰站在心形光点里，收下这座岛最不像战斗任务的一张照片。", stamp: "AIAI EVENT", x: "73%", y: "72%" },
      { id: "card-castle", name: "指定口袋城堡", companion: "小杰与奇犽", image: "/greed-island-checkins/card-castle.webp", time: "23:00", route: "集齐 99 张指定卡后进入城堡，完成问答并把最后一格交给默契。", activity: "和小杰、奇犽共同举起完整收集册，在百张卡片同时亮起时完成通关打卡。", stamp: "100 SLOTS COMPLETE", x: "86%", y: "18%" },
    ],
  },
  "galactic-empire": {
    id: "galactic-empire", name: "Galactic Empire", cn: "银河帝国", eyebrow: "跃迁坐标已解锁 · 航线误差小于一光秒", hero: "/galactic-empire-hero.webp", map: "/world-maps/galactic-empire.webp", heroAlt: "星际旅行者与机器人眺望银河航线", accent: "#67e8f9", secondary: "#818cf8", background: "#080d24", cta: "领取星际迁徙订单", orderTitle: "银河航线订单已生成", guideTitle: "跃迁完成，五个星区等待留影", routeSummary: "双日沙漠 → 冰月 → 小行星港 → 森林卫星 → 环形空间站", intro: "从双日落下的沙漠启程，穿过冰月、自由港与森林卫星，把精密路线规划成一次横跨银河的迁徙。",
    passes: [
      { kind: "星际港登舰证", service: "ORBITAL SHUTTLE · 轨道接驳线", from: "地球轨道港", to: "双日沙漠前哨", depart: "06:40", arrive: "当地 17:20", duration: "2 次跃迁", note: "登舰前校准重力靴，随身机器人已同步第一段坐标。" },
      { kind: "超空间跃迁票", service: "HYPERLANE 07 · 外环航道", from: "双日沙漠", to: "冰月 / 小行星自由港", depart: "08:10", arrive: "13:45", duration: "5h35m", note: "自由港补给只接受通用信用点，离港前检查燃料与导航芯片。" },
      { kind: "帝国边境通行证", service: "FRINGE PASSAGE · 边境巡航线", from: "森林卫星", to: "环形空间站", depart: "19:30", arrive: "22:00", duration: "2h30m", note: "经过巡逻区时保持航向，最终观景窗位已为你锁定。" },
    ],
    stops: [
      { id: "twin-suns", name: "双日沙漠前哨", companion: "装甲导航员与侦察机器人", image: "/galactic-empire-checkins/twin-suns.webp", time: "17:30", route: "从落地舱沿信标向西，日落前抵达沙丘前哨。", activity: "在两颗太阳同时落下时，留下银河远行的第一张背影。", stamp: "TWIN SUNS", x: "13%", y: "75%" },
      { id: "ice-moon", name: "冰月极光站", companion: "装甲导航员与侦察机器人", image: "/galactic-empire-checkins/ice-moon.webp", time: "06:20", route: "搭乘低温穿梭艇，从蓝色冰峡进入极光观测台。", activity: "和机器人一起站在冰原尽头，等待极光扫过头顶。", stamp: "ICE MOON", x: "31%", y: "42%" },
      { id: "asteroid-port", name: "小行星自由港", companion: "装甲导航员与侦察机器人", image: "/galactic-empire-checkins/asteroid-port.webp", time: "13:45", route: "沿黄色引导灯穿过泊位，进入旧飞船改造的市集。", activity: "在霓虹招牌和往来舰船之间，拍一张真正的星际过客照。", stamp: "FREE PORT", x: "49%", y: "67%" },
      { id: "forest-moon", name: "森林卫星圣坛", companion: "装甲导航员与侦察机器人", image: "/galactic-empire-checkins/forest-moon.webp", time: "16:10", route: "离开树冠停机坪，跟随发光孢子走向古老石坛。", activity: "把巨大树木和微小旅人收进同一个银河尺度的画面。", stamp: "FOREST MOON", x: "68%", y: "35%" },
      { id: "ring-station", name: "帝国环形空间站", companion: "装甲导航员与侦察机器人", image: "/galactic-empire-checkins/ring-station.webp", time: "22:00", route: "通过边境闸口后直达全景舷窗，结束本次巡航。", activity: "面对星球与环形巨构，完成这份跨光年的路线验收。", stamp: "ORBIT COMPLETE", x: "87%", y: "18%" },
    ],
  },
  atlantis: {
    id: "atlantis", name: "Atlantis", cn: "亚特兰蒂斯", eyebrow: "深海舱已加压 · 海底套房保留中", hero: "/atlantis-hero.webp", map: "/world-maps/atlantis.webp", heroAlt: "亚特兰蒂斯绘图师眺望海底宫殿", accent: "#67e8f9", secondary: "#2dd4bf", background: "#06283a", cta: "领取深海度假订单", orderTitle: "亚特兰蒂斯潜航订单已生成", guideTitle: "水压稳定，海底秘境正式开放", routeSummary: "沉没之门 → 珊瑚宫殿 → 鳐鱼花园 → 鲸歌档案馆 → 深渊神殿", intro: "乘私人潜航舱下潜到失落王国，在珊瑚宫殿、鲸歌档案馆与深渊神殿之间，过一场不必将就的海底假期。",
    passes: [
      { kind: "私人潜航舱票", service: "AQUA DESCENT · 深蓝下潜线", from: "海面浮岛酒店", to: "亚特兰蒂斯沉没之门", depart: "09:00", arrive: "10:25", duration: "1h25m", note: "舱内已备气泡香槟，降至暮光层后请开启全景观景模式。" },
      { kind: "洋流快线通行证", service: "CURRENT EXPRESS · 珊瑚环线", from: "珊瑚宫殿", to: "鳐鱼花园 / 鲸歌档案馆", depart: "13:10", arrive: "17:40", duration: "半日", note: "水下礼宾将全程同行，行李会直接送往珍珠套房。" },
      { kind: "深渊访问许可", service: "ABYSS LIFT · 深渊升降线", from: "鲸歌档案馆", to: "深渊神殿", depart: "20:10", arrive: "20:40", duration: "30m", note: "仅在发光水母群经过时开放，返程由专属潜艇接送。" },
    ],
    stops: [
      { id: "sunken-gate", name: "沉没之门", companion: "亚特兰蒂斯绘图师", image: "/atlantis-checkins/sunken-gate.webp", time: "10:30", route: "离开潜航舱后穿过气泡廊桥，在巨型石门前停留。", activity: "以古城大门和游鱼为背景，记录第一次踏入海底文明。", stamp: "CITY BELOW", x: "12%", y: "69%" },
      { id: "coral-palace", name: "珊瑚宫殿", companion: "亚特兰蒂斯绘图师", image: "/atlantis-checkins/coral-palace.webp", time: "12:20", route: "沿珍珠大道进入宫殿中庭，避开海马仪仗队路线。", activity: "站在层叠珊瑚塔前，把海底奢华拍成今日入住证明。", stamp: "CORAL ROYAL", x: "31%", y: "34%" },
      { id: "manta-garden", name: "鳐鱼花园", companion: "亚特兰蒂斯绘图师", image: "/atlantis-checkins/manta-garden.webp", time: "15:10", route: "搭乘洋流舱向东，在巨型鳐鱼巡游区缓慢下车。", activity: "等待鳐鱼从头顶滑过，让蓝色花园成为最安静的合影。", stamp: "MANTA GARDEN", x: "50%", y: "61%" },
      { id: "whale-archive", name: "鲸歌档案馆", companion: "亚特兰蒂斯绘图师", image: "/atlantis-checkins/whale-archive.webp", time: "17:40", route: "跟随低频鲸歌进入贝壳穹顶，在声纹墙前停步。", activity: "听一段被保存千年的鲸歌，再把自己留在发光档案里。", stamp: "WHALE SONG", x: "69%", y: "29%" },
      { id: "abyss-temple", name: "深渊神殿", companion: "亚特兰蒂斯绘图师", image: "/atlantis-checkins/abyss-temple.webp", time: "20:45", route: "乘透明升降舱继续下潜，循水母灯抵达神殿入口。", activity: "在海底最深处完成最后一张打卡，让发光水母替你点灯。", stamp: "ABYSS FOUND", x: "87%", y: "75%" },
    ],
  },
  "disney-castle": {
    id: "disney-castle", name: "Fairytale Castle", cn: "童话城堡", eyebrow: "主角席位已保留 · 烟花倒计时开始", hero: "/disney-castle-hero.webp", map: "/world-maps/disney-castle.webp", heroAlt: "童话公主旅行者眺望梦幻城堡", accent: "#f9a8d4", secondary: "#fde68a", background: "#321047", cta: "领取童话主角订单", orderTitle: "今日主角行程已生成", guideTitle: "城门打开，镜头已经为你就位", routeSummary: "玫瑰桥 → 魔法图书馆 → 水晶花园 → 灯笼村 → 烟花露台", intro: "从玫瑰桥走进一座只为故事存在的城堡，在魔法书、水晶花园和漫天灯笼之间，把今天拍成你的童话正片。",
    passes: [
      { kind: "南瓜马车票", service: "ROYAL COACH · 城堡晨光线", from: "星愿车站", to: "玫瑰桥", depart: "08:08", arrive: "08:40", duration: "32m", note: "请穿最适合出现在片头的衣服，车夫会在第一束晨光抵达。" },
      { kind: "魔法书通行证", service: "STORY PASS · 城堡内环线", from: "玫瑰桥", to: "魔法图书馆 / 水晶花园", depart: "10:00", arrive: "15:30", duration: "半日", note: "翻开的每本书都可能改变路线，今天的故事默认由你担任主角。" },
      { kind: "烟花露台请柬", service: "MIDNIGHT INVITATION · 夜光线", from: "灯笼村", to: "城堡烟花露台", depart: "20:20", arrive: "20:50", duration: "30m", note: "请柬只在烟花前生效，最佳中央机位已为你预留。" },
    ],
    stops: [
      { id: "rose-bridge", name: "玫瑰桥", companion: "童话公主旅行者", image: "/disney-castle-checkins/rose-bridge.webp", time: "08:45", route: "从马车站沿玫瑰藤前行，在城堡倒影完整时登桥。", activity: "用晨光、玫瑰和城堡完成今天的主角登场镜头。", stamp: "ONCE UPON A TIME", x: "12%", y: "70%" },
      { id: "magic-library", name: "魔法图书馆", companion: "童话公主旅行者", image: "/disney-castle-checkins/magic-library.webp", time: "10:20", route: "穿过会说话的画像，在旋转书梯停下后进入高塔书房。", activity: "站在漂浮书页中央，找到一本写着你名字的旅行故事。", stamp: "MAGIC CHAPTER", x: "31%", y: "33%" },
      { id: "crystal-garden", name: "水晶花园", companion: "童话公主旅行者", image: "/disney-castle-checkins/crystal-garden.webp", time: "15:30", route: "沿彩窗投下的光斑下楼，循铃声抵达玻璃花房。", activity: "在发光花朵和水晶小径之间，拍一张不用滤镜的梦幻背影。", stamp: "CRYSTAL BLOOM", x: "50%", y: "64%" },
      { id: "lantern-village", name: "灯笼村", companion: "童话公主旅行者", image: "/disney-castle-checkins/lantern-village.webp", time: "19:10", route: "从花园乘小船顺河而下，跟随第一盏升空的灯笼靠岸。", activity: "等万盏灯笼升起，把最像电影海报的一刻留给自己。", stamp: "LANTERN WISH", x: "69%", y: "42%" },
      { id: "fireworks-terrace", name: "烟花露台", companion: "童话公主旅行者", image: "/disney-castle-checkins/fireworks-terrace.webp", time: "21:00", route: "持请柬由城堡东翼登顶，在钟声响起前抵达中央露台。", activity: "背对镜头看整座城堡亮起，让烟花替今天打出片尾字幕。", stamp: "HAPPILY EVER AFTER", x: "88%", y: "20%" },
    ],
  },
  pandora: {
    id: "pandora", name: "Pandora", cn: "潘多拉", eyebrow: "地球信号已断开 · 生态连接已建立", hero: "/pandora-hero.webp", map: "/world-maps/pandora.webp", heroAlt: "蓝色森林探索者眺望悬浮山", accent: "#67e8f9", secondary: "#c084fc", background: "#111244", cta: "领取潘多拉探索订单", orderTitle: "潘多拉生态探索订单已生成", guideTitle: "离开地球网络，接入整颗星球", routeSummary: "悬浮山 → 灵魂树 → 荧光河 → 翼兽巢 → 礁海湾", intro: "关掉地球信号，穿过悬浮山、灵魂树与荧光河，在翼兽掠过天空、礁海族潜入深蓝时，重新学习如何与一颗星球连接。",
    passes: [
      { kind: "跨星球登陆证", service: "EXOMOON DESCENT · 外月登陆线", from: "地球远征舰", to: "悬浮山基地", depart: "05:30", arrive: "当地 07:10", duration: "1 次冷冻航行", note: "苏醒后先完成空气适配，所有路线遵守不留痕探索原则。" },
      { kind: "悬浮山飞行证", service: "IKRAN PASSAGE · 高空生态线", from: "悬浮山", to: "灵魂树 / 荧光河", depart: "11:20", arrive: "18:00", duration: "半日", note: "飞行坐骑会选择同行者，请保持安静并尊重当地族群指引。" },
      { kind: "礁族航行证", service: "REEF CURRENT · 海洋迁徙线", from: "翼兽巢", to: "礁海湾", depart: "16:40", arrive: "日落前", duration: "随洋流", note: "进入海湾前更换水下呼吸设备，不触碰任何发光珊瑚。" },
    ],
    stops: [
      { id: "floating-mountains", name: "哈利路亚悬浮山", companion: "蓝色森林族生态探索者", image: "/pandora-checkins/floating-mountains.webp", time: "07:30", route: "从基地沿藤蔓栈道向上，在云雾散开时抵达观景脊。", activity: "面对悬浮山群和瀑布，留下离开地球后的第一张背影。", stamp: "MOUNTAINS FLOAT", x: "12%", y: "34%" },
      { id: "spirit-tree", name: "灵魂树", companion: "蓝色森林族生态探索者", image: "/pandora-checkins/spirit-tree.webp", time: "12:10", route: "沿发光足迹深入森林，听见低语后放慢脚步进入圣地。", activity: "在垂落光须前安静停留，把自己放进整片森林的呼吸里。", stamp: "TREE OF VOICES", x: "31%", y: "68%" },
      { id: "glow-river", name: "荧光河", companion: "蓝色森林族生态探索者", image: "/pandora-checkins/glow-river.webp", time: "20:15", route: "夜幕降临后顺发光溪流向南，乘叶舟进入蓝色河湾。", activity: "让每一步激起荧光涟漪，拍下潘多拉真正醒来的夜晚。", stamp: "BIOLUMINESCENT", x: "50%", y: "46%" },
      { id: "ikran-nest", name: "翼兽巢穴", companion: "蓝色森林族生态探索者", image: "/pandora-checkins/ikran-nest.webp", time: "14:30", route: "抓紧藤梯越过断崖，在翼兽主动靠近后再进入巢区。", activity: "与掠过峡谷的翼兽同框，记录勇气接管路线的一刻。", stamp: "SKY BOND", x: "69%", y: "22%" },
      { id: "reef-bay", name: "礁海族海湾", companion: "蓝色礁海族探索者", image: "/pandora-checkins/reef-bay.webp", time: "18:40", route: "从森林边缘换乘海洋坐骑，沿浅礁进入水上村落。", activity: "在日落与发光海水之间完成最后打卡，把归属感留给海湾。", stamp: "WAY OF WATER", x: "88%", y: "72%" },
    ],
  },
  "bikini-bottom": {
    id: "bikini-bottom", name: "Bikini Bottom", cn: "比奇堡", eyebrow: "海底饭点已锁定 · 好朋友正在集合", hero: "/bikini-bottom-hero.webp", map: "/world-maps/bikini-bottom.webp", heroAlt: "海底旅行者走进色彩缤纷的比奇堡", accent: "#fde047", secondary: "#67e8f9", background: "#075985", cta: "领取比奇堡快乐订单", orderTitle: "比奇堡吃玩订单已生成", guideTitle: "先吃饭，再和全城朋友去冒险", routeSummary: "菠萝屋 → 蟹堡餐厅 → 水母田 → 酷乐湖 → 树屋圆顶", intro: "住进菠萝屋，去海底餐厅吃招牌汉堡，再和一群性格完全不同的朋友抓水母、晒太阳、研究陆地生物。快乐路线不需要统一意见。",
    passes: [
      { kind: "泡泡巴士票", service: "BUBBLE BUS · 市中心环线", from: "海底巴士站", to: "菠萝屋 / 蟹堡餐厅", depart: "09:05", arrive: "09:25", duration: "20m", note: "司机可能随时停车吹泡泡，请把早餐席位放在准时之前。" },
      { kind: "水母田通行证", service: "JELLY TRAIL · 水母迁徙线", from: "蟹堡餐厅", to: "水母田", depart: "13:30", arrive: "14:00", duration: "30m", note: "捕网仅供合影，请勿打扰水母，章鱼音乐家负责控制现场音量。" },
      { kind: "酷乐湖假日票", service: "GOO LAGOON · 海底度假线", from: "水母田", to: "酷乐湖 / 树屋圆顶", depart: "16:20", arrive: "19:10", duration: "傍晚", note: "带好防晒和第二个胃，朋友们已经准备了一整晚的临时计划。" },
    ],
    stops: [
      { id: "pineapple-home", name: "菠萝屋", companion: "海绵宝宝", image: "/bikini-bottom-checkins/pineapple-home.webp", time: "09:30", route: "从贝壳路向东，在最大的菠萝门前按三次门铃。", activity: "和海绵宝宝站在菠萝屋前，拍下今天快乐营业的第一张照片。", stamp: "PINEAPPLE HOME", x: "21%", y: "22%" },
      { id: "krab-restaurant", name: "蟹堡餐厅", companion: "红蟹餐厅老板", image: "/bikini-bottom-checkins/krab-restaurant.webp", time: "11:40", route: "沿锚形路牌前进，闻到烤汉堡香味时立刻右转。", activity: "拿着招牌汉堡在餐厅门口留影，证明景点可以错过但饭点没有。", stamp: "KRABBY LUNCH", x: "79%", y: "22%" },
      { id: "jellyfish-fields", name: "水母田", companion: "章鱼音乐家", image: "/bikini-bottom-checkins/jellyfish-fields.webp", time: "14:20", route: "穿过珊瑚拱门进入粉色草地，跟随音乐寻找温和水母群。", activity: "让章鱼音乐家的旋律和水母一起入镜，拍一张意外和谐的合影。", stamp: "JELLY JAM", x: "50%", y: "50%" },
      { id: "goo-lagoon", name: "酷乐湖", companion: "粉红海星", image: "/bikini-bottom-checkins/goo-lagoon.webp", time: "16:50", route: "乘泡泡巴士到沙滩站，下车后跟着欢呼声走到遮阳伞区。", activity: "和粉红海星并肩看海底日落，把什么都不做变成今日重点。", stamp: "GOO HOLIDAY", x: "22%", y: "76%" },
      { id: "tree-dome", name: "树屋圆顶", companion: "松鼠科学家", image: "/bikini-bottom-checkins/tree-dome.webp", time: "19:15", route: "从酷乐湖沿玻璃管道向北，进入圆顶前戴好水下头盔。", activity: "与松鼠科学家在海底树屋前完成团体照，为荒唐又快乐的一天收尾。", stamp: "BEST DAY EVER", x: "80%", y: "77%" },
    ],
  },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pathFor = (path: string) => `${basePath}${path}`;

function parseResult(): Result | null {
  const raw = new URLSearchParams(window.location.search).get("result");
  if (!raw) return null;
  try {
    const payload = decodeSharedResult(raw);
    const persona = getPersona(payload.p);
    const answerPath = payload.a ?? "";
    return { persona, scores: payload.s, answerPath, resultHash: createResultHash(persona.id, payload.s, answerPath) };
  } catch { return null; }
}

export function ThemedWorldExperience({ worldId }: { worldId: ThemedWorldId }) {
  const config = configs[worldId];
  const [result, setResult] = useState<Result | null | undefined>();
  const [stage, setStage] = useState<Stage>("world");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const orderRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const selected = config.stops.find((stop) => stop.id === selectedId);

  useEffect(() => {
    setResult(parseResult());
    const query = new URLSearchParams(window.location.search);
    const rawStage = query.get("stage");
    const restored: Stage = rawStage === "order" || rawStage === "map" || rawStage === "checkin" ? rawStage : "world";
    const spot = query.get("spot");
    setStage(restored);
    setSelectedId(restored === "checkin" && spot && config.stops.some((item) => item.id === spot) ? spot : null);
  }, [config.stops]);

  function encodedResult() { return result ? encodeSharedResult({ p: result.persona.id, s: result.scores, a: result.answerPath }) : ""; }
  function urlFor(next: Stage | "result", spot?: string | null) {
    const url = new URL(window.location.href);
    url.pathname = next === "result" ? pathFor("/") : pathFor(`/${config.id}/`);
    url.search = "";
    url.searchParams.set("result", encodedResult());
    if (next === "result") { url.searchParams.set("focus", "reality"); url.hash = "reality"; }
    else { url.searchParams.set("stage", next); if (next === "checkin" && spot) url.searchParams.set("spot", spot); url.hash = `${config.id}-${next}`; }
    return url.toString();
  }
  function update(next: Stage, spot?: string) {
    setStage(next);
    if (next === "checkin") { setSelectedId(spot ?? null); setStatus(""); }
    window.history.pushState({}, "", urlFor(next, spot));
    requestAnimationFrame(() => {
      if (next === "order") orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (next === "map" || next === "checkin") mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  async function imageBlob(stop: Stop) { const response = await fetch(pathFor(stop.image)); if (!response.ok) throw new Error(); return response.blob(); }
  function filename(stop: Stop) { return `${config.id}-${stop.id}-${result?.persona.code ?? "traveler"}.webp`; }
  function download(data: Blob, name: string) { const url = URL.createObjectURL(data); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
  async function save(stop: Stop) { setStatus("正在保存打卡图片…"); try { const data = await imageBlob(stop); download(data, filename(stop)); setStatus(`${stop.name}打卡图片已保存`); } catch { setStatus("图片保存失败，请稍后重试"); } }
  if (result === undefined) return <main className="min-h-screen" style={{ background: config.background }} />;
  if (result === null) return <main className="grid min-h-screen place-items-center p-6 text-white" style={{ background: config.background }}><div className="rounded-[2rem] border border-white/20 bg-white/10 p-8 text-center"><h1 className="display text-4xl">{config.cn}入口失效</h1><p className="mt-4 font-bold text-white/70">请先完成旅行人格测试，再领取虚拟世界订单。</p><a href={pathFor("/")} className="mt-6 inline-flex rounded-xl px-5 py-3 font-black text-[#17142f]" style={{ background: config.accent }}>回到首页</a></div></main>;

  return <main className="min-h-screen pb-20 text-white" style={{ background: config.background }}><div className="noise" />
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><button data-testid="themed-header-return" onClick={() => location.assign(urlFor("result"))} className="focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black">← 返回现实世界</button><span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black" style={{ color: config.accent }}>{config.id === "greed-island" ? "隐藏世界 · 通用入岛许可已签发" : `${result.persona.code} · 世界通行许可已签发`}</span></header>
    <section data-testid={`${config.id}-world`} className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-white/15 shadow-[0_18px_60px_rgba(0,0,0,.45)]">
      <div className="relative min-h-[44rem] overflow-hidden"><img src={pathFor(config.hero)} alt={config.heroAlt} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,25,.94),rgba(4,8,25,.62)_48%,transparent_82%),linear-gradient(0deg,rgba(4,8,25,.92),transparent_48%)]" /><div className="relative z-10 flex min-h-[44rem] flex-col justify-between p-6 sm:p-10 lg:p-12"><div className="flex flex-wrap gap-3"><span className="rounded-full border border-white/30 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[.18em]" style={{ color: config.accent }}><Sparkles className="mr-2 inline" size={15} />{config.hidden ? "Secret rule accepted" : "Passage granted"}</span><span className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-black">{config.hidden ? "第二层隐藏世界 · 仅聪明玩家可见" : "攻略已写好 · 五个点位待打卡"}</span></div><motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl"><p className="text-sm font-black tracking-[.16em]" style={{ color: config.secondary }}>{config.eyebrow}</p><h1 className="display mt-3 text-6xl leading-[.9] sm:text-8xl lg:text-9xl">{config.name}<br /><span style={{ color: config.accent }}>{config.cn}</span></h1><p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-white/85 sm:text-xl">{config.intro}{config.id !== "greed-island" && <> 这份路线属于 <span style={{ color: config.accent }}>{result.persona.code}</span>。</>}</p>{config.surprise && config.mascot && <div className="mt-6 flex max-w-xl items-center gap-4 rounded-2xl border-2 border-white/25 bg-black/45 p-3 backdrop-blur"><img src={pathFor(config.mascot)} alt="知道隐藏入口秘密的小青蛙" className="h-20 w-20 shrink-0 rounded-xl border-2 border-white/25 bg-white object-contain sm:h-24 sm:w-24" /><div><p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: config.secondary }}>隐藏规则识破</p><p className="display mt-1 text-2xl sm:text-3xl" style={{ color: config.accent }}>{config.surprise}</p><p className="mt-1 text-sm font-bold text-white/70">连小青蛙都没想到，真的会有人用正确顺序来到这里。</p></div></div>}<div className="mt-7 grid max-w-2xl gap-3 text-sm font-black sm:grid-cols-3"><div className="rounded-2xl border border-white/20 bg-black/30 p-4"><MapPin className="mb-2" style={{ color: config.accent }} size={18} />三张世界凭证</div><div className="rounded-2xl border border-white/20 bg-black/30 p-4"><Compass className="mb-2" style={{ color: config.accent }} size={18} />{config.id === "greed-island" ? "五段通关攻略" : "五段专属攻略"}</div><div className="rounded-2xl border border-white/20 bg-black/30 p-4"><Camera className="mb-2" style={{ color: config.accent }} size={18} />五张主题打卡图</div></div><button onClick={() => update("order")} className="button-pop focus-ring mt-8 inline-flex items-center gap-2 rounded-2xl border-2 border-[#17142f] px-6 py-4 text-lg font-black text-[#17142f] shadow-[5px_5px_0_white]" style={{ background: config.accent }}><ScrollText size={21} /> {config.cta}</button></motion.div></div></div>
      {(stage === "order" || stage === "map" || stage === "checkin") && <motion.div ref={orderRef} data-testid={`${config.id}-order`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-4 bg-[#fffdf7] p-6 text-[#17142f] sm:p-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em]" style={{ color: config.background }}>World order · 虚拟世界订单</p><h2 className="display mt-2 text-4xl sm:text-5xl">{config.orderTitle}</h2><p className="mt-3 font-bold text-black/60">订单 {config.id.toUpperCase()}-{result.resultHash.replace("#TPI-", "")} · {config.id === "greed-island" ? "不限旅行人格，隐藏规则验证通过" : `已绑定人格代码 ${result.persona.code}`}</p></div><button onClick={() => update("map")} className="group button-pop focus-ring rounded-xl border-2 border-[#17142f] px-5 py-3 font-black shadow-[4px_4px_0_#17142f]" style={{ background: config.secondary }}><span className="group-hover:hidden"><ScrollText className="mr-2 inline" size={18} />3 张凭证待验</span><span className="hidden group-hover:inline"><BadgeCheck className="mr-2 inline" size={18} />打开世界攻略</span></button></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">{config.passes.map((pass, index) => <article key={pass.kind} className="flex min-h-[19rem] flex-col rounded-2xl border-2 border-[#17142f] bg-white p-5" style={{ boxShadow: `5px 5px 0 ${config.accent}` }}><div className="border-b-2 border-dashed border-black/20 pb-4"><span className="text-xs font-black text-black/45">PASS 0{index + 1}</span><h3 className="display mt-1 text-3xl">{pass.kind}</h3></div><p className="mt-4 text-sm font-black" style={{ color: config.background }}>{pass.service}</p><div className="mt-5 grid gap-3"><p><span className="text-xs font-black text-black/40">FROM</span><br /><b>{pass.from}</b></p><p><span className="text-xs font-black text-black/40">TO</span><br /><b>{pass.to}</b></p></div><div className="mt-4 grid grid-cols-3 rounded-xl bg-black/5 p-3 text-center text-sm"><b>{pass.depart}</b><b>{pass.arrive}</b><b>{pass.duration}</b></div><p className="mt-auto pt-4 text-sm font-bold text-black/55">{pass.note}</p></article>)}</div>
        {(stage === "map" || stage === "checkin") && <motion.div ref={mapRef} data-testid={`${config.id}-map`} className="mt-10 rounded-[2rem] border-2 border-[#17142f] p-5 text-white shadow-[7px_7px_0_#17142f] sm:p-7" style={{ background: config.background }}><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em]" style={{ color: config.accent }}>World guide · 世界攻略</p><h2 className="display mt-2 text-4xl sm:text-5xl">{config.guideTitle}</h2><p className="mt-3 font-bold text-white/70">点击五个点位，查看与当地角色共同完成的完整打卡图。</p></div><div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black">{config.routeSummary}</div></div>
          <div className="mt-7 grid items-start gap-5 lg:grid-cols-[.82fr_1.18fr]"><div className="space-y-5"><div className="relative aspect-square min-h-[26rem] overflow-hidden rounded-2xl border-2 border-white/15"><img src={pathFor(config.map)} alt={`${config.cn}五站路线地图`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/10" />{config.stops.map((stop, index) => <button key={stop.id} data-testid={`${config.id}-stop-${stop.id}`} onClick={() => update("checkin", stop.id)} style={{ left: stop.x, top: stop.y }} className="button-pop focus-ring absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-white font-black text-[#17142f] shadow-[3px_3px_0_rgba(0,0,0,.45)]" style={{ background: selectedId === stop.id ? config.accent : "white" }}>{index + 1}</span><span className="rounded-full bg-black/75 px-3 py-1 text-xs font-black">{stop.name}</span></button>)}</div>{selected && <div className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-xs font-black" style={{ color: config.accent }}>{selected.time} · {selected.stamp}</p><h3 className="display mt-2 text-4xl">{selected.name}</h3><p className="mt-2 font-black" style={{ color: config.secondary }}>本次同行：{selected.companion}</p><p className="mt-4 text-xl font-black">{selected.activity}</p><p className="mt-3 text-sm font-bold text-white/70">{selected.route}</p></div>}</div>
            <div className="rounded-2xl bg-[#fffdf7] p-4 text-[#17142f]">{selected ? <><motion.div key={selected.id} data-testid={`${config.id}-checkin-image`} className="overflow-hidden rounded-[1.5rem] border-2 border-[#17142f]" style={{ boxShadow: `5px 5px 0 ${config.accent}` }}><img src={pathFor(selected.image)} alt={`${selected.companion}在${selected.name}的背影打卡图`} className="block h-auto w-full object-contain" /></motion.div><div className="mt-4 grid grid-cols-[.78fr_1.22fr] gap-3"><button onClick={() => save(selected)} className="button-pop rounded-xl border-2 border-[#17142f] px-3 py-3 font-black" style={{ background: config.accent }}><Download className="mr-2 inline" size={18} />保存图片</button><button data-testid="themed-return-reality" onClick={() => location.assign(urlFor("result"))} className="rounded-xl border-2 border-[#17142f] px-4 py-3 font-black" style={{ background: config.secondary }}><Compass className="mr-2 inline" size={18} />打卡结束，返回现实</button></div>{status && <p role="status" className="mt-3 rounded-xl bg-[#17142f] p-3 text-center text-sm font-black text-white">{status}</p>}</> : <div className="grid min-h-[26rem] place-items-center text-center"><div><Camera className="mx-auto" style={{ color: config.background }} /><h3 className="display mt-4 text-3xl">选择第一个打卡点</h3><p className="mt-2 font-bold text-black/55">完整打卡图片会在这里展示</p></div></div>}</div></div></motion.div>}
      </motion.div>}
    </section>
  </main>;
}
