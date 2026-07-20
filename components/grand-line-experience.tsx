"use client";

import { motion } from "framer-motion";
import {
  Anchor,
  BadgeCheck,
  Camera,
  Cloud,
  Compass,
  Download,
  MapPin,
  ScrollText,
  Ship,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPersona } from "@/data/catalog";
import { createResultHash, decodeSharedResult, encodeSharedResult } from "@/lib/share";
import type { Persona, Scores } from "@/lib/types";

type Stage = "world" | "order" | "map" | "checkin";
type ParsedResult = { persona: Persona; scores: Scores; answerPath: string; resultHash: string };
type VoyageTicket = { kind: string; service: string; from: string; to: string; depart: string; arrive: string; duration: string; cabin: string; note: string; Icon: LucideIcon };
type VoyageStop = { id: string; name: string; character: string; image: string; time: string; route: string; activity: string; stamp: string; x: string; y: string };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pathFor = (path: string) => `${basePath}${path}`;

const tickets: VoyageTicket[] = [
  { kind: "出航许可", service: "Grand Line Passage · 伟大航路入口", from: "东海罗格镇港口", to: "颠倒山双子岬", depart: "06:40", arrive: "08:10", duration: "1h30m", cabin: "前甲板观浪位 · GL-01", note: "请在海流转向前登船，沿上升水道一次通过红土大陆。", Icon: Ship },
  { kind: "记录指针", service: "Log Pose Route · 岛屿磁力航线", from: "双子岬", to: "威士忌山峰 / 小花园", depart: "09:00", arrive: "14:20", duration: "5h20m", cabin: "主桅右舷 · 指针观察席", note: "普通指南针将在伟大航路失效，请等待记录指针稳定后再离港。", Icon: Compass },
  { kind: "冲天海流票", service: "Knock Up Stream · 空岛航线", from: "阿拉巴斯坦外海", to: "空岛云港", depart: "17:10", arrive: "17:17", duration: "7 分钟", cabin: "加固甲板 · 云海观景位", note: "上升期间抓紧固定绳，穿过积帝云后即可抵达白白海。", Icon: Cloud },
];

const stops: VoyageStop[] = [
  { id: "reverse-mountain", name: "颠倒山·双子岬", character: "路飞", image: "/grand-line-checkins/reverse-mountain.webp", time: "08:15", route: "沿上升海流越过红土大陆，在灯塔前的双子岬靠岸。", activity: "和拉布隔海举拳约定，把伟大航路的第一声欢呼留在这里。", stamp: "GRAND LINE START", x: "13%", y: "76%" },
  { id: "whisky-peak", name: "威士忌山峰", character: "索隆", image: "/grand-line-checkins/whisky-peak.webp", time: "11:40", route: "记录指针稳定后向西南航行，看到仙人掌形山峰即可入港。", activity: "在星空与灯火之间记住来路——至少这一次，索隆没有走错。", stamp: "CACTUS NIGHT", x: "32%", y: "51%" },
  { id: "little-garden", name: "小花园", character: "娜美", image: "/grand-line-checkins/little-garden.webp", time: "14:35", route: "从河口进入史前密林，沿火山烟柱方向登上安全观察岭。", activity: "隔着整片原始丛林确认天气，让恐龙成为这张航海日志的背景。", stamp: "ANCIENT ISLAND", x: "51%", y: "27%" },
  { id: "alabasta", name: "阿拉巴斯坦", character: "罗宾", image: "/grand-line-checkins/alabasta.webp", time: "16:25", route: "穿过绿洲水道进入王都，从宫殿西侧石阶登上古迹露台。", activity: "俯瞰沙漠王国与遗迹，让罗宾为这段历史留下一张安静的注脚。", stamp: "DESERT ARCHIVE", x: "70%", y: "49%" },
  { id: "skypiea", name: "空岛·白白海", character: "香吉士", image: "/grand-line-checkins/skypiea.webp", time: "17:25", route: "搭乘冲天海流穿过积帝云，在云港下船后沿巨藤前往黄金钟。", activity: "站在云海尽头看落日，让香吉士用最从容的背影完成航程收尾。", stamp: "SKY ARRIVAL", x: "87%", y: "17%" },
];

function parseResult(): ParsedResult | null {
  const shared = new URLSearchParams(window.location.search).get("result");
  if (!shared) return null;
  try {
    const payload = decodeSharedResult(shared);
    const persona = getPersona(payload.p);
    const answerPath = payload.a ?? "";
    return { persona, scores: payload.s, answerPath, resultHash: createResultHash(persona.id, payload.s, answerPath) };
  } catch {
    return null;
  }
}

