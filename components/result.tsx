"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  Castle,
  Check,
  Clock,
  Download,
  Link2,
  MapPin,
  Plane,
  RotateCcw,
  ScrollText,
  Share2,
  Ship,
  Sparkles,
  Ticket,
  TrainFront,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PersonalityRadar } from "@/components/personality-radar";
import { personaImageSrc } from "@/lib/persona-image";
import { generatePersonalityPoster } from "@/lib/poster";
import { skyscannerUrl, type TravelLanguage } from "@/lib/scoring";
import { cleanPageUrl, copyText, createResultHash, encodeSharedResult } from "@/lib/share";
import type { Analysis, Answer, Persona, Scores, World } from "@/lib/types";

type Props = {
  persona: Persona;
  world: World;
  scores: Scores;
  analysis: Analysis;
  answers: Answer[];
  onRestart: () => void;
};

type PosterPreview = { blob: Blob; url: string; filename: string };
const screwdriverCursor = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M22 3l7 7-3 3-3-3L11 22l-4 1 1-4L20 7l-3-3z' fill='%239ca3af' stroke='%234b5563' stroke-width='2'/%3E%3Cpath d='M5 24l3 3' stroke='%236b7280' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\") 6 24, pointer";
const hiddenWorldScrews = [
  { id: "top-left", label: "左上角螺丝钉", className: "left-4 top-4" },
  { id: "top-right", label: "右上角螺丝钉", className: "right-4 top-4" },
  { id: "bottom-left", label: "左下角螺丝钉", className: "bottom-4 left-4" },
  { id: "bottom-right", label: "右下角螺丝钉", className: "bottom-4 right-4" },
] as const;
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
  time: string;
  route: string;
  activity: string;
  stamp: string;
  color: string;
  x: string;
  y: string;
};

const hogwartsTickets: HogwartsTicket[] = [
  {
    kind: "地铁票",
    service: "London Underground · Piccadilly / Circle Line",
    from: "伦敦市区",
    to: "King's Cross St. Pancras",
    depart: "07:45",
    arrive: "08:05",
    duration: "约 20 分钟",
    seat: "自由站席 · 扶手旁",
    note: "抵达后前往伦敦国王十字车站，寻找 9 又 3/4 站台入口。",
    Icon: Ticket,
  },
  {
    kind: "高铁票",
    service: "Hogwarts Express · 霍格沃兹特快列车",
    from: "伦敦国王十字车站 9 又 3/4 站台",
    to: "霍格莫德车站",
    depart: "11:00",
    arrive: "20:00",
    duration: "约 9 小时",
    seat: "07 号包厢 · 靠窗位",
    note: "车程中可补给巧克力蛙，抵达后跟随一年级入校队伍。",
    Icon: TrainFront,
  },
  {
    kind: "船票",
    service: "Black Lake Crossing · 黑湖入校航线",
    from: "霍格莫德车站码头",
    to: "霍格沃兹船屋",
    depart: "20:30",
    arrive: "20:55",
    duration: "约 25 分钟",
    seat: "木船 03 · 湖景位",
    note: "横渡黑湖后从船屋入校，晚宴席位将由分院帽现场安排。",
    Icon: Ship,
  },
];

const hogwartsStops: HogwartsStop[] = [
  {
    id: "boathouse",
    name: "黑湖船屋",
    time: "21:00",
    route: "从船屋上岸，沿石阶进入城堡侧门。",
    activity: "先拍一张入校第一视角，证明你真的从黑湖路线抵达。",
    stamp: "Black Lake Arrival",
    color: "linear-gradient(145deg, #0f766e, #172554)",
    x: "16%",
    y: "72%",
  },
  {
    id: "great-hall",
    name: "礼堂",
    time: "21:25",
    route: "穿过门厅进入礼堂，按长桌灯光找到晚宴席位。",
    activity: "抬头看天花板，拍下今晚的魔法天气和开学晚宴。",
    stamp: "Great Hall Feast",
    color: "linear-gradient(145deg, #92400e, #7c2d12)",
    x: "33%",
    y: "48%",
  },
  {
    id: "staircase",
    name: "移动楼梯",
    time: "22:05",
    route: "从礼堂外侧上楼，等楼梯停稳后再换向。",
    activity: "记录一次路线重算现场，适合发给所有爱规划的人。",
    stamp: "Moving Staircase",
    color: "linear-gradient(145deg, #4338ca, #701a75)",
    x: "51%",
    y: "30%",
  },
  {
    id: "library",
    name: "图书馆",
    time: "22:35",
    route: "沿画像走廊右转，保持安静进入高书架区。",
    activity: "生成一张深夜攻略感照片，标题就叫“明天也许会按计划走”。",
    stamp: "Library Route Plan",
    color: "linear-gradient(145deg, #4a044e, #713f12)",
    x: "70%",
    y: "38%",
  },
  {
    id: "astronomy",
    name: "天文塔",
    time: "23:10",
    route: "从图书馆继续向上，抵达最适合收尾的高处视角。",
    activity: "把城堡、星空和你的隐藏世界探索者编号一起收进夜景打卡图。",
    stamp: "Astronomy Tower",
    color: "linear-gradient(145deg, #020617, #312e81)",
    x: "84%",
    y: "16%",
  },
];

