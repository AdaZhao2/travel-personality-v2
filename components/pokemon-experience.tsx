"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  Clock,
  Compass,
  Download,
  MapPin,
  Plane,
  ScrollText,
  Sparkles,
  Ticket,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPersona } from "@/data/catalog";
import { questions } from "@/lib/scoring";
import { createResultHash, decodeSharedResult, encodeSharedResult } from "@/lib/share";
import type { Answer, Persona, Scores } from "@/lib/types";

type Stage = "world" | "order" | "map" | "checkin";
type ParsedResult = { persona: Persona; scores: Scores; answerPath: string; resultHash: string };
type AdventureTicket = {
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
type AdventureStop = {
  id: string;
  name: string;
  pokemon: string;
  image: string;
  time: string;
  route: string;
  activity: string;
  stamp: string;
  x: string;
  y: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const tickets: AdventureTicket[] = [
  { kind: "世界传送票", service: "Professor Network · 世界入口", from: "现实世界", to: "真新镇研究所", depart: "08:08", arrive: "08:09", duration: "1 分钟", seat: "训练家编号 · FOMO-001", note: "抵达后领取图鉴与伙伴球，冒险路线会自动同步。", Icon: Sparkles },
  { kind: "地区列车票", service: "Kanto Rail · 关都冒险线", from: "真新镇", to: "常青森林 / 月见山", depart: "09:30", arrive: "12:20", duration: "2h50m", seat: "05 号车厢 · 靠窗位", note: "途中会在森林补给站短停，请随身带好图鉴。", Icon: TrainFront },
  { kind: "飞行通行证", service: "Pokémon Sky Route · 高原线", from: "华蓝海岸", to: "石英高原", depart: "16:40", arrive: "17:25", duration: "45 分钟", seat: "云端舷窗 · A07", note: "日落前抵达高原终点，完成今天最后一枚纪念章。", Icon: Plane },
];

const stops: AdventureStop[] = [
  { id: "research", name: "真新镇研究所", pokemon: "皮卡丘", image: "/pokemon-checkins/research-center.webp", time: "08:20", route: "从世界入口沿花园步道进入研究所前庭。", activity: "领取第一本训练家图鉴，和皮卡丘拍下正式出发照。", stamp: "TRAINER START", x: "14%", y: "75%" },
  { id: "forest", name: "常青森林", pokemon: "妙蛙种子", image: "/pokemon-checkins/viridian-forest.webp", time: "10:05", route: "从常青市北门进入发光苔藓小径，沿溪流前进。", activity: "和妙蛙种子寻找林间光斑，收下一张绿色冒险纪念照。", stamp: "FOREST FRIEND", x: "32%", y: "52%" },
  { id: "moon", name: "月见山晶洞", pokemon: "皮皮", image: "/pokemon-checkins/moon-mountain.webp", time: "12:45", route: "跟随蓝色晶石标记进入主洞穴，避开湿滑岔路。", activity: "在月光晶石旁遇见皮皮，把洞穴的秘密光芒带回去。", stamp: "MOONLIGHT FIND", x: "51%", y: "27%" },
  { id: "coast", name: "华蓝海岸", pokemon: "沼王", image: "/pokemon-checkins/cerulean-coast-quagsire.webp", time: "15:20", route: "从华蓝市沿海角木栈道前往灯塔与瀑布观景点。", activity: "和沼王一起踩进浪花里，拍下一张松弛又清爽的海岸到此一游。", stamp: "CERULEAN SPLASH", x: "70%", y: "48%" },
  { id: "plateau", name: "石英高原", pokemon: "喷火龙", image: "/pokemon-checkins/indigo-plateau.webp", time: "18:05", route: "乘高原线抵达终点，沿灯笼石阶登上日落平台。", activity: "和喷火龙一起看完落日，用终点合影为今天的冒险盖章。", stamp: "INDIGO FINISH", x: "86%", y: "17%" },
];

function decodeAnswerPath(path = ""): Answer[] {
  return questions.flatMap((question, index) => {
    const optionId = path[index];
    return question.options.some((option) => option.id === optionId) ? [{ questionId: question.id, optionId }] : [];
  });
}

function parseResult(): ParsedResult | null {
  const shared = new URLSearchParams(window.location.search).get("result");
  if (!shared) return null;
  try {
    const payload = decodeSharedResult(shared);
    const persona = getPersona(payload.p);
    const answerPath = payload.a ?? "";
    decodeAnswerPath(answerPath);
    return { persona, scores: payload.s, answerPath, resultHash: createResultHash(persona.id, payload.s, answerPath) };
  } catch {
    return null;
  }
}

function pathFor(path: string) {
  return `${basePath}${path}`;
}

export function PokemonExperience() {
  const [result, setResult] = useState<ParsedResult | null | undefined>(undefined);
  const [stage, setStage] = useState<Stage>("world");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState("");
  const orderRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const selectedStop = stops.find((stop) => stop.id === selectedStopId);

  useEffect(() => {
    const parsed = parseResult();
    setResult(parsed);
    const params = new URLSearchParams(window.location.search);
    const nextStage = params.get("stage");
    const restoredStage: Stage = nextStage === "order" || nextStage === "map" || nextStage === "checkin" ? nextStage : "world";
    const stopId = params.get("spot");
    setStage(restoredStage);
    setSelectedStopId(restoredStage === "checkin" && stopId && stops.some((stop) => stop.id === stopId) ? stopId : null);
  }, []);

  function resultUrl() {
    if (!result) return pathFor("/");
    const url = new URL(window.location.href);
    url.pathname = pathFor("/");
    url.search = "";
    url.searchParams.set("result", encodeSharedResult({ p: result.persona.id, s: result.scores, a: result.answerPath }));
    url.searchParams.set("focus", "reality");
    url.hash = "reality";
    return url.toString();
  }

  function adventureUrl(nextStage: Stage, stopId?: string | null) {
    if (!result) return window.location.href;
    const url = new URL(window.location.href);
    url.pathname = pathFor("/pokemon/");
    url.search = "";
    url.searchParams.set("result", encodeSharedResult({ p: result.persona.id, s: result.scores, a: result.answerPath }));
    url.searchParams.set("stage", nextStage);
    if (nextStage === "checkin" && stopId) url.searchParams.set("spot", stopId);
    url.hash = nextStage === "world" ? "pokemon-world" : nextStage === "order" ? "pokemon-order" : nextStage === "map" ? "pokemon-map" : "pokemon-checkin";
    return url.toString();
  }

  function updateStage(nextStage: Stage, stopId?: string | null) {
    setStage(nextStage);
    if (nextStage === "checkin") {
      setSelectedStopId(stopId ?? null);
      setImageStatus("");
    }
    window.history.pushState({}, "", adventureUrl(nextStage, stopId));
    window.requestAnimationFrame(() => {
      if (nextStage === "order") orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nextStage === "map" || nextStage === "checkin") mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function imageBlob(stop: AdventureStop) {
    const response = await fetch(pathFor(stop.image));
    if (!response.ok) throw new Error("image unavailable");
    return response.blob();
  }

  function filename(stop: AdventureStop) {
    return `pokemon-${stop.id}-${result?.persona.code ?? "trainer"}.webp`;
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function saveImage(stop: AdventureStop) {
    setImageStatus("正在保存打卡图片…");
    try {
      const blob = await imageBlob(stop);
      download(blob, filename(stop));
      setImageStatus(`${stop.name}打卡图片已保存`);
    } catch {
      setImageStatus("图片保存失败，请稍后重试");
    }
  }

  if (result === undefined) return <main className="min-h-screen bg-[#102542]" aria-hidden="true" />;
  if (result === null) {
    return <main className="grid min-h-screen place-items-center bg-[#102542] p-6 text-center text-white"><div className="max-w-md rounded-[2rem] border-2 border-white/20 bg-white/10 p-8"><h1 className="display text-4xl">世界入口失效</h1><p className="mt-4 font-bold text-white/70">需要先完成旅行人格测试，才能领取训练家冒险订单。</p><a href={pathFor("/")} className="button-pop focus-ring mt-6 inline-flex rounded-xl border-2 border-[#17142f] bg-[#ffe348] px-5 py-3 font-black text-[#17142f] shadow-[4px_4px_0_white]">回到测试首页</a></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#102542] pb-20 text-white">
      <div className="noise" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <button onClick={() => window.location.assign(resultUrl())} className="focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black backdrop-blur hover:bg-white hover:text-[#17142f]">← 返回现实世界</button>
        <span className="rounded-full border border-[#ffe348]/35 bg-[#ffe348]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em] text-[#ffe348]">{result.persona.code} · 世界通行证已激活</span>
      </header>

      <section data-testid="pokemon-world" className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-2 border-white/15 bg-[#102542] shadow-[0_18px_60px_rgba(0,0,0,.42)]">
        <div className="relative min-h-[44rem] overflow-hidden sm:min-h-[47rem]">
          <img src={pathFor("/pokemon-world-hero.webp")} alt="小女生和皮卡丘眺望宝可梦世界" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,25,47,.94)_0%,rgba(6,25,47,.68)_45%,rgba(6,25,47,.05)_80%),linear-gradient(0deg,rgba(6,25,47,.96)_0%,transparent_48%)]" />
          <div className="relative z-10 flex min-h-[44rem] flex-col justify-between p-6 sm:min-h-[47rem] sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#ffe348]/45 bg-[#102542]/65 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#ffe348] backdrop-blur"><Sparkles size={15} /> Pokémon World access granted</span><span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white/85 backdrop-blur">训练家编号已生成 · 今日限定路线</span></div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <p className="text-sm font-black tracking-[.18em] text-[#7ff2c6]">你刚刚证明了：想象力也能成为登机牌</p>
              <h1 className="display mt-3 text-balance text-6xl leading-[.9] sm:text-8xl lg:text-9xl">Pokémon<br /><span className="text-[#ffe348]">宝可梦世界</span></h1>
              <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-white/88 sm:text-xl">真新镇的研究所已经把图鉴登记在 <span className="text-[#ffe348]">{result.persona.code}</span> 名下。五位伙伴会在五个点位等你，每一次相遇都有一张专属到此一游。</p>
              <div className="mt-7 grid max-w-2xl gap-3 text-sm font-black sm:grid-cols-3"><div className="rounded-2xl border border-white/20 bg-[#102542]/60 p-4 backdrop-blur"><MapPin size={18} className="mb-3 text-[#ffe348]" /><span className="block text-white/50">冒险起点</span>真新镇研究所</div><div className="rounded-2xl border border-white/20 bg-[#102542]/60 p-4 backdrop-blur"><Clock size={18} className="mb-3 text-[#ffe348]" /><span className="block text-white/50">路线时长</span>一整天</div><div className="rounded-2xl border border-white/20 bg-[#102542]/60 p-4 backdrop-blur"><Camera size={18} className="mb-3 text-[#ffe348]" /><span className="block text-white/50">专属记录</span>5 张伙伴合影</div></div>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"><button onClick={() => updateStage("order")} className="button-pop focus-ring inline-flex items-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#ffe348] px-6 py-4 text-base font-black text-[#17142f] shadow-[5px_5px_0_white] sm:text-lg"><Ticket size={21} /> 领取你的训练家冒险订单</button><span className="text-xs font-bold text-white/60">3 张通行票与 5 站攻略已就绪</span></div>
            </motion.div>
          </div>
        </div>

        {(stage === "order" || stage === "map" || stage === "checkin") && (
          <motion.div ref={orderRef} data-testid="pokemon-order" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="scroll-mt-4 border-t-2 border-white/10 bg-[#fffdf7] p-6 text-[#17142f] sm:p-10">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#057a67]">Adventure order · 训练家订单</p><h2 className="display mt-2 text-balance text-4xl sm:text-5xl">宝可梦世界冒险订单已生成</h2><p className="mt-3 max-w-2xl font-bold leading-relaxed text-black/65">订单号 PK-{result.resultHash.replace("#TPI-", "")}。世界内时间与路线均为想象力系统预估。</p></div><button onClick={() => updateStage("map")} className="group button-pop focus-ring inline-flex min-w-[10rem] items-center justify-center rounded-xl border-2 border-[#17142f] bg-[#ffe348] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><span className="inline-flex items-center gap-2 group-hover:hidden"><ScrollText size={18} /> 3 张票待验</span><span className="hidden items-center gap-2 group-hover:inline-flex"><BadgeCheck size={18} /> 打开冒险攻略</span></button></div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {tickets.map(({ Icon, ...ticket }, index) => <article key={ticket.kind} className="relative flex min-h-[21rem] flex-col overflow-hidden rounded-2xl border-2 border-[#17142f] bg-white p-5 shadow-[5px_5px_0_#2fc9a3]"><div className="flex items-start justify-between gap-3 border-b-2 border-dashed border-[#17142f]/20 pb-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/50">PASS 0{index + 1}</span><h3 className="display mt-1 text-3xl">{ticket.kind}</h3></div><div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#17142f] bg-[#ffe348]"><Icon size={22} /></div></div><p className="mt-4 text-sm font-black text-[#057a67]">{ticket.service}</p><div className="mt-5 grid gap-4"><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">From</span><p className="mt-1 font-black leading-tight">{ticket.from}</p></div><div><span className="text-xs font-black uppercase tracking-[.16em] text-black/45">To</span><p className="mt-1 font-black leading-tight">{ticket.to}</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#eafaf5] p-3 text-center"><div><span className="text-[10px] font-black text-black/45">出发</span><p className="font-black">{ticket.depart}</p></div><div><span className="text-[10px] font-black text-black/45">抵达</span><p className="font-black">{ticket.arrive}</p></div><div><span className="text-[10px] font-black text-black/45">时长</span><p className="font-black">{ticket.duration}</p></div></div><p className="mt-4 text-sm font-bold text-black/65">{ticket.seat}</p><p className="mt-auto pt-4 text-sm font-bold leading-relaxed text-black/55">{ticket.note}</p></article>)}
            </div>

            {(stage === "map" || stage === "checkin") && (
              <motion.div ref={mapRef} data-testid="pokemon-map" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-[2rem] border-2 border-[#17142f] bg-[#102542] p-5 text-white shadow-[7px_7px_0_#17142f] sm:p-7">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.2em] text-[#7ff2c6]">Trainer guide · 冒险攻略</p><h2 className="display mt-2 whitespace-nowrap text-lg sm:text-3xl lg:text-4xl xl:text-[2.5rem]">验票完成，伙伴们在前方等你</h2><p className="mt-3 max-w-2xl font-bold leading-relaxed text-white/70">点击地图点位生成完整打卡图片；每一站都会遇见不同的宝可梦伙伴。</p></div><div className="w-full overflow-x-auto whitespace-nowrap rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[11px] font-black text-white/85 sm:text-sm xl:w-auto xl:min-w-[30rem] xl:text-center">推荐路线：真新镇 → 常青森林 → 月见山 → 华蓝海岸 → 石英高原</div></div>
                <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,.82fr)_minmax(22rem,1.18fr)]">
                  <div className="space-y-5">
                    <div className="relative aspect-square min-h-[26rem] overflow-hidden rounded-2xl border-2 border-white/15"><img src={pathFor("/world-maps/pokemon.webp")} alt="宝可梦世界五站冒险路线地图" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/10" />{stops.map((stop, index) => <button key={stop.id} onClick={() => updateStage("checkin", stop.id)} style={{ left: stop.x, top: stop.y }} className="focus-ring button-pop absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"><span className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-lg font-black shadow-[4px_4px_0_rgba(0,0,0,.35)] ${selectedStopId === stop.id ? "bg-[#ffe348] text-[#17142f]" : "bg-white text-[#17142f]"}`}>{index + 1}</span><span className="rounded-full border border-white/25 bg-[#102542]/85 px-3 py-1 text-xs font-black backdrop-blur">{stop.name}</span></button>)}</div>
                    {selectedStop && <motion.div key={selectedStop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-white/15 bg-white/10 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#7ff2c6]">Check-in record</p><h3 className="display mt-2 text-4xl">{selectedStop.name}</h3><p className="mt-2 font-black text-[#ffe348]">本次同行：{selectedStop.pokemon}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white bg-[#ffe348] text-[#17142f]"><Camera size={22} /></div></div><p className="mt-5 text-xs font-black uppercase tracking-[.16em] text-[#ffe348]">{selectedStop.time} · {selectedStop.stamp}</p><p className="mt-3 text-xl font-black leading-tight">{selectedStop.activity}</p><p className="mt-4 text-sm font-bold leading-relaxed text-white/70">{selectedStop.route}</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-black"><span className="rounded-full bg-white px-3 py-1 text-[#17142f]">PK-{result.resultHash.replace("#TPI-", "")}</span><span className="rounded-full bg-[#7ff2c6] px-3 py-1 text-[#17142f]">{result.persona.code} 训练家</span></div></motion.div>}
                  </div>
                  <div className="rounded-2xl border-2 border-white/15 bg-[#fffdf7] p-4 text-[#17142f]">
                    {selectedStop ? <><motion.div key={selectedStop.id} data-testid="pokemon-checkin-image" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} role="img" aria-label={`${selectedStop.name}打卡图片`} className="overflow-hidden rounded-[1.5rem] border-2 border-[#17142f] bg-[#17142f] shadow-[5px_5px_0_#2fc9a3]"><img src={pathFor(selectedStop.image)} alt={`小女生与${selectedStop.pokemon}在${selectedStop.name}的到此一游照片`} className="block h-auto w-full object-contain" /></motion.div><div className="mt-4 grid grid-cols-[.78fr_1.22fr] gap-3"><button onClick={() => saveImage(selectedStop)} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#ffe348] px-3 py-3 font-black shadow-[4px_4px_0_#17142f]"><Download size={18} /> 保存图片</button><button onClick={() => window.location.assign(resultUrl())} data-testid="pokemon-return-reality" className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#7ff2c6] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Compass size={18} /> 冒险收好，回到现实</button></div>{imageStatus && <p role="status" className="mt-3 rounded-xl bg-[#17142f] px-4 py-3 text-center text-sm font-black text-white">{imageStatus}</p>}</> : <div className="grid min-h-[26rem] place-items-center rounded-[1.5rem] border-2 border-dashed border-[#17142f]/25 bg-[#eafaf5] p-6 text-center"><div><Camera className="mx-auto text-[#057a67]" size={34} /><h3 className="display mt-4 text-3xl">选择第一位同行伙伴</h3><p className="mt-3 max-w-xs font-bold leading-relaxed text-black/55">点击左侧地图点位，完整打卡照片会在这里出现。</p></div></div>}
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
