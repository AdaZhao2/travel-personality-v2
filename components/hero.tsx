"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { personaImageSrc } from "@/lib/persona-image";

export function Hero({ onStart, invitation }: { onStart: () => void; invitation?: string | null }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#7657ff] text-white">
      <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#ff4fa3] blur-[2px] sm:h-96 sm:w-96" />
      <div className="absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-[#c8ff55] blur-[1px] sm:h-96 sm:w-96" />
      <div className="noise" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-10">
        <Logo />
        <span className="rounded-full border border-white/40 bg-[#17142f]/70 px-4 py-2 text-xs font-bold text-white backdrop-blur sm:text-sm">Local roast · 仅供开心</span>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-10 sm:px-10 lg:grid-cols-[1.15fr_.85fr] lg:pt-20">
        <div>
          {invitation && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex rounded-full border-2 border-[#17142f] bg-[#ffd84d] px-4 py-2 text-sm font-black text-[#17142f] shadow-[4px_4px_0_#17142f]">
              👀 一位「{invitation}」邀请你来对答案
            </motion.div>
          )}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex w-fit items-center gap-2 rounded-full bg-[#c8ff55] px-3 py-1.5 text-sm font-black uppercase tracking-[.14em] text-[#17142f]">
            <Sparkles size={18} /> Travel Personality Indicator
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="display text-balance text-[clamp(3.4rem,9vw,7.8rem)] leading-[.87]">
            AI看穿<br /><span className="text-[#c8ff55]">你的旅行人格</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }} className="mt-8 max-w-2xl text-lg font-semibold leading-relaxed text-white/82 sm:text-2xl">
            不问酒店，不问景点。
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }} className="mt-9 flex flex-wrap items-center gap-5">
            <button onClick={onStart} className="button-pop focus-ring flex items-center gap-3 rounded-2xl border-2 border-[#17142f] bg-[#c8ff55] px-7 py-4 text-lg font-black text-[#17142f] shadow-[6px_6px_0_#17142f]">
              开始暴露自己 <ArrowRight size={22} strokeWidth={3} />
            </button>
            <span className="text-sm font-bold text-white">16 道题 · 约 2 分钟 · 无科学依据</span>
          </motion.div>
        </div>

        <div className="relative mx-auto h-[430px] w-full max-w-md sm:h-[520px]">
          <motion.div initial={{ rotate: -12, scale: .8, opacity: 0 }} animate={{ rotate: -7, scale: 1, opacity: 1 }} transition={{ type: "spring", delay: .15 }} className="absolute left-0 top-16 w-[78%] rounded-[2rem] border-2 border-[#17142f] bg-[#fffdf7] p-6 text-[#17142f] shadow-[10px_12px_0_#17142f]">
            <p className="text-xs font-black uppercase tracking-widest text-[#5635c7]">Your result is...</p>
            <div className="my-3 aspect-square w-full overflow-hidden rounded-2xl bg-[#fffdf7]">
              <Image src={personaImageSrc("chaos-traveller")} alt="JOKER 几何浣熊人格形象" width={768} height={768} priority unoptimized className="h-full w-full object-cover" />
            </div>
            <h2 className="display text-5xl leading-none">JOKER</h2>
            <p className="mt-3 text-xs font-black uppercase tracking-wider text-[#5635c7]">Chaos Traveller</p>
            <p className="mt-3 font-bold text-black/70">翻车也能变成段子。</p>
          </motion.div>
          <div className="float-a absolute right-0 top-3 rotate-6 rounded-2xl border-2 border-[#17142f] bg-[#ff4fa3] px-5 py-4 text-4xl shadow-[5px_6px_0_#17142f]">🔥 92</div>
          <div className="float-b absolute bottom-8 right-1 rotate-[-5deg] rounded-2xl border-2 border-[#17142f] bg-[#ffd84d] p-5 text-[#17142f] shadow-[6px_7px_0_#17142f]">
            <p className="text-xs font-black uppercase">Dream destination</p>
            <strong className="display mt-1 block text-2xl">伟大航路 🏴‍☠️</strong>
          </div>
          <div className="float-a absolute bottom-2 left-2 rounded-full border-2 border-[#17142f] bg-white px-4 py-3 text-sm font-black text-[#17142f] shadow-[4px_4px_0_#17142f]">📸 值得截图</div>
        </div>
      </section>

      <div className="absolute bottom-0 left-0 w-full rotate-[-1deg] border-y-2 border-[#17142f] bg-[#ffd84d] py-3 text-[#17142f]">
        <div className="marquee-track flex gap-10 whitespace-nowrap font-black uppercase tracking-wider">
          {[0, 1].map((block) => <span key={block}>🎭 NPC&nbsp;&nbsp; 🤡 整活&nbsp;&nbsp; 🔥 上头&nbsp;&nbsp; 💸 氪金&nbsp;&nbsp; 📸 出片&nbsp;&nbsp; 🧠 拿捏&nbsp;&nbsp; 互联网旅行玄学&nbsp;&nbsp;</span>)}
        </div>
      </div>
    </main>
  );
}
