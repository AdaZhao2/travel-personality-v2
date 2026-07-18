"use client";

import type { Language } from "@/lib/i18n";

export function LanguageToggle({ language, onChange, inverted = false }: { language: Language; onChange: (language: Language) => void; inverted?: boolean }) {
  return (
    <div className={`flex rounded-full border-2 p-1 text-xs font-black ${inverted ? "border-white/50 bg-white/10 text-white" : "border-[#17142f] bg-white text-[#17142f]"}`} role="group" aria-label="Language / 语言">
      {(["zh", "en"] as const).map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} aria-pressed={language === item} className={`focus-ring rounded-full px-3 py-1.5 transition-colors ${language === item ? "bg-[#c8ff55] text-[#17142f]" : "hover:bg-black/10"}`}>
          {item === "zh" ? "中文" : "EN"}
        </button>
      ))}
    </div>
  );
}
