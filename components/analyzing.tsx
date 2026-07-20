"use client";

import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/language-toggle";
import type { Language } from "@/lib/i18n";

const lines = [
  "正在匹配你的互联网精神状态…",
  "发现嘴上随便，实际并不随便…",
  "正在计算你和现实世界的兼容度…",
  "正在向异世界申请签证…",
];
const englishLines = ["Reading the group-chat evidence…", "Translating ‘I’m easy’ into its 37 hidden conditions…", "Checking whether Earth can accommodate all this…", "Pricing up your move to another universe…"];

export function Analyzing({ stage, language, onLanguageChange }: { stage: number; language: Language; onLanguageChange: (language: Language) => void }) {
  const copy = language === "en" ? englishLines : lines;
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#17142f] px-5 text-white">
      <div className="noise" /><div className="absolute right-5 top-5 z-10"><LanguageToggle language={language} onChange={onLanguageChange} inverted /></div>
      <div className="relative w-full max-w-xl text-center">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7657ff] blur-[90px]" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="relative mx-auto grid h-40 w-40 place-items-center rounded-[2.7rem] border-2 border-white/30 bg-white/10 text-7xl shadow-[0_0_70px_rgba(200,255,85,.3)]">🔮</motion.div>
        <p className="relative mt-12 text-xs font-black uppercase tracking-[.24em] text-[#c8ff55]">Local roast engine</p>
        <motion.h1 key={`${language}-${stage}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="display text-balance relative mt-4 text-3xl sm:text-5xl">{copy[Math.min(stage, copy.length - 1)]}</motion.h1>
        <div className="relative mx-auto mt-10 h-3 max-w-sm overflow-hidden rounded-full bg-white/10">
          <motion.div className="shimmer h-full rounded-full bg-gradient-to-r from-[#ff4fa3] via-[#ffd84d] to-[#c8ff55]" initial={{ width: "8%" }} animate={{ width: `${25 + stage * 24}%` }} />
        </div>
        <p className="relative mt-5 text-sm font-bold text-white/70">{language === "en" ? "No internet required. The algorithm is drafting something uncomfortably specific." : "无需联网，AI算法正在组织比较冒犯但准确的语言"}</p>
      </div>
    </main>
  );
}