export function GrandLineExperience() {
  const [result, setResult] = useState<ParsedResult | null | undefined>(undefined);
  const [stage, setStage] = useState<Stage>("world");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState("");
  const orderRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const selected = stops.find((stop) => stop.id === selectedId);

  useEffect(() => {
    setResult(parseResult());
    const params = new URLSearchParams(window.location.search);
    const value = params.get("stage");
    const restored: Stage = value === "order" || value === "map" || value === "checkin" ? value : "world";
    const spot = params.get("spot");
    setStage(restored);
    setSelectedId(restored === "checkin" && spot && stops.some((stop) => stop.id === spot) ? spot : null);
  }, []);

  function encodedResult() {
    if (!result) return "";
    return encodeSharedResult({ p: result.persona.id, s: result.scores, a: result.answerPath });
  }

  function resultUrl() {
    const url = new URL(window.location.href);
    url.pathname = pathFor("/");
    url.search = "";
    url.searchParams.set("result", encodedResult());
    url.searchParams.set("focus", "reality");
    url.hash = "reality";
    return url.toString();
  }

  function voyageUrl(next: Stage, spot?: string | null) {
    const url = new URL(window.location.href);
    url.pathname = pathFor("/grand-line/");
    url.search = "";
    url.searchParams.set("result", encodedResult());
    url.searchParams.set("stage", next);
    if (next === "checkin" && spot) url.searchParams.set("spot", spot);
    url.hash = next === "world" ? "grand-line-world" : next === "order" ? "grand-line-order" : next === "map" ? "grand-line-map" : "grand-line-checkin";
    return url.toString();
  }

  function updateStage(next: Stage, spot?: string | null) {
    setStage(next);
    if (next === "checkin") {
      setSelectedId(spot ?? null);
      setImageStatus("");
    }
    window.history.pushState({}, "", voyageUrl(next, spot));
    window.requestAnimationFrame(() => {
      if (next === "order") orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (next === "map" || next === "checkin") mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function filename(stop: VoyageStop) {
    return `grand-line-${stop.id}-${result?.persona.code ?? "voyager"}.webp`;
  }

  async function loadImage(stop: VoyageStop) {
    const response = await fetch(pathFor(stop.image));
    if (!response.ok) throw new Error("image unavailable");
    return response.blob();
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function saveImage(stop: VoyageStop) {
    setImageStatus("正在保存打卡图片…");
    try {
      const blob = await loadImage(stop);
      download(blob, filename(stop));
      setImageStatus(`${stop.name}打卡图片已保存`);
    } catch {
      setImageStatus("图片保存失败，请稍后重试");
    }
  }

  if (result === undefined) return <main className="min-h-screen bg-[#071b35]" aria-hidden="true" />;
  if (result === null) return <main className="grid min-h-screen place-items-center bg-[#071b35] p-6 text-center text-white"><div className="max-w-md rounded-[2rem] border-2 border-white/20 bg-white/10 p-8"><h1 className="display text-4xl">航海入口失效</h1><p className="mt-4 font-bold text-white/70">需要先完成旅行人格测试，才能领取伟大航路订单。</p><a href={pathFor("/")} className="button-pop focus-ring mt-6 inline-flex rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-5 py-3 font-black text-[#17142f] shadow-[4px_4px_0_white]">回到测试首页</a></div></main>;

  return (
    <main className="min-h-screen bg-[#071b35] pb-20 text-white">
      <div className="noise" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><button onClick={() => window.location.assign(resultUrl())} className="focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur hover:bg-white hover:text-[#17142f]">← 返回现实世界</button><span className="rounded-full border border-[#ffd84d]/35 bg-[#ffd84d]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em] text-[#ffd84d]">{result.persona.code} · 航海许可已签发</span></header>

      <section data-testid="grand-line-world" className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-white/15 bg-[#071b35] shadow-[0_18px_60px_rgba(0,0,0,.45)]">
        <div className="relative min-h-[44rem] overflow-hidden sm:min-h-[47rem]"><img src={pathFor("/grand-line-hero.webp")} alt="草帽一伙背对镜头乘船驶向颠倒山" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,38,.95)_0%,rgba(4,18,38,.68)_43%,rgba(4,18,38,.05)_78%),linear-gradient(0deg,rgba(4,18,38,.96)_0%,transparent_48%)]" />
          <div className="relative z-10 flex min-h-[44rem] flex-col justify-between p-6 sm:min-h-[47rem] sm:p-10 lg:p-12"><div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#ffd84d]/45 bg-[#071b35]/65 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#ffd84d] backdrop-blur"><Sparkles size={15} /> Grand Line passage granted</span><span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white/85 backdrop-blur">记录指针已校准 · 今日可以出航</span></div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl"><p className="text-sm font-black tracking-[.18em] text-[#72e4ff]">海图只负责指路，传奇得由你亲自登船</p><h1 className="display mt-3 text-balance text-6xl leading-[.9] sm:text-8xl lg:text-9xl">Grand Line<br /><span className="text-[#ffd84d]">伟大航路</span></h1><p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-white/88 sm:text-xl">从颠倒山的逆流出发，穿过史前丛林、沙漠王国，最后让船冲上云海。五个点位已经有人替你踩过，接下来轮到 <span className="text-[#ffd84d]">{result.persona.code}</span> 上船。</p>
              <div className="mt-7 grid max-w-2xl gap-3 text-sm font-black sm:grid-cols-3"><div className="rounded-2xl border border-white/20 bg-[#071b35]/60 p-4 backdrop-blur"><MapPin size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">起航点</span>颠倒山·双子岬</div><div className="rounded-2xl border border-white/20 bg-[#071b35]/60 p-4 backdrop-blur"><Waves size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">航线难度</span>方向不讲道理</div><div className="rounded-2xl border border-white/20 bg-[#071b35]/60 p-4 backdrop-blur"><Camera size={18} className="mb-3 text-[#ffd84d]" /><span className="block text-white/50">航海记录</span>5 张角色背影照</div></div>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"><button onClick={() => updateStage("order")} className="button-pop focus-ring inline-flex items-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#ffd84d] px-6 py-4 text-base font-black text-[#17142f] shadow-[5px_5px_0_white] sm:text-lg"><Ship size={21} /> 领取伟大航路出航订单</button><span className="text-xs font-bold text-white/60">3 张航海凭证与 5 站攻略已就绪</span></div></motion.div>
          </div>
        </div>

        {(stage === "order" || stage === "map" || stage === "checkin") && <motion.div ref={orderRef} data-testid="grand-line-order" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-4 border-t-2 border-white/10 bg-[#fffdf7] p-6 text-[#17142f] sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#08799c]">Voyage order · 航海订单</p><h2 className="display mt-2 text-balance text-4xl sm:text-5xl">伟大航路出航订单已生成</h2><p className="mt-3 max-w-2xl font-bold leading-relaxed text-black/65">订单号 GL-{result.resultHash.replace("#TPI-", "")}。天气、磁场和海流仅供娱乐展示，船长拥有最终改道权。</p></div><button onClick={() => updateStage("map")} className="group button-pop focus-ring inline-flex min-w-[10rem] items-center justify-center rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><span className="inline-flex items-center gap-2 group-hover:hidden"><ScrollText size={18} /> 3 张凭证待验</span><span className="hidden items-center gap-2 group-hover:inline-flex"><BadgeCheck size={18} /> 打开航海攻略</span></button></div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">{tickets.map(({ Icon, ...ticket }, index) => <article key={ticket.kind} className="relative flex min-h-[21rem] flex-col overflow-hidden rounded-2xl border-2 border-[#17142f] bg-white p-5 shadow-[5px_5px_0_#32b9df]"><div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#17142f]/20 pb-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/50">PASS 0{index + 1}</span><h3 className="display mt-1 text-3xl">{ticket.kind}</h3></div><div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#17142f] bg-[#ffd84d]"><Icon size={22} /></div></div><p className="mt-4 text-sm font-black text-[#08799c]">{ticket.service}</p><div className="mt-5 grid gap-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">From</span><p className="mt-1 font-black leading-tight">{ticket.from}</p></div><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">To</span><p className="mt-1 font-black leading-tight">{ticket.to}</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#eaf7fb] p-3 text-center"><div><span className="text-[10px] font-black text-black/45">出发</span><p className="font-black">{ticket.depart}</p></div><div><span className="text-[10px] font-black text-black/45">抵达</span><p className="font-black">{ticket.arrive}</p></div><div><span className="text-[10px] font-black text-black/45">时长</span><p className="font-black">{ticket.duration}</p></div></div><p className="mt-4 text-sm font-bold text-black/65">{ticket.cabin}</p><p className="mt-auto pt-4 text-sm font-bold leading-relaxed text-black/55">{ticket.note}</p></article>)}</div>

          {(stage === "map" || stage === "checkin") && <motion.div ref={mapRef} data-testid="grand-line-map" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-[2rem] border-2 border-[#17142f] bg-[#071b35] p-5 text-white shadow-[7px_7px_0_#17142f] sm:p-7"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#72e4ff]">Log pose guide · 航海攻略</p><h2 className="display mt-2 text-balance text-4xl sm:text-5xl">凭证确认，记录指针开始转动</h2><p className="mt-3 max-w-2xl font-bold leading-relaxed text-white/70">点击点位查看完整背影打卡图；五位角色各自守在航线的一站。</p></div><div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white/85">推荐航线：颠倒山 → 威士忌山峰 → 小花园 → 阿拉巴斯坦 → 空岛</div></div>
            <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,.82fr)_minmax(22rem,1.18fr)]"><div className="space-y-5"><div className="relative aspect-square min-h-[26rem] overflow-hidden rounded-2xl border-2 border-white/15"><img src={pathFor("/world-maps/grand-line.webp")} alt="伟大航路五站航海路线地图" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/10" />{stops.map((stop, index) => <button key={stop.id} onClick={() => updateStage("checkin", stop.id)} style={{ left: stop.x, top: stop.y }} className="focus-ring button-pop absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"><span className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-lg font-black shadow-[4px_4px_0_rgba(0,0,0,.35)] ${selectedId === stop.id ? "bg-[#ffd84d] text-[#17142f]" : "bg-white text-[#17142f]"}`}>{index + 1}</span><span className="rounded-full border border-white/25 bg-[#071b35]/85 px-3 py-1 text-xs font-black backdrop-blur">{stop.name}</span></button>)}</div>
              {selected && <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-white/15 bg-white/10 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#72e4ff]">Voyage check-in</p><h3 className="display mt-2 text-4xl">{selected.name}</h3><p className="mt-2 font-black text-[#ffd84d]">本次同行：{selected.character}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white bg-[#ffd84d] text-[#17142f]"><Camera size={22} /></div></div><p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#ffd84d]">{selected.time} · {selected.stamp}</p><p className="mt-3 text-xl font-black leading-tight">{selected.activity}</p><p className="mt-4 text-sm font-bold leading-relaxed text-white/70">{selected.route}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-white px-3 py-1 text-[#17142f]">GL-{result.resultHash.replace("#TPI-", "")}</span><span className="rounded-full bg-[#72e4ff] px-3 py-1 text-[#17142f]">{result.persona.code} 航海日志</span></div></motion.div>}</div>
              <div className="rounded-2xl border-2 border-white/15 bg-[#fffdf7] p-4 text-[#17142f]">{selected ? <><motion.div key={selected.id} data-testid="grand-line-checkin-image" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} role="img" aria-label={`${selected.name}打卡图片`} className="overflow-hidden rounded-[1.5rem] border-2 border-[#17142f] bg-[#17142f] shadow-[5px_5px_0_#32b9df]"><img src={pathFor(selected.image)} alt={`${selected.character}在${selected.name}的背影到此一游照片`} className="block h-auto w-full object-contain" /></motion.div><div className="mt-4 grid grid-cols-[.78fr_1.22fr] gap-3"><button onClick={() => saveImage(selected)} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#ffd84d] px-3 py-3 font-black shadow-[4px_4px_0_#17142f]"><Download size={18} /> 保存图片</button><button onClick={() => window.location.assign(resultUrl())} data-testid="grand-line-return-reality" className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#72e4ff] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Anchor size={18} /> 航海日志收好，返回现实</button></div>{imageStatus && <p role="status" className="mt-3 rounded-xl bg-[#17142f] px-4 py-3 text-center text-sm font-black text-white">{imageStatus}</p>}</> : <div className="grid min-h-[26rem] place-items-center rounded-[1.5rem] border-2 border-dashed border-[#17142f]/25 bg-[#eaf7fb] p-6 text-center"><div><Camera className="mx-auto text-[#08799c]" size={34} /><h3 className="display mt-4 text-3xl">选择第一处登陆点</h3><p className="mt-3 max-w-xs font-bold leading-relaxed text-black/55">点击左侧航线点位，角色完整背影打卡图会在这里出现。</p></div></div>}</div></div>
          </motion.div>}
        </motion.div>}
      </section>
    </main>
  );
}
