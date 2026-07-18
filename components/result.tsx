"use client";

import { motion } from "framer-motion";
import { Check, Download, Link2, Plane, RotateCcw, Share2, Sparkles, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PersonalityRadar } from "@/components/personality-radar";
import { FriendMatch } from "@/components/friend-match";
import { personaImageSrc } from "@/lib/persona-image";
import { trackAnalytics } from "@/lib/analytics";
import { encodeFriendSnapshot, type FriendSnapshot } from "@/lib/friend-match";
import { generatePersonalityPoster } from "@/lib/poster";
import { skyscannerUrl, type TravelLanguage } from "@/lib/scoring";
import { cleanPageUrl, copyText, createResultHash, encodeSharedResult } from "@/lib/share";
import type { Analysis, Answer, Persona, Scores, World } from "@/lib/types";
import { LanguageToggle } from "@/components/language-toggle";
import type { Language } from "@/lib/i18n";

type Props = {
  persona: Persona;
  world: World;
  scores: Scores;
  analysis: Analysis;
  answers: Answer[];
  attemptId: string | null;
  friendSnapshot: FriendSnapshot | null;
  onRestart: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
};

type PosterPreview = { blob: Blob; url: string; filename: string };

export function Result({ persona, world, scores, analysis, answers, attemptId, friendSnapshot, onRestart, language, onLanguageChange }: Props) {
  const en = language === "en";
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const posterTriggerRef = useRef<HTMLButtonElement>(null);
  const posterDialogRef = useRef<HTMLDivElement>(null);
  const posterCloseRef = useRef<HTMLButtonElement>(null);
  const [posterPreview, setPosterPreview] = useState<PosterPreview | null>(null);
  const [posterStatus, setPosterStatus] = useState("");
  const answerPath = answers.map((answer) => answer.optionId).join("");
  const resultHash = createResultHash(persona.id, scores, answerPath);

  useEffect(() => {
    window.history.replaceState({}, "", resultUrl());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!posterPreview) return;
    const previousOverflow = document.body.style.overflow;
    const fallbackFocus = posterTriggerRef.current;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    posterCloseRef.current?.focus();
    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPosterPreview(null);
        return;
      }
      if (event.key !== "Tab" || !posterDialogRef.current) return;
      const focusable = [...posterDialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeyboard);
    return () => {
      window.removeEventListener("keydown", handleDialogKeyboard);
      document.body.style.overflow = previousOverflow;
      URL.revokeObjectURL(posterPreview.url);
      (previouslyFocused ?? fallbackFocus)?.focus();
    };
  }, [posterPreview]);

  function resultUrl() {
    const url = cleanPageUrl();
    url.searchParams.set("result", encodeSharedResult({ p: persona.id, s: scores, a: answerPath }));
    if (friendSnapshot) url.searchParams.set("match", encodeFriendSnapshot(friendSnapshot));
    if (en) url.searchParams.set("lang", "en");
    url.hash = resultHash.slice(1);
    return url.toString();
  }

  function inviteUrl() {
    const url = cleanPageUrl();
    url.searchParams.set("from", persona.id);
    url.searchParams.set("match", encodeFriendSnapshot({ p: persona.id, s: scores }));
    if (en) url.searchParams.set("lang", "en");
    return url.toString();
  }

  function recordShare(shareChannel: "result_link" | "invite_link" | "poster" | "poster_download") {
    trackAnalytics({ eventType: "result_shared", attemptId, personaId: persona.id, shareChannel });
  }

  async function shareResultLink() {
    const url = resultUrl();
    const shareData = {
      title: en ? `My travel personality is ${persona.code}` : `我的旅行人格是 ${persona.code}`,
      text: en ? `I’ve been professionally exposed as “${persona.code} · ${persona.name}” ${persona.emoji}. Unfortunately, it’s accurate.` : `毒舌测试说我是「${persona.code} · ${persona.name}」${persona.emoji}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        recordShare("result_link");
        setStatus(en ? "Result link shared" : "结果链接已分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus(en ? "Sharing cancelled" : "已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(url);
      recordShare("result_link");
      setStatus(en ? "Result link copied" : "结果链接已复制，可直接粘贴打开");
    } catch {
      setStatus(en ? "Copy failed. Please copy the browser address." : "复制失败，请从浏览器地址栏复制链接");
    }
  }

  async function inviteFriend() {
    const text = en ? `AI exposed me as “${persona.code} · ${persona.name}” ${persona.emoji}. Your turn—let’s see if we should ever travel together:` : `AI测试说我是「${persona.code} · ${persona.name}」${persona.emoji}。现在轮到你暴露旅行人设了：`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Travel Personality Indicator", text, url: inviteUrl() });
        recordShare("invite_link");
        setStatus(en ? "Invitation shared" : "邀请链接已分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus(en ? "Sharing cancelled" : "已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(`${text}\n${inviteUrl()}`);
      recordShare("invite_link");
      setStatus(en ? "Invitation copied" : "邀请文案已复制");
    } catch {
      setStatus(en ? "Copy failed. Please copy the browser address." : "复制失败，请从浏览器地址栏复制链接");
    }
  }

  async function createPosterPreview() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const blob = await generatePersonalityPoster({ persona, world, scores, analysis, inviteUrl: inviteUrl(), resultHash, language });
      const filename = `travel-personality-${persona.code.toLowerCase()}-${persona.id}.png`;
      setPosterStatus("");
      setPosterPreview({ blob, filename, url: URL.createObjectURL(blob) });
      setStatus(en ? "Your poster is ready to preview or share" : "人格海报已生成，可以预览或分享");
    } catch {
      setStatus(en ? "Poster generation failed. Please try again." : "海报生成失败，请重试");
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
    recordShare("poster_download");
    setPosterStatus(en ? "Image saved" : "图片已保存");
  }

  async function sharePoster() {
    if (!posterPreview) return;
    const file = new File([posterPreview.blob], posterPreview.filename, { type: "image/png" });
    // A file-only payload avoids duplicate image representations in desktop clipboards.
    const shareData: ShareData = { files: [file] };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        recordShare("poster");
        setPosterStatus(en ? "System share opened" : "已打开系统分享");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setPosterStatus(en ? "Sharing cancelled" : "已取消分享");
          return;
        }
      }
    }
    try {
      await copyText(resultUrl());
      recordShare("poster");
      setPosterStatus(en ? "Image sharing is unavailable; result link copied" : "当前浏览器不支持图片直分享，结果链接已复制");
    } catch {
      setPosterStatus(en ? "Image sharing is unavailable; please save it first" : "当前浏览器不支持图片直分享，请先保存图片");
    }
  }

  async function copyPosterLink() {
    try {
      await copyText(resultUrl());
      recordShare("result_link");
      setPosterStatus(en ? "Result link copied" : "结果链接已复制");
    } catch {
      setPosterStatus(en ? "Copy failed. Please copy the browser address." : "复制失败，请从浏览器地址栏复制链接");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0ff] pb-24">
      <div className="noise" />
      <header className="relative overflow-hidden bg-[#17142f] px-5 pb-28 pt-8 text-white sm:px-10 sm:pb-40">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#7657ff] blur-2xl" />
        <div className="absolute -bottom-44 -left-20 h-96 w-96 rounded-full bg-[#ff4fa3] blur-3xl opacity-70" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between">
          <button onClick={onRestart} className="focus-ring flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-black text-[#17142f] hover:bg-[#c8ff55]"><RotateCcw size={16} /> {en ? "Try again" : "再测一次"}</button>
          <LanguageToggle language={language} onChange={onLanguageChange} inverted />
          <span data-testid="result-edition" className="hidden text-xs font-black uppercase tracking-[.2em] text-white/75 min-[390px]:inline">Travel Personality · 2026</span>
        </div>
        <div className="relative mx-auto mt-16 max-w-6xl text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-black uppercase tracking-[.22em] text-[#c8ff55]">{en ? "Diagnosis complete · The evidence is damning" : "Analysis complete · AI 总结已生成"}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="display text-balance mt-5 text-[clamp(3.3rem,13vw,10rem)] leading-[.84]">{en ? "You are" : "你是"}<br /><span data-testid="persona-code" className="text-[#ffd84d]">{persona.code}</span></motion.h1>
          <p className="display mt-6 text-2xl text-white sm:text-4xl">{persona.name}</p>
          <p className="mx-auto mt-3 w-fit rotate-[-1deg] rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-2 text-sm font-black text-[#17142f] shadow-[4px_4px_0_white]">{en ? "In human terms: " : "代码翻译："}{persona.codeMeaning}</p>
          <span data-testid="result-hash" className="sr-only">{resultHash}</span>
          <motion.div initial={{ scale: .4, rotate: -20 }} animate={{ scale: 1, rotate: 3 }} transition={{ type: "spring", delay: .15 }} className="mx-auto mt-8 h-48 w-48 overflow-hidden rounded-[2.25rem] border-2 border-[#17142f] bg-[#7657ff] shadow-[8px_8px_0_white] sm:h-56 sm:w-56">
            <Image key={persona.id} src={personaImageSrc(persona.id)} alt={en ? `${persona.name} geometric animal personality` : `${persona.name} 几何动物人格形象`} width={768} height={768} priority unoptimized className="h-full w-full object-cover" />
          </motion.div>
          <p className="mx-auto mt-9 max-w-2xl text-balance text-xl font-bold leading-relaxed text-white/90 sm:text-2xl">{persona.tagline}</p>
        </div>
      </header>

      <div className="result-gradient relative mx-auto -mt-16 max-w-6xl rounded-[2rem] border-2 border-[#17142f] p-4 shadow-[0_20px_0_rgba(23,20,47,.12)] sm:-mt-24 sm:rounded-[3rem] sm:p-8 lg:p-12">
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <section className="rounded-[2rem] border-2 border-[#17142f] bg-white p-6 sm:p-8">
            <span className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Your travel DNA</span>
            <PersonalityRadar scores={scores} language={language} />
            <p className="mx-auto max-w-sm text-center text-sm font-bold leading-relaxed text-black/55">{en ? "Every spike is a travel habit your friends have already noticed." : "形状比数字更诚实：哪里凸出去，哪里就是你旅行时最藏不住的人设。"}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">{persona.traits.map((trait) => <span key={trait} className="rounded-full border-2 border-[#17142f] bg-[#eee9ff] px-3 py-1.5 text-sm font-black">#{trait}</span>)}</div>
          </section>

          <section className="flex flex-col rounded-[2rem] border-2 border-[#17142f] bg-[#c8ff55] p-6 sm:p-8">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3"><Sparkles className="text-[#7657ff]" /><h2 className="display text-3xl">{en ? "AI Summary" : "AI 总结"}</h2></div>
              <span title={en ? "Deterministically generated from your answer path" : "由本地规则按答题路径稳定生成"} className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-black">⚡ {en ? "Variant" : "方案"} {analysis.variant} · {analysis.strategy}</span>
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
                <span className="text-xs font-black uppercase tracking-[.16em] text-black/55">{en ? "Signature line" : "代表台词"}</span>
                <p className="display mt-2 text-2xl">“{analysis.signatureLine}”</p>
              </div>
            </div>
            <div data-testid="travel-advice" className="mt-6 rounded-2xl border-2 border-[#17142f]/15 bg-white/60 p-5 font-bold leading-relaxed">
              <p><span className="mr-2 text-[#5635c7]">🧳 {en ? "Travel advice" : "旅行建议"}</span>{analysis.travelAdvice}</p>
            </div>
          </section>
      </div>

        <FriendMatch language={language} persona={persona} scores={scores} friend={friendSnapshot} />

      <section style={{ backgroundImage: world.color }} className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-[#17142f] bg-[#17142f] p-6 text-white sm:p-10">
          <div className="absolute inset-0 bg-[#17142f]/20" aria-hidden="true" />
          <div className="absolute right-5 top-2 text-[8rem] opacity-20 sm:text-[12rem]" aria-hidden="true">{world.emoji}</div>
          <div className="relative max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-white">{en ? "Where you belong, theoretically" : "Theoretical destination · 理论目的地"}</p>
            <h2 className="display mt-3 text-balance text-5xl leading-none sm:text-7xl">{world.name}</h2>
            <p className="mt-6 text-lg font-bold leading-relaxed sm:text-xl">{analysis.worldReason}</p>
            <p className="mt-4 inline-block rotate-[-1deg] rounded-xl border-2 border-[#17142f] bg-[#fffdf7] px-4 py-3 font-black text-[#17142f] shadow-[4px_4px_0_#17142f]">{world.unavailable}</p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border-2 border-[#17142f] bg-white p-6 sm:p-10">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#b51662]">Back to reality</p><h2 className="display mt-3 text-balance text-4xl sm:text-6xl">{en ? <>Earth-based alternatives<br />you can actually book:</> : <>现实世界<br />最接近它的地方：</>}</h2><p className="mt-4 font-bold text-black/70">{en ? "The fantasy was free. The flight, regrettably, is not." : "梦想负责离谱，Skyscanner 负责把路线拉回地球。"}</p></div>
          <div className="mt-9 grid gap-4 lg:grid-cols-3">
            {world.destinations.map((destination, index) => (
              <article key={destination.city} className="group flex flex-col rounded-2xl border-2 border-[#17142f] bg-[#f5f0ff] p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between"><span className="text-4xl">{destination.emoji}</span><span className="text-xs font-black text-black/65">0{index + 1}</span></div>
                <h3 className="display mt-5 text-3xl">{destination.city}</h3>
                <p className="text-sm font-black text-[#5635c7]">{destination.country}</p>
                <p className="mt-4 flex-1 font-bold leading-relaxed text-black/65">{analysis.destinationReasons[index] || `${destination.reason} ${destination.connection}`}</p>
                <a href={skyscannerUrl(destination.iata, language as TravelLanguage)} target="_blank" rel="noreferrer" className="button-pop focus-ring mt-6 flex items-center justify-between rounded-xl border-2 border-[#17142f] bg-[#17142f] px-4 py-3 text-sm font-black text-white shadow-[3px_3px_0_#7657ff]">{en ? `UK to ${destination.city} flights` : `从中国飞往 ${destination.city}`} <Plane size={17} /><span className="sr-only"> on Skyscanner</span></a>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-dashed border-[#17142f]/25 pt-7 text-center sm:flex-row sm:text-left">
          <div><strong className="display text-xl">Travel Personality Indicator</strong><p className="text-sm font-bold text-black/65">{en ? "No correct answers. Only extremely specific travel personalities." : "没有标准答案，只有非常具体的旅行人设。"}</p></div>
          <div className="rounded-xl bg-[#17142f] px-4 py-2 text-xs font-black text-white">{persona.emoji} {persona.code} · {persona.name}</div>
        </footer>
      </div>

      <section className="mx-auto mt-14 max-w-4xl px-5 text-center">
        <h2 className="display text-3xl sm:text-4xl">{en ? "This result belongs in the group chat immediately" : "这份结果不发出去，你会白忙活"}</h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button ref={posterTriggerRef} onClick={createPosterPreview} disabled={saving} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#c8ff55] px-5 py-4 font-black shadow-[5px_5px_0_#17142f]"><Download size={19} /> {saving ? (en ? "Generating…" : "正在生成…") : (en ? "Create personality poster" : "生成人格海报")}</button>
          <button onClick={shareResultLink} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-white px-5 py-4 font-black shadow-[5px_5px_0_#17142f]"><Link2 size={19} /> {en ? "Share result link" : "分享结果链接"}</button>
          <button onClick={inviteFriend} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-[#17142f] bg-[#ff4fa3] px-5 py-4 font-black text-[#17142f] shadow-[5px_5px_0_#17142f]"><Users size={19} /> {en ? "Invite a friend" : "邀请朋友来测"}</button>
        </div>
        {status && <motion.p role="status" aria-live="polite" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#17142f] px-4 py-2 text-sm font-black text-white"><Check size={15} /> {status}</motion.p>}
        <p className="mt-8 text-xs font-bold text-black/60">{en ? "Personality results are for entertainment only. Flight links open Skyscanner; prices and availability are shown there." : "人格结果仅供娱乐。航班链接将跳转至 Skyscanner，价格与可用性以其页面为准。"}</p>
      </section>

      {posterPreview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-[#17142f]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={en ? "Personality poster preview" : "人格海报预览"} onMouseDown={(event) => { if (event.target === event.currentTarget) setPosterPreview(null); }}>
          <motion.div ref={posterDialogRef} initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative grid max-h-[94vh] w-full max-w-4xl gap-5 overflow-y-auto rounded-[2rem] border-2 border-[#17142f] bg-[#fffdf7] p-4 shadow-[10px_10px_0_#7657ff] sm:grid-cols-[minmax(0,1fr)_18rem] sm:p-6">
            <button ref={posterCloseRef} onClick={() => setPosterPreview(null)} aria-label={en ? "Close poster preview" : "关闭海报预览"} className="focus-ring absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border-2 border-[#17142f] bg-white shadow-[3px_3px_0_#17142f]"><X size={20} /></button>
            <div className="overflow-hidden rounded-2xl border-2 border-[#17142f] bg-[#eee9ff]">
              {/* Canvas-generated blob URLs cannot be handled by next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={posterPreview.url} alt={en ? `${persona.code} personality poster preview` : `${persona.code} 人格海报预览`} className="mx-auto max-h-[78vh] w-full object-contain" />
            </div>
            <div className="flex flex-col justify-center pt-2 text-left sm:pt-0">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Poster ready</p>
              <h2 className="display mt-2 text-4xl">{en ? "A professionally designed way to expose yourself online" : "是时候让朋友知道你是什么品种了"}</h2>
              <div className="mt-6 grid gap-3">
                <button onClick={sharePoster} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#ff4fa3] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Share2 size={18} /> {en ? "Share poster" : "分享到社交软件"}</button>
                <button onClick={savePoster} className="button-pop focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-[#c8ff55] px-4 py-3 font-black shadow-[4px_4px_0_#17142f]"><Download size={18} /> {en ? "Save image" : "保存图片"}</button>
                <button onClick={copyPosterLink} className="focus-ring flex items-center justify-center gap-2 rounded-xl border-2 border-[#17142f] bg-white px-4 py-3 font-black"><Link2 size={18} /> {en ? "Copy result link" : "复制结果链接"}</button>
              </div>
              {posterStatus && <p role="status" className="mt-5 rounded-xl bg-[#17142f] px-4 py-3 text-center text-sm font-black text-white">{posterStatus}</p>}
              <p className="mt-5 text-xs font-bold leading-relaxed text-black/50">{en ? "The QR code invites friends to take the quiz; your answers stay private." : "二维码邀请朋友从头测试，不会公开你的答题记录"}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
