"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  Castle,
  Clock,
  Download,
  MapPin,
  Plane,
  ScrollText,
  Ship,
  Ticket,
  TrainFront,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPersona } from "@/data/catalog";
import { questions } from "@/lib/scoring";
import { createResultHash, decodeSharedResult, encodeSharedResult } from "@/lib/share";
import type { Answer, Persona, Scores } from "@/lib/types";

type HogwartsStage = "world" | "order" | "map" | "checkin";
type ParsedResult = { persona: Persona; scores: Scores; answers: Answer[]; answerPath: string; resultHash: string };
type HogwartsTicket = {
  kind: string;
  service: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  duration: string;
  seat: string;
  note: string;
  Icon: LucideIcon;
};
type HogwartsStop = {
  id: string;
  name: string;
  image: string;
  time: string;
  route: string;
  activity: string;
  stamp: string;
  color: string;
  x: string;
  y: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const hogwartsTickets: HogwartsTicket[] = [
  { kind: "地铁票", service: "London Underground · Piccadilly / Circle Line", from: "伦敦市区", to: "King's Cross St. Pancras", depart: "07:45", arrive: "08:05", duration: "约 20 分钟", seat: "自由站席 · 扶手旁", note: "抵达后前往伦敦国王十字车站，寻找 9 又 3/4 站台入口。", Icon: Ticket },
  { kind: "高铁票", service: "Hogwarts Express · 霍格沃兹特快列车", from: "伦敦国王十字车站 9 又 3/4 站台", to: "霍格莫德车站", depart: "11:00", arrive: "20:00", duration: "约 9 小时", seat: "07 号包厢 · 靠窗位", note: "车程中可补给巧克力蛙，抵达后跟随一年级入校队伍。", Icon: TrainFront },
  { kind: "船票", service: "Black Lake Crossing · 黑湖入校航线", from: "霍格莫德车站码头", to: "霍格沃兹船屋", depart: "20:30", arrive: "20:55", duration: "约 25 分钟", seat: "木船 03 · 湖景位", note: "横渡黑湖后从船屋入校，晚宴席位将由分院帽现场安排。", Icon: Ship },
];

const hogwartsStops: HogwartsStop[] = [
  { id: "boathouse", name: "黑湖船屋", image: "/hogwarts-checkins/boathouse-short-hair-v5.webp", time: "21:00", route: "从船屋上岸，沿石阶进入城堡侧门。", activity: "先拍一张入校第一视角，证明你真的从黑湖路线抵达。", stamp: "Black Lake Arrival", color: "linear-gradient(145deg, #0f766e, #172554)", x: "16%", y: "72%" },
  { id: "great-hall", name: "礼堂", image: "/hogwarts-checkins/great-hall-short-hair-v4.webp", time: "21:25", route: "穿过门厅进入礼堂，按长桌灯光找到晚宴席位。", activity: "抬头看天花板，拍下今晚的魔法天气和开学晚宴。", stamp: "Great Hall Feast", color: "linear-gradient(145deg, #92400e, #7c2d12)", x: "33%", y: "48%" },
  { id: "staircase", name: "移动楼梯", image: "/hogwarts-checkins/moving-staircase.webp", time: "22:05", route: "从礼堂外侧上楼，等楼梯停稳后再换向。", activity: "记录一次路线重算现场，适合发给所有爱规划的人。", stamp: "Moving Staircase", color: "linear-gradient(145deg, #4338ca, #701a75)", x: "51%", y: "30%" },
  { id: "library", name: "图书馆", image: "/hogwarts-checkins/library.webp", time: "22:35", route: "沿画像走廊右转，保持安静进入高书架区。", activity: "生成一张深夜攻略感照片，标题就叫“明天也许会按计划走”。", stamp: "Library Route Plan", color: "linear-gradient(145deg, #4a044e, #713f12)", x: "70%", y: "38%" },
  { id: "astronomy", name: "天文塔", image: "/hogwarts-checkins/astronomy-tower.webp", time: "23:10", route: "从图书馆继续向上，抵达最适合收尾的高处视角。", activity: "把城堡、星空和你的隐藏世界探索者编号一起收进夜景打卡图。", stamp: "Astronomy Tower", color: "linear-gradient(145deg, #020617, #312e81)", x: "84%", y: "16%" },
];

function decodeAnswerPath(path = ""): Answer[] {
  return questions.flatMap((question, index) => {
    const optionId = path[index];
    return question.options.some((option) => option.id === optionId)
      ? [{ questionId: question.id, optionId }]
      : [];
  });
}

function parseResult(): ParsedResult | null {
  const shared = new URLSearchParams(window.location.search).get("result");
  if (!shared) return null;
  try {
    const payload = decodeSharedResult(shared);
    const persona = getPersona(payload.p);
    const answerPath = payload.a ?? "";
    return {
      persona,
      scores: payload.s,
      answerPath,
      answers: decodeAnswerPath(answerPath),
      resultHash: createResultHash(persona.id, payload.s, answerPath),
    };
  } catch {
    return null;
  }
}

function pathFor(path: string) {
  return `${basePath}${path}`;
}

export function HogwartsExperience() {
  const [result, setResult] = useState<ParsedResult | null | undefined>(undefined);
  const [stage, setStage] = useState<HogwartsStage>("world");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [imageActionStatus, setImageActionStatus] = useState("");
  const orderRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const selectedStop = hogwartsStops.find((stop) => stop.id === selectedStopId);

  useEffect(() => {
    const parsed = parseResult();
    setResult(parsed);

    const params = new URLSearchParams(window.location.search);
    const stageParam = params.get("stage");
    const restoredStage = stageParam === "order" || stageParam === "map" || stageParam === "checkin" ? stageParam : "world";
    const stopId = params.get("spot");
    const restoredStopId = stopId && hogwartsStops.some((stop) => stop.id === stopId) ? stopId : null;
    setStage(restoredStage);
    setSelectedStopId(restoredStage === "checkin" ? restoredStopId : null);
  }, []);

  function resultUrl(parsed = result) {
    const url = new URL(window.location.href);
    url.pathname = pathFor("/");
    url.search = "";
    url.searchParams.set("result", encodeSharedResult({ p: parsed?.persona.id ?? "", s: parsed?.scores as Scores, a: parsed?.answerPath }));
    url.searchParams.set("focus", "reality");
    url.hash = "reality";
    return url.toString();
  }

  function hogwartsUrl(nextStage: HogwartsStage, stopId?: string | null) {
    if (!result) return window.location.href;
    const url = new URL(window.location.href);
    url.pathname = pathFor("/hogwarts/");
    url.search = "";
    url.searchParams.set("result", encodeSharedResult({ p: result.persona.id, s: result.scores, a: result.answerPath }));
    url.searchParams.set("stage", nextStage);
    if (nextStage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = nextStage === "world" ? "hogwarts" : nextStage === "order" ? "hogwarts-order" : nextStage === "map" ? "hogwarts-map" : "hogwarts-checkin";
    return url.toString();
  }

  function updateStage(nextStage: HogwartsStage, stopId?: string | null) {
    setStage(nextStage);
    setSelectedStopId(nextStage === "checkin" ? stopId ?? null : selectedStopId);
    if (nextStage === "checkin") setImageActionStatus("");
    window.history.pushState({}, "", hogwartsUrl(nextStage, stopId));
    window.requestAnimationFrame(() => {
      if (nextStage === "order") orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nextStage === "map" || nextStage === "checkin") mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function returnToReality() {
    if (!result) return;
    window.location.assign(resultUrl(result));
  }

  function checkInFilename(stop: HogwartsStop) {
    return `hogwarts-${stop.id}-${result?.persona.code ?? "traveler"}.webp`;
  }

  async function loadCheckInImage(stop: HogwartsStop) {
    const response = await fetch(pathFor(stop.image));
    if (!response.ok) throw new Error("check-in image unavailable");
    return response.blob();
  }

  function downloadCheckInBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function saveCheckInImage(stop: HogwartsStop) {
    setImageActionStatus("正在保存打卡图片…");
    try {
      const blob = await loadCheckInImage(stop);
      downloadCheckInBlob(blob, checkInFilename(stop));
      setImageActionStatus(`${stop.name}打卡图片已保存`);
    } catch {
      setImageActionStatus("图片保存失败，请稍后重试");
    }
  }

  if (result === undefined) {
    return <main className="min-h-screen bg-[#120f28]" aria-hidden="true" />;
  }

  if (result === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#17142f] p-6 text-center text-white">
        <div className="max-w-md rounded-[2rem] border-2 border-white/20 bg-white/10 p-8">
          <h1 className="display text-4xl">隐藏世界入口失效</h1>
          <p className="mt-4 font-bold text-white/70">需要先完成旅行人格测试，才能生成霍格沃兹入校订单。</p>
          <a href={pathFor("/")} className="button-pop focus-ring mt-6 inline-flex rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-5 py-3 font-black text-[#17142f] shadow-[4px_4px_0_white]">回到测试首页</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#120f28] pb-20 text-white">
      <div className="noise" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <button onClick={returnToReality} className="focus-ring rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur hover:bg-white hover:text-[#17142f]">← 返回现实世界</button>
        <span className="rounded-full border border-[#ffd84d]/30 bg-[#ffd84d]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.2em] text-[#ffd84d]">隐藏世界探索者 · 彩蛋已解锁</span>
      </header>

      <section data-testid="hogwarts-world" className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-white/15 bg-[#120f28] shadow-[0_18px_60px_rgba(0,0,0,.4)]">
        <div className="relative min-h-[44rem] overflow-hidden sm:min-h-[47rem]">
          <img src={pathFor("/hogwarts-secret-world-v2.webp")} alt="月光下的魔法城堡、黑湖小船与夜行列车" className="absolute inset-0 h-full w-full object-cover object-[44%_center]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,28,.94)_0%,rgba(12,9,38,.68)_46%,rgba(12,9,38,.08)_78%),linear-gradient(0deg,rgba(7,5,28,.98)_0%,transparent_52%)]" />
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_88%_16%,rgba(255,216,77,.35),transparent_12%),radial-gradient(circle_at_66%_46%,rgba(200,255,85,.18),transparent_10%)]" />

          {["left-[8%] top-[22%]", "left-[56%] top-[16%]", "right-[9%] top-[34%]", "left-[46%] bottom-[28%]", "right-[24%] bottom-[18%]"].map((position, index) => (
            <motion.span key={position} className={`absolute h-1.5 w-1.5 rounded-full bg-[#ffd84d] shadow-[0_0_14px_4px_rgba(255,216,77,.65)] ${position}`} animate={{ opacity: [.25, 1, .25], scale: [.8, 1.5, .8] }} transition={{ duration: 2.4 + index * .35, repeat: Infinity, delay: index * .3 }} aria-hidden="true" />
          ))}

          <div className="relative z-10 flex min-h-[44rem] flex-col justify-between p-6 sm:min-h-[47rem] sm:p-10 lg:p-12">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/45 bg-[#120f28]/65 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#ffd84d] backdrop-blur"><WandSparkles size={15} /> Secret world unlocked</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white/80 backdrop-blur">四枚螺丝全部拆除 · 稀有彩蛋</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="max-w-3xl">
              <p className="text-sm font-black tracking-[.2em] text-[#c8ff55]">你拆掉的不是螺丝，是现实世界的边界</p>
              <h1 className="display mt-3 text-balance text-6xl leading-[.9] sm:text-8xl lg:text-9xl">Hogwarts<br /><span className="text-[#ffd84d]">霍格沃兹</span></h1>
              <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-white/85 sm:text-xl">无论你的旅行人格是什么，只要拆下虚拟世界的四枚螺丝，就会收到这封隐藏邀请。今晚从 9 又 3/4 站台出发，穿过雾夜与黑湖，城堡已经为发现入口的你亮起一扇窗。</p>

              <div className="mt-7 grid max-w-2xl gap-3 text-sm font-black sm:grid-cols-3">
                <div className="rounded-2xl border border-white/20 bg-[#120f28]/60 p-4 backdrop-blur"><MapPin size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">第一站</span>9¾ 隐藏站台</div>
                <div className="rounded-2xl border border-white/20 bg-[#120f28]/60 p-4 backdrop-blur"><Clock size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">夜行时间</span>约 9h45m</div>
                <div className="rounded-2xl border border-white/20 bg-[#120f28]/60 p-4 backdrop-blur"><Castle size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">最终抵达</span>黑湖城堡</div>
              </div>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button onClick={() => updateStage("order")} className="button-pop focus-ring inline-flex items-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#c8ff55] px-6 py-4 text-base font-black text-[#17142f] shadow-[5px_5px_0_white] sm:text-lg">
                  <TrainFront size={21} /> 猫头鹰只等今晚，领取你的入校通行证
                </button>
                <span className="text-xs font-bold text-white/55">专属订单、3 张车票和城堡夜游地图已就绪</span>
              </div>
            </motion.div>
          </div>
        </div>

        {(stage === "order" || stage === "map" || stage === "checkin") && (
          <motion.div ref={orderRef} data-testid="hogwarts-order" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-4 border-t-2 border-white/10 bg-[#fffdf7] p-6 text-[#17142f] sm:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Itinerary order · 入校行程订单</p>
                <h2 className="display mt-2 text-balance text-4xl sm:text-5xl">霍格沃兹入校交通已生成</h2>
                <p className="mt-3 max-w-2xl font-bold leading-relaxed text-black/65">订单号 HW-{result.resultHash.replace("#TPI-", "")}。所有时间为系统预估，用于娱乐展示。</p>
              </div>
              <button onClick={() => updateStage("map")} className="group button-pop focus-ring inline-flex min-w-[9.5rem] items-center justify-center rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]" aria-label="3 张票待验，开始验票">
                <span className="inline-flex items-center gap-2 group-hover:hidden"><ScrollText size={18} /> 3 张票待验</span>
                <span className="hidden items-center gap-2 group-hover:inline-flex"><BadgeCheck size={18} /> 开始验票</span>
              </button>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {hogwartsTickets.map(({ Icon, ...ticket }, index) => (
                <article key={ticket.kind} className="relative flex min-h-[21rem] flex-col overflow-hidden rounded-2xl border-2 border-[#17142f] bg-white p-5 shadow-[5px_5px_0_#7657ff]">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#17142f]/20 pb-4">
                    <div><span className="text-xs font-black uppercase tracking-[.16em] text-black/50">Ticket 0{index + 1}</span><h3 className="display mt-1 text-3xl">{ticket.kind}</h3></div>
                    <div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#17142f] bg-[#c8ff55]"><Icon size={22} /></div>
                  </div>
                  <p className="mt-4 text-sm font-black text-[#5635c7]">{ticket.service}</p>
                  <div className="mt-5 grid gap-4">
                    <div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">From</span><p className="mt-1 font-black leading-tight">{ticket.from}</p></div>
                    <div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">To</span><p className="mt-1 font-black leading-tight">{ticket.to}</p></div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#f5f0ff] p-3 text-center">
                    <div><span className="text-[10px] font-black uppercase text-black/45">出发</span><p className="font-black">{ticket.depart}</p></div>
                    <div><span className="text-[10px] font-black uppercase text-black/45">抵达</span><p className="font-black">{ticket.arrive}</p></div>
                    <div><span className="text-[10px] font-black uppercase text-black/45">时长</span><p className="font-black">{ticket.duration}</p></div>
                  </div>
                  <p className="mt-4 text-sm font-bold leading-relaxed text-black/65">{ticket.seat}</p>
                  <p className="mt-auto pt-4 text-sm font-bold leading-relaxed text-black/55">{ticket.note}</p>
                </article>
              ))}
            </div>

            {(stage === "map" || stage === "checkin") && (
              <motion.div ref={mapRef} data-testid="hogwarts-map" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-[2rem] border-2 border-[#17142f] bg-[#120f28] p-5 text-white shadow-[7px_7px_0_#17142f] sm:p-7">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#c8ff55]">Map guide · 游玩地图攻略</p><h2 className="display mt-2 text-balance text-4xl sm:text-5xl">验票完成，开始城堡夜游</h2><p className="mt-3 max-w-2xl font-bold leading-relaxed text-white/70">路线已排好。每个点位都会带着订单号和探索者编号生成一张专属打卡图片。</p></div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white/85">推荐路线：船屋 → 礼堂 → 移动楼梯 → 图书馆 → 天文塔</div>
                </div>

                <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,.82fr)_minmax(22rem,1.18fr)]">
                  <div className="space-y-5">
                    <div className="relative aspect-square min-h-[26rem] overflow-hidden rounded-2xl border-2 border-white/15">
                      <img src={pathFor("/world-maps/hogwarts.webp")} alt="霍格沃兹五站夜游路线地图" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                      {hogwartsStops.map((stop, index) => (
                        <button key={stop.id} onClick={() => updateStage("checkin", stop.id)} style={{ left: stop.x, top: stop.y }} className="focus-ring button-pop absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                          <span className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-lg font-black shadow-[4px_4px_0_rgba(0,0,0,.35)] ${selectedStopId === stop.id ? "bg-[#c8ff55] text-[#17142f]" : "bg-[#fffdf7] text-[#17142f]"}`}>{index + 1}</span>
                          <span className="rounded-full border border-white/25 bg-[#17142f]/80 px-3 py-1 text-xs font-black text-white backdrop-blur">{stop.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedStop && (
                      <motion.div key={`${selectedStop.id}-details`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-white/15 bg-white/10 p-5 text-white">
                        <div className="flex items-start justify-between gap-4">
                          <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#c8ff55]">Check-in record</p><h3 className="display mt-2 text-4xl">{selectedStop.name}</h3></div>
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white bg-[#ffd84d] text-[#17142f]"><Camera size={22} /></div>
                        </div>
                        <p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#ffd84d]">{selectedStop.time} · {selectedStop.stamp}</p>
                        <p className="mt-3 text-xl font-black leading-tight">{selectedStop.activity}</p>
                        <p className="mt-4 text-sm font-bold leading-relaxed text-white/70">{selectedStop.route}</p>
                        <div className="mt-5 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-white px-3 py-1 text-[#17142f]">HW-{result.resultHash.replace("#TPI-", "")}</span><span className="rounded-full bg-[#c8ff55] px-3 py-1 text-[#17142f]">隐藏世界探索者</span></div>
                      </motion.div>
                    )}
                  </div>

                  <div className="rounded-2xl border-2 border-white/15 bg-[#fffdf7] p-4 text-[#17142f]">
                    {selectedStop ? (
                      <>
                        <motion.div key={selectedStop.id} data-testid="checkin-image" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} role="img" aria-label={`${selectedStop.name} 打卡图片`} className="overflow-hidden rounded-[1.5rem] border-2 border-[#17142f] bg-[#17142f] shadow-[5px_5px_0_#7657ff]">
                          <img src={pathFor(selectedStop.image)} alt={`${selectedStop.name}中旅人与小猫的到此一游照片`} className="block h-auto w-full object-contain" />
                        </motion.div>
                        <div className="mt-4 grid grid-cols-[.78fr_1.22fr] gap-3">
                          <button onClick={() => saveCheckInImage(selectedStop)} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-3 py-3 font-black shadow-[4px_4px_0_#17142f]"><Download size={18} /> 保存图片</button>
                          <button onClick={returnToReality} data-testid="return-reality" className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Plane size={18} /> 打卡结束，回到现实</button>
                        </div>
                        {imageActionStatus && <p role="status" className="mt-3 rounded-xl bg-[#17142f] px-4 py-3 text-center text-sm font-black text-white">{imageActionStatus}</p>}
                      </>
                    ) : (
                      <div className="grid min-h-[26rem] place-items-center rounded-[1.5rem] border-2 border-dashed border-[#17142f]/25 bg-[#f5f0ff] p-6 text-center"><div><Camera className="mx-auto text-[#5635c7]" size={34} /><h3 className="display mt-4 text-3xl">通行记录待盖章</h3><p className="mt-3 max-w-xs font-bold leading-relaxed text-black/55">打卡图片将在这里出现，带上点位时间、路线和订单编号。</p></div></div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </section>
    </main>
  );
}
