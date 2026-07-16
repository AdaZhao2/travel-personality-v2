"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import React from "react";
import { Logo } from "@/components/logo";
import { questions } from "@/lib/scoring";
import type { Answer } from "@/lib/types";

const letters = ["A", "B", "C", "D"];

export function Quiz({ onComplete, onExit }: { onComplete: (answers: Answer[]) => void; onExit: () => void }) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const question = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  function choose(optionId: string) {
    if (selected) return;
    setSelected(optionId);
    const nextAnswers = [...answers.slice(0, index), { questionId: question.id, optionId }];
    setAnswers(nextAnswers);
    window.setTimeout(() => {
      if (index === questions.length - 1) onComplete(nextAnswers);
      else {
        setIndex((value) => value + 1);
        setSelected(null);
      }
    }, 430);
  }

  function goBack() {
    if (index === 0) return onExit();
    setIndex((value) => value - 1);
    setSelected(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7df]">
      <div className="noise" />
      <div className="absolute -right-36 -top-36 h-96 w-96 rounded-full bg-[#ff4fa3]/25" />
      <nav className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <button onClick={onExit} className="focus-ring flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-black/70 hover:bg-black/10 hover:text-black"><RotateCcw size={16} /> 重新开始</button>
      </nav>

      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16 pt-5 sm:px-8 sm:pt-12">
        <div className="mb-8 flex items-end gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-[#17142f] bg-white">
            <motion.div className="h-full bg-[#7657ff]" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>
          <span className="min-w-16 text-right text-sm font-black tabular-nums">{String(index + 1).padStart(2, "0")} / {questions.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div data-testid="question" data-question-id={question.id} key={question.id} initial={{ opacity: 0, x: 45 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -45 }} transition={{ duration: .22 }}>
            <div className="mb-7 flex items-center gap-4">
              <motion.span initial={{ rotate: -12, scale: .5 }} animate={{ rotate: 3, scale: 1 }} className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-[#17142f] bg-[#ffd84d] text-4xl shadow-[4px_4px_0_#17142f]">{question.emoji}</motion.span>
              <p className="text-sm font-black uppercase tracking-wider text-[#5a38d2]">互联网行为观察 · #{index + 1}</p>
            </div>
            <p className="text-lg font-bold text-black/55 sm:text-xl">{question.setup}</p>
            <h1 className="display text-balance mt-3 text-4xl leading-[1.04] sm:text-6xl">{question.prompt}</h1>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {question.options.map((option, optionIndex) => {
                const isSelected = selected === option.id;
                return (
                  <motion.button
                    key={option.id}
                    data-testid={`answer-${option.id}`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: .985 }}
                    onClick={() => choose(option.id)}
                    disabled={Boolean(selected)}
                    className={`focus-ring group relative min-h-28 rounded-2xl border-2 border-[#17142f] p-5 text-left transition-colors ${isSelected ? "bg-[#c8ff55] shadow-[6px_6px_0_#17142f]" : "bg-white shadow-[4px_4px_0_rgba(23,20,47,.16)] hover:bg-[#eee9ff]"}`}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-[#17142f] text-sm font-black ${isSelected ? "bg-[#17142f] text-white" : "bg-[#fff7df]"}`}>{isSelected ? <Check size={17} strokeWidth={3} /> : letters[optionIndex]}</span>
                      <div><strong className="text-base leading-snug sm:text-lg">{option.text}</strong>{isSelected && <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm font-bold text-black/70">{option.reaction}</motion.p>}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={goBack} className="focus-ring mt-8 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black text-black/70 hover:bg-black/10 hover:text-black"><ArrowLeft size={17} /> {index === 0 ? "返回首页" : "上一题"}</button>
      </section>
    </main>
  );
}