export function Result({ persona, world, scores, analysis, answers, onRestart }: Props) {
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [pageLanguage, setPageLanguage] = useState<TravelLanguage>("zh");
  const [posterPreview, setPosterPreview] = useState<PosterPreview | null>(null);
  const [posterStatus, setPosterStatus] = useState("");
  const [showHogwarts, setShowHogwarts] = useState(false);
  const [showHogwartsOrder, setShowHogwartsOrder] = useState(false);
  const [showHogwartsMap, setShowHogwartsMap] = useState(false);
  const [selectedHogwartsStopId, setSelectedHogwartsStopId] = useState<string | null>(null);
  const [removedScrews, setRemovedScrews] = useState<string[]>([]);
  const hogwartsRef = useRef<HTMLElement | null>(null);
  const hogwartsMapRef = useRef<HTMLDivElement | null>(null);
  const realityRef = useRef<HTMLElement | null>(null);
  const answerPath = answers.map((answer) => answer.optionId).join("");
  const resultHash = createResultHash(persona.id, scores, answerPath);
  const hogwartsOrderId = `HW-${resultHash.replace("#TPI-", "")}`;
  const selectedHogwartsStop = hogwartsStops.find((stop) => stop.id === selectedHogwartsStopId);

  useEffect(() => {
    setPageLanguage(document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh");
  }, []);

  useEffect(() => {
    const shouldFocusReality = new URLSearchParams(window.location.search).get("focus") === "reality" || window.location.hash === "#reality";
    window.history.replaceState({}, "", resultUrl());
    if (shouldFocusReality) {
      window.requestAnimationFrame(() => realityRef.current?.scrollIntoView({ behavior: "auto", block: "start" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!posterPreview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPosterPreview(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      URL.revokeObjectURL(posterPreview.url);
    };
  }, [posterPreview]);

  function resultUrl() {
    const url = cleanPageUrl();
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.hash = resultHash.slice(1);
    return url.toString();
  }

  function hogwartsUrl(stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/hogwarts/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) {
      url.searchParams.set("spot", stopId);
    }
    url.hash = stage === "world" ? "hogwarts" : stage === "order" ? "hogwarts-order" : stage === "map" ? "hogwarts-map" : "hogwarts-checkin";
    return url.toString();
  }

  function greedIslandUrl(stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/greed-island/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = `greed-island-${stage}`;
    return url.toString();
  }

  function pokemonUrl(stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pokemon/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = stage === "world" ? "pokemon-world" : stage === "order" ? "pokemon-order" : stage === "map" ? "pokemon-map" : "pokemon-checkin";
    return url.toString();
  }

  function grandLineUrl(stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/grand-line/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = stage === "world" ? "grand-line-world" : stage === "order" ? "grand-line-order" : stage === "map" ? "grand-line-map" : "grand-line-checkin";
    return url.toString();
  }

  function middleEarthUrl(stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/middle-earth/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = `middle-earth-${stage}`;
    return url.toString();
  }

  function themedWorldUrl(worldId: "galactic-empire" | "atlantis" | "disney-castle" | "pandora" | "bikini-bottom", stage: "world" | "order" | "map" | "checkin", stopId?: string | null) {
    const url = cleanPageUrl();
    url.pathname = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${worldId}/`;
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    url.searchParams.set("stage", stage);
    if (stage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = `${worldId}-${stage}`;
    return url.toString();
  }

  function inviteUrl() {
    const url = cleanPageUrl();
    url.searchParams.set("from", persona.id);
    return url.toString();
  }

  async function shareResultLink() {
    const url = resultUrl();
    const shareData = {
      title: `我的旅行人格是 ${persona.code}`,
      text: `毒舌测试说我是「${persona.code} · ${persona.name}」${persona.emoji}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setStatus("结果链接已分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus("已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(url);
      setStatus("结果链接已复制，可直接粘贴打开");
    } catch {
      setStatus("复制失败，请从浏览器地址栏复制链接");
    }
  }

  async function inviteFriend() {
    const text = `毒舌测试说我是「${persona.code} · ${persona.name}」${persona.emoji}。现在轮到你暴露旅行人设了：`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Travel Personality Indicator", text, url: inviteUrl() });
        setStatus("邀请链接已分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus("已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(`${text}\n${inviteUrl()}`);
      setStatus("邀请文案已复制");
    } catch {
      setStatus("复制失败，请从浏览器地址栏复制链接");
    }
  }

  async function createPosterPreview() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const blob = await generatePersonalityPoster({ persona, world, scores, analysis, inviteUrl: inviteUrl(), resultHash });
      const filename = `travel-personality-${persona.code.toLowerCase()}-${persona.id}.png`;
      setPosterStatus("");
      setPosterPreview({ blob, filename, url: URL.createObjectURL(blob) });
      setStatus("人格海报已生成，可以预览或分享");
    } catch {
      setStatus("海报生成失败，请重试");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function savePoster() {
    if (!posterPreview) return;
    const link = document.createElement("a");
    link.download = posterPreview.filename;
    link.href = posterPreview.url;
    link.click();
    setPosterStatus("图片已保存");
  }

  async function sharePoster() {
    if (!posterPreview) return;
    const file = new File([posterPreview.blob], posterPreview.filename, { type: "image/png" });
    // A file-only payload avoids duplicate image representations in desktop clipboards.
    const shareData: ShareData = { files: [file] };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        setPosterStatus("已打开系统分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setPosterStatus("已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(resultUrl());
      setPosterStatus("当前浏览器不支持图片直分享，结果链接已复制");
    } catch {
      setPosterStatus("当前浏览器不支持图片直分享，请先保存图片");
    }
  }

  async function copyPosterLink() {
    try {
      await copyText(resultUrl());
      setPosterStatus("结果链接已复制");
    } catch {
      setPosterStatus("复制失败，请从浏览器地址栏复制链接");
    }
  }

  function removeHiddenWorldScrew(id: string) {
    setRemovedScrews((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      if (next.length === hiddenWorldScrews.length) {
        const startsAtBottom = next[0].startsWith("bottom-");
        const endsAtTop = next[next.length - 1].startsWith("top-");
        const destination = startsAtBottom && endsAtTop ? greedIslandUrl("world") : hogwartsUrl("world");
        window.setTimeout(() => window.location.assign(destination), 180);
      }
      return next;
    });
  }

  function generateHogwartsOrder() {
    setShowHogwartsOrder(true);
    window.history.pushState({}, "", hogwartsUrl("order"));
    window.requestAnimationFrame(() => {
      hogwartsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function inspectHogwartsTickets() {
    setShowHogwartsMap(true);
    window.history.pushState({}, "", hogwartsUrl("map"));
    window.requestAnimationFrame(() => {
      hogwartsMapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function generateCheckInImage(stopId: string) {
    setSelectedHogwartsStopId(stopId);
    window.history.pushState({}, "", hogwartsUrl("checkin", stopId));
    window.requestAnimationFrame(() => {
      hogwartsMapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function finishHogwartsCheckIn() {
    setShowHogwarts(false);
    setShowHogwartsOrder(false);
    setShowHogwartsMap(false);
    setSelectedHogwartsStopId(null);
    window.history.pushState({}, "", resultUrl());
    window.requestAnimationFrame(() => {
      realityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0ff] pb-24">
      <div className="noise" />
      <header className="relative overflow-hidden bg-[#17142f] px-5 pb-28 pt-8 text-white sm:px-10 sm:pb-40">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#7657ff] blur-2xl" />
        <div className="absolute -bottom-44 -left-20 h-96 w-96 rounded-full bg-[#ff4fa3] blur-3xl opacity-70" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between">
          <button onClick={onRestart} className="focus-ring flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#17142f] hover:bg-[#c8ff55]"><RotateCcw size={16} /> 再测一次</button>
          <span className="text-xs font-black uppercase tracking-[.2em] text-white/75">Travel Personality · 2026</span>
        </div>
        <div className="relative mx-auto mt-16 max-w-6xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-black uppercase tracking-[.22em] text-[#c8ff55]">Analysis complete · AI 总结已生成</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="display text-balance mt-5 text-[clamp(3.3rem,13vw,10rem)] leading-[.84]">你是<br /><span data-testid="persona-code" className="text-[#ffd84d]">{persona.code}</span></motion.h1>
          <p className="display mt-6 text-2xl text-white sm:text-4xl">{persona.name}</p>
          <p className="mx-auto mt-3 w-fit rotate-[-1deg] rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-2 text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">代码翻译：{persona.codeMeaning}</p>
          <span data-testid="result-hash" className="sr-only">{resultHash}</span>
          <motion.div initial={{ scale: .4, rotate: -20 }} animate={{ scale: 1, rotate: 3 }} transition={{ type: "spring", delay: .15 }} className="mx-auto mt-8 h-48 w-48 overflow-hidden rounded-[2.25rem] border-2 border-[#17142f] bg-[#7657ff] shadow-[8px_8px_0_white] sm:h-56 sm:w-56">
            <Image key={persona.id} src={personaImageSrc(persona.id)} alt={`${persona.name} 几何动物人格形象`} width={768} height={768} priority unoptimized className="h-full w-full object-cover" />
          </motion.div>
          <p className="mx-auto mt-9 max-w-2xl text-balance text-xl font-bold leading-relaxed text-white/90 sm:text-2xl">{persona.tagline}</p>
        </div>
      </header>

      <div className="result-gradient relative mx-auto -mt-16 max-w-6xl rounded-[2rem] border-2 border-[#17142f] p-4 shadow-[0_20px_0_rgba(23,20,47,.12)] sm:-mt-24 sm:rounded-[3rem] sm:p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <section className="rounded-[2rem] border-2 border-[#17142f] bg-white p-6 sm:p-8">
            <span className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Your travel DNA</span>
            <PersonalityRadar scores={scores} />
            <p className="mx-auto max-w-sm text-center text-sm font-bold leading-relaxed text-black/55">形状比数字更诚实：哪里凸出去，哪里就是你旅行时最藏不住的人设。</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">{persona.traits.map((trait) => <span key={trait} className="rounded-full border-2 border-[#17142f] bg-[#eee9ff] px-3 py-1.5 text-sm font-black">#{trait}</span>)}</div>
          </section>

          <section className="flex flex-col rounded-[2rem] border-2 border-[#17142f] bg-[#c8ff55] p-6 sm:p-8">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><Sparkles className="text-[#7657ff]" /><h2 className="display text-3xl">AI 总结</h2></div>
              <span title="由本地规则按答题路径稳定生成" className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-black">⚡ 方案 {analysis.variant} · {analysis.strategy}</span>
            </div>
            <blockquote className="display text-balance text-3xl leading-tight sm:text-4xl">“{analysis.opening}”</blockquote>
            <p className="mt-6 text-lg font-bold leading-relaxed">{analysis.roast}</p>
            <div data-testid="persona-narrative" className="mt-6 rounded-2xl border-2 border-[#17142f] bg-[#fffdf7] p-5 shadow-[4px_4px_0_#7657ff] sm:p-6">
              <div className="space-y-4">
                {analysis.narrative.map((line, index) => (
                  <p key={`${line.text}-${index}`} className={line.emphasis ? "display text-balance text-2xl leading-tight text-[#5635c7]" : "font-bold leading-relaxed"}>{line.text}</p>
                ))}
              </div>
              <div className="mt-6 border-t-2 border-dashed border-[#17142f]/20 pt-4">
                <span className="text-xs font-black uppercase tracking-[.16em] text-black/55">代表台词</span>
                <p className="display mt-2 text-2xl">“{analysis.signatureLine}”</p>
              </div>
            </div>
            <div data-testid="travel-advice" className="mt-6 rounded-2xl border-2 border-[#17142f]/15 bg-white/60 p-5 font-bold leading-relaxed">
              <p><span className="mr-2 text-[#5635c7]">🧳 旅行建议</span>{analysis.travelAdvice}</p>
            </div>
          </section>
        </div>

        <section style={{ backgroundImage: world.color }} className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-[#17142f] bg-[#17142f] p-6 text-white sm:p-10">
          <div className="absolute inset-0 bg-[#17142f]/20" aria-hidden="true" />
          <div className="absolute right-5 top-2 text-[8rem] opacity-20 sm:text-[12rem]">{world.emoji}</div>
          {hiddenWorldScrews.map((screw) => (
            removedScrews.includes(screw.id) ? (
              <span
                key={screw.id}
                className={`absolute z-20 h-5 w-5 rounded-full border-2 border-white/25 bg-[#17142f]/45 shadow-inner ${screw.className}`}
                aria-hidden="true"
              />
            ) : (
              <button
                key={screw.id}
                type="button"
                onClick={() => removeHiddenWorldScrew(screw.id)}
                aria-label={`拧下${screw.label}`}
                data-testid={`hidden-world-screw-${screw.id}`}
                style={{ cursor: screwdriverCursor }}
                className={`focus-ring button-pop absolute z-20 grid h-5 w-5 place-items-center rounded-full border-2 border-[#e5e7eb] bg-[linear-gradient(145deg,#d1d5db,#8b929c)] shadow-[2px_2px_0_rgba(0,0,0,.35),inset_1px_1px_2px_rgba(255,255,255,.6)] hover:brightness-110 ${screw.className}`}
              >
                <span className="h-[5px] w-3 rounded-full bg-[#374151] shadow-[0_1px_0_rgba(255,255,255,.4)]" aria-hidden="true" />
              </button>
            )
          ))}
          <div className="relative max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-white">Theoretical destination · 理论目的地</p>
            <h2 className="display mt-3 text-balance text-5xl leading-none sm:text-7xl">{world.name}</h2>
            <p className="mt-6 text-lg font-bold leading-relaxed sm:text-xl">{analysis.worldReason}</p>
            <div className="mt-4 flex items-center gap-3">
              <p className="min-w-0 rotate-[-1deg] rounded-xl border-2 border-[#17142f] bg-[#fffdf7] px-4 py-3 font-black text-[#17142f] shadow-[4px_4px_0_#17142f]">{world.unavailable}</p>
              {world.id === "pokemon-world" && (
                <button type="button" data-testid="pokemon-world-entry" onClick={() => window.location.assign(pokemonUrl("world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 不试试，怎么知道？
                </button>
              )}
              {world.id === "grand-line" && (
                <button type="button" data-testid="grand-line-entry" onClick={() => window.location.assign(grandLineUrl("world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 海图有了，还不上船？
                </button>
              )}
              {world.id === "middle-earth" && (
                <button type="button" data-testid="middle-earth-entry" onClick={() => window.location.assign(middleEarthUrl("world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#d9f99d] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 门外，就是史诗
                </button>
              )}
              {world.id === "galactic-empire" && (
                <button type="button" data-testid="galactic-empire-entry" onClick={() => window.location.assign(themedWorldUrl("galactic-empire", "world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#67e8f9] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 下一站，按光年算
                </button>
              )}
              {world.id === "atlantis" && (
                <button type="button" data-testid="atlantis-entry" onClick={() => window.location.assign(themedWorldUrl("atlantis", "world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#67e8f9] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 下潜，去海底度假
                </button>
              )}
              {world.id === "disney-castle" && (
                <button type="button" data-testid="disney-castle-entry" onClick={() => window.location.assign(themedWorldUrl("disney-castle", "world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#f9a8d4] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 烟花前，进城堡
                </button>
              )}
              {world.id === "pandora" && (
                <button type="button" data-testid="pandora-entry" onClick={() => window.location.assign(themedWorldUrl("pandora", "world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#c084fc] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 地球之外，也能徒步
                </button>
              )}
              {world.id === "bikini-bottom" && (
                <button type="button" data-testid="bikini-bottom-entry" onClick={() => window.location.assign(themedWorldUrl("bikini-bottom", "world"))} className="button-pop focus-ring flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#17142f] bg-[#fde047] px-3 py-2 text-left text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <Sparkles size={16} /> 今天住进菠萝屋
                </button>
              )}
            </div>
          </div>
        </section>

        {showHogwarts && (
          <motion.section
            ref={hogwartsRef}
            data-testid="hogwarts-world"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 overflow-hidden rounded-[2rem] border-2 border-[#17142f] bg-[#120f28] text-white shadow-[0_14px_0_rgba(23,20,47,.14)]"
          >
            <div className="grid lg:grid-cols-[1.1fr_.9fr]">
              <div className="relative min-h-[25rem] overflow-hidden bg-[radial-gradient(circle_at_20%_18%,rgba(255,216,77,.95),transparent_7%),radial-gradient(circle_at_78%_12%,rgba(200,255,85,.45),transparent_10%),linear-gradient(145deg,#151236_0%,#312e81_45%,#064e3b_100%)] p-6 sm:p-8">
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#020617] to-transparent" />
                <div className="absolute left-8 top-8 rounded-full border-2 border-white/35 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-white backdrop-blur">Secret world unlocked</div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#06131f]" />
                <div className="absolute bottom-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-t-[5rem] border-2 border-white/20 bg-[#221b35] shadow-[0_0_40px_rgba(255,216,77,.25)] sm:w-96">
                  <div className="absolute -top-20 left-8 h-24 w-14 rounded-t-full border-2 border-white/20 bg-[#2f2545]" />
                  <div className="absolute -top-28 left-1/2 h-36 w-16 -translate-x-1/2 rounded-t-full border-2 border-white/20 bg-[#35294d]" />
                  <div className="absolute -top-16 right-8 h-20 w-14 rounded-t-full border-2 border-white/20 bg-[#2f2545]" />
                  <div className="absolute left-1/2 top-10 h-16 w-16 -translate-x-1/2 rounded-full border-2 border-[#ffd84d] bg-[#120f28] text-center text-4xl leading-[4rem] text-[#ffd84d]">H</div>
                </div>
                <div className="absolute bottom-24 left-6 right-6 h-10 rounded-[50%] border border-white/15 bg-[#0e7490]/35 blur-sm" />
                <div className="absolute bottom-7 left-8 right-8 flex items-end justify-between text-white/45">
                  <span className="h-10 w-1 rounded-full bg-white/35" />
                  <span className="h-16 w-1 rounded-full bg-white/30" />
                  <span className="h-12 w-1 rounded-full bg-white/40" />
                  <span className="h-20 w-1 rounded-full bg-white/25" />
                  <span className="h-14 w-1 rounded-full bg-white/35" />
                </div>
                <button onClick={generateHogwartsOrder} className="button-pop focus-ring absolute bottom-6 right-6 z-10 inline-flex items-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-5 py-3 font-black text-[#17142f] shadow-[4px_4px_0_white]">
                  <TrainFront size={18} /> 说走就走
                </button>
              </div>
              <div className="relative flex flex-col justify-center p-6 sm:p-10">
                <div className="absolute right-6 top-6 text-7xl opacity-20">🦉</div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#c8ff55]">Hidden theoretical destination</p>
                <h2 className="display mt-3 text-balance text-5xl leading-none sm:text-6xl">Hogwarts<br />霍格沃兹</h2>
                <p className="mt-6 text-lg font-bold leading-relaxed text-white/85">四枚螺丝全部拆下，隐藏路线正式显现。无论你属于哪一种旅行人格，都可以从 9 又 3/4 站台乘坐霍格沃兹特快列车，穿过黑湖进入城堡。</p>
                <div className="mt-6 grid gap-3 text-sm font-black sm:grid-cols-3">
                  <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3"><MapPin size={17} className="mb-2 text-[#ffd84d]" />入校交通</div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3"><Clock size={17} className="mb-2 text-[#ffd84d]" />全程约 9h45m</div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3"><Castle size={17} className="mb-2 text-[#ffd84d]" />目的地：城堡正门</div>
                </div>
              </div>
            </div>

            {showHogwartsOrder && (
              <motion.div
                data-testid="hogwarts-order"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-2 border-white/10 bg-[#fffdf7] p-6 text-[#17142f] sm:p-10"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Itinerary order · 入校行程订单</p>
                    <h3 className="display mt-2 text-balance text-4xl sm:text-5xl">霍格沃兹入校交通已生成</h3>
                    <p className="mt-3 max-w-2xl font-bold leading-relaxed text-black/65">订单号 {hogwartsOrderId}。所有时间为系统预估，用于娱乐展示；请按猫头鹰最终通知为准。</p>
                  </div>
                  <button
                    onClick={inspectHogwartsTickets}
                    className="group button-pop focus-ring inline-flex min-w-[9.5rem] items-center justify-center rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"
                    aria-label="3 张票待验，开始验票"
                  >
                    <span className="inline-flex items-center gap-2 group-hover:hidden"><ScrollText size={18} /> 3 张票待验</span>
                    <span className="hidden items-center gap-2 group-hover:inline-flex"><BadgeCheck size={18} /> 开始验票</span>
                  </button>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {hogwartsTickets.map(({ Icon, ...ticket }, index) => (
                    <article key={ticket.kind} className="relative flex min-h-[21rem] flex-col overflow-hidden rounded-2xl border-2 border-[#17142f] bg-white p-5 shadow-[5px_5px_0_#7657ff]">
                      <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-[#17142f] bg-[#fffdf7]" />
                      <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border-2 border-[#17142f] bg-[#fffdf7]" />
                      <div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#17142f]/20 pb-4">
                        <div>
                          <span className="text-xs font-black uppercase tracking-[.16em] text-black/50">Ticket 0{index + 1}</span>
                          <h4 className="display mt-1 text-3xl">{ticket.kind}</h4>
                        </div>
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

                {showHogwartsMap && (
                  <motion.div
                    ref={hogwartsMapRef}
                    data-testid="hogwarts-map"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 rounded-[2rem] border-2 border-[#17142f] bg-[#120f28] p-5 text-white shadow-[7px_7px_0_#17142f] sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.2em] text-[#c8ff55]">Map guide · 游玩地图攻略</p>
                        <h4 className="display mt-2 text-balance text-4xl sm:text-5xl">验票完成，开始城堡夜游</h4>
                        <p className="mt-3 max-w-2xl font-bold leading-relaxed text-white/70">路线已排好。每个点位都会带着订单号和探索者编号生成一张专属打卡图片。</p>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white/85">推荐路线：船屋 → 礼堂 → 移动楼梯 → 图书馆 → 天文塔</div>
                    </div>

                    <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)]">
                      <div className="relative min-h-[30rem] overflow-hidden rounded-2xl border-2 border-white/15 bg-[radial-gradient(circle_at_22%_76%,rgba(14,116,144,.55),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,216,77,.35),transparent_13%),linear-gradient(145deg,#17142f,#312e81_55%,#064e3b)] p-4">
                        <div className="absolute inset-x-8 top-1/2 h-1 -rotate-[22deg] rounded-full border-t-2 border-dashed border-[#ffd84d]/70" />
                        <div className="absolute inset-x-20 top-[38%] h-1 rotate-[14deg] rounded-full border-t-2 border-dashed border-[#ffd84d]/55" />
                        <div className="absolute bottom-7 left-6 rounded-full bg-[#0e7490]/45 px-4 py-2 text-xs font-black text-white/80">Black Lake</div>
                        <div className="absolute right-7 top-7 rounded-full bg-[#ffd84d] px-4 py-2 text-xs font-black text-[#17142f]">Astronomy View</div>
                        {hogwartsStops.map((stop, index) => (
                          <button
                            key={stop.id}
                            onClick={() => generateCheckInImage(stop.id)}
                            style={{ left: stop.x, top: stop.y }}
                            className="focus-ring button-pop absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                          >
                            <span className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-lg font-black shadow-[4px_4px_0_rgba(0,0,0,.35)] ${selectedHogwartsStopId === stop.id ? "bg-[#c8ff55] text-[#17142f]" : "bg-[#fffdf7] text-[#17142f]"}`}>{index + 1}</span>
                            <span className="rounded-full border border-white/25 bg-[#17142f]/80 px-3 py-1 text-xs font-black text-white backdrop-blur">{stop.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="rounded-2xl border-2 border-white/15 bg-[#fffdf7] p-4 text-[#17142f]">
                        {selectedHogwartsStop ? (
                          <>
                            <motion.div
                              key={selectedHogwartsStop.id}
                              data-testid="checkin-image"
                              initial={{ opacity: 0, scale: .97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              role="img"
                              aria-label={`${selectedHogwartsStop.name} 打卡图片`}
                              className="overflow-hidden rounded-[1.5rem] border-2 border-[#17142f] bg-white shadow-[5px_5px_0_#7657ff]"
                            >
                              <div style={{ backgroundImage: selectedHogwartsStop.color }} className="relative aspect-[4/5] min-h-[26rem] p-6 text-white">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,216,77,.95),transparent_8%),radial-gradient(circle_at_72%_32%,rgba(200,255,85,.4),transparent_12%)]" />
                                <div className="relative flex h-full flex-col">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-[.2em] text-white/75">Check-in image</p>
                                      <h5 className="display mt-2 text-balance text-5xl leading-none">{selectedHogwartsStop.name}</h5>
                                    </div>
                                    <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-[#ffd84d] text-[#17142f]"><Camera size={22} /></div>
                                  </div>
                                  <div className="mt-auto rounded-2xl border-2 border-white/35 bg-[#17142f]/45 p-4 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#c8ff55]">{selectedHogwartsStop.time} · {selectedHogwartsStop.stamp}</p>
                                    <p className="mt-3 text-xl font-black leading-tight">{selectedHogwartsStop.activity}</p>
                                    <p className="mt-4 text-sm font-bold leading-relaxed text-white/75">{selectedHogwartsStop.route}</p>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                                      <span className="rounded-full bg-white px-3 py-1 text-[#17142f]">{hogwartsOrderId}</span>
                                      <span className="rounded-full bg-[#c8ff55] px-3 py-1 text-[#17142f]">隐藏世界探索者</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                            <button onClick={finishHogwartsCheckIn} data-testid="return-reality" className="button-pop focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]">
                              <Plane size={18} /> 打卡结束，回到现实
                            </button>
                          </>
                        ) : (
                          <div className="grid min-h-[26rem] place-items-center rounded-[1.5rem] border-2 border-dashed border-[#17142f]/25 bg-[#f5f0ff] p-6 text-center">
                            <div>
                              <Camera className="mx-auto text-[#5635c7]" size={34} />
                              <h5 className="display mt-4 text-3xl">通行记录待盖章</h5>
                              <p className="mt-3 max-w-xs font-bold leading-relaxed text-black/55">打卡图片将在这里出现，带上点位时间、路线和订单编号。</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.section>
        )}

        <section id="reality" ref={realityRef} data-testid="reality-section" className="scroll-mt-4 mt-6 rounded-[2rem] border-2 border-[#17142f] bg-white p-6 sm:p-10">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#b51662]">Back to reality</p><h2 className="display mt-3 text-balance text-4xl sm:text-6xl">如果回到现实世界，<br />去这三个地方。</h2><p className="mt-4 font-bold text-black/70">梦想负责离谱，Skyscanner 负责把路线拉回地球。</p></div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {world.destinations.map((destination, index) => (
              <article key={destination.city} className="group flex flex-col rounded-2xl border-2 border-[#17142f] bg-[#f5f0ff] p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between"><span className="text-4xl">{destination.emoji}</span><span className="text-xs font-black text-black/65">0{index + 1}</span></div>
                <h3 className="display mt-5 text-3xl">{destination.city}</h3>
                <p className="text-sm font-black text-[#5635c7]">{destination.country}</p>
                <p className="mt-4 flex-1 font-bold leading-relaxed text-black/65">{analysis.destinationReasons[index] || `${destination.reason} ${destination.connection}`}</p>
                <a href={skyscannerUrl(destination.iata, pageLanguage)} target="_blank" rel="noreferrer" className="button-pop focus-ring mt-6 flex items-center justify-between rounded-xl border-2 border-[#17142f] bg-[#17142f] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_#7657ff]">{pageLanguage === "zh" ? `从中国飞往 ${destination.city}` : `UK to ${destination.city} flights`} <Plane size={17} /><span className="sr-only"> on Skyscanner</span></a>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-[#17142f]/25 pt-7 text-center sm:flex-row sm:text-left">
          <div><strong className="display text-xl">Travel Personality Indicator</strong><p className="text-sm font-bold text-black/65">没有标准答案，只有非常具体的旅行人设。</p></div>
          <div className="rounded-xl bg-[#17142f] px-4 py-2 text-xs font-black text-white">{persona.emoji} {persona.code} · {persona.name}</div>
        </footer>
      </div>

      <section className="mx-auto mt-14 max-w-4xl px-5 text-center">
        <h2 className="display text-3xl sm:text-4xl">这份结果不发出去，你会白忙活</h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button onClick={createPosterPreview} disabled={saving} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#c8ff55] px-5 py-4 font-black shadow-[5px_5px_0_#17142f]"><Download size={19} /> {saving ? "正在生成…" : "生成人格海报"}</button>
          <button onClick={shareResultLink} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-white px-5 py-4 font-black shadow-[5px_5px_0_#17142f]"><Link2 size={19} /> 分享结果链接</button>
          <button onClick={inviteFriend} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#ff4fa3] px-5 py-4 font-black text-[#17142f] shadow-[5px_5px_0_#17142f]"><Users size={19} /> 邀请朋友来测</button>
        </div>
        {status && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#17142f] px-4 py-2 text-sm font-black text-white"><Check size={15} /> {status}</motion.p>}
        <p className="mt-8 text-xs font-bold text-black/60">人格结果仅供娱乐。航班链接将跳转至 Skyscanner，价格与可用性以其页面为准。</p>
      </section>

      {posterPreview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-[#17142f]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="人格海报预览" onMouseDown={(event) => { if (event.target === event.currentTarget) setPosterPreview(null); }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative grid max-h-[94vh] w-full max-w-4xl gap-5 overflow-y-auto rounded-[2rem] border-2 border-[#17142f] bg-[#fffdf7] p-4 shadow-[10px_10px_0_#7657ff] sm:grid-cols-[minmax(0,1fr)_18rem] sm:p-6">
            <button onClick={() => setPosterPreview(null)} aria-label="关闭海报预览" className="focus-ring absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border-2 border-[#17142f] bg-white shadow-[3px_3px_0_#17142f]"><X size={20} /></button>
            <div className="overflow-hidden rounded-2xl border-2 border-[#17142f] bg-[#eee9ff]">
              <img src={posterPreview.url} alt={`${persona.code} 人格海报预览`} className="mx-auto max-h-[78vh] w-full object-contain" />
            </div>
            <div className="flex flex-col justify-center pt-2 text-left sm:pt-0">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Poster ready</p>
              <h2 className="display mt-2 text-4xl">海报生成好了</h2>
              <div className="mt-6 grid gap-3">
                <button onClick={sharePoster} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#ff4fa3] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Share2 size={18} /> 分享到社交软件</button>
                <button onClick={savePoster} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Download size={18} /> 保存图片</button>
                <button onClick={copyPosterLink} className="focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-white px-4 py-3 font-black"><Link2 size={18} /> 复制结果链接</button>
              </div>
              {posterStatus && <p role="status" className="mt-5 rounded-xl bg-[#17142f] px-4 py-3 text-center text-sm font-black text-white">{posterStatus}</p>}
              <p className="mt-5 text-xs font-bold leading-relaxed text-black/50">二维码邀请朋友从头测试，不会公开你的答题记录</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
