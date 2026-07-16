"use client";

import { useEffect, useRef, useState } from "react";
import { Analyzing } from "@/components/analyzing";
import { Hero } from "@/components/hero";
import { Quiz } from "@/components/quiz";
import { Result } from "@/components/result";
import { getPersona, getWorld } from "@/data/catalog";
import { createRuleBasedAnalysis } from "@/lib/analysis";
import { matchPersona, questions, scoreAnswers } from "@/lib/scoring";
import { decodeSharedResult } from "@/lib/share";
import type { Analysis, Answer, Persona, Scores, World } from "@/lib/types";

type Screen = "hero" | "quiz" | "analyzing" | "result";
type ResultState = { persona: Persona; world: World; scores: Scores; analysis: Analysis; answers: Answer[] };

function decodeAnswerPath(path = ""): Answer[] {
  return questions.flatMap((question, index) => {
    const optionId = path[index];
    return question.options.some((option) => option.id === optionId)
      ? [{ questionId: question.id, optionId }]
      : [];
  });
}

export function TravelApp() {
  const [screen, setScreen] = useState<Screen>("hero");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ResultState | null>(null);
  const [invitation, setInvitation] = useState<string | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from) {
      const inviter = getPersona(from);
      setInvitation(`${inviter.code} · ${inviter.name}`);
    }

    const shared = params.get("result");
    if (!shared) return;
    try {
      const payload = decodeSharedResult(shared);
      const persona = getPersona(payload.p);
      const world = getWorld(persona.worldId);
      const answers = decodeAnswerPath(payload.a);
      setResult({ persona, world, scores: payload.s, analysis: createRuleBasedAnalysis(payload.s, persona, world, answers), answers });
      setScreen("result");
    } catch {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function complete(answers: Answer[]) {
    const currentRun = ++runId.current;
    const scores = scoreAnswers(answers);
    const persona = matchPersona(scores);
    const world = getWorld(persona.worldId);
    setStage(0);
    setScreen("analyzing");

    const interval = window.setInterval(() => setStage((value) => Math.min(3, value + 1)), 760);
    const startedAt = Date.now();
    const analysis = createRuleBasedAnalysis(scores, persona, world, answers);

    const remaining = Math.max(0, 2800 - (Date.now() - startedAt));
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
    window.clearInterval(interval);
    if (currentRun !== runId.current) return;
    setResult({ persona, world, scores, analysis, answers });
    setScreen("result");
    window.scrollTo({ top: 0 });
  }

  function restart() {
    runId.current += 1;
    setResult(null);
    setScreen("hero");
    setInvitation(null);
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (screen === "quiz") return <Quiz onComplete={complete} onExit={restart} />;
  if (screen === "analyzing") return <Analyzing stage={stage} />;
  if (screen === "result" && result) return <Result {...result} onRestart={restart} />;
  return <Hero invitation={invitation} onStart={() => setScreen("quiz")} />;
}
