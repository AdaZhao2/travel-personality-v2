"use client";

import { useEffect, useRef, useState } from "react";
import { Analyzing } from "@/components/analyzing";
import { Hero } from "@/components/hero";
import { Quiz } from "@/components/quiz";
import { Result } from "@/components/result";
import { findPersona, getPersona, getWorld } from "@/data/catalog";
import { createRuleBasedAnalysis } from "@/lib/analysis";
import { analyticsEnabled, createAnalyticsAttemptId, trackAnalytics } from "@/lib/analytics";
import { decodeFriendSnapshot, encodeFriendSnapshot, type FriendSnapshot } from "@/lib/friend-match";
import { matchPersona, questions, scoreAnswers } from "@/lib/scoring";
import { decodeSharedResult } from "@/lib/share";
import type { Analysis, Answer, Persona, Scores, World } from "@/lib/types";
import { localizePersona, localizeWorld, type Language } from "@/lib/i18n";

type Screen = "hero" | "quiz" | "analyzing" | "result";
type ResultState = { persona: Persona; world: World; scores: Scores; analysis: Analysis; answers: Answer[]; attemptId: string | null };
type EntrySource = "direct" | "invitation" | "shared_result";

function decodeAnswerPath(path = ""): Answer[] {
  return questions.flatMap((question, index) => {
    const optionId = path[index];
    return question.options.some((option) => option.id === optionId)
      ? [{ questionId: question.id, optionId }]
      : [];
  });
}

export function TravelApp() {
  const [language, setLanguage] = useState<Language>("zh");
  const [screen, setScreen] = useState<Screen>("hero");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<ResultState | null>(null);
  const [invitation, setInvitation] = useState<string | null>(null);
  const [friendSnapshot, setFriendSnapshot] = useState<FriendSnapshot | null>(null);
  const runId = useRef(0);
  const attemptId = useRef<string | null>(null);
  const entrySource = useRef<EntrySource>("direct");

  /* URL state is intentionally hydrated once after the static page mounts. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let storedLanguage: string | null = null;
    try {
      storedLanguage = window.localStorage.getItem("travel-personality-language");
    } catch {
      // Storage can be disabled by browser privacy settings.
    }
    const savedLanguage = params.get("lang") ?? storedLanguage;
    if (savedLanguage === "en") setLanguage("en");
    const match = params.get("match");
    let hasValidMatch = false;
    if (match) {
      try {
        const snapshot = decodeFriendSnapshot(match);
        const inviter = findPersona(snapshot.p);
        if (!inviter) throw new Error("Unknown friend persona");
        setFriendSnapshot(snapshot);
        setInvitation(`${inviter.code} · ${inviter.name}`);
        hasValidMatch = true;
        entrySource.current = "invitation";
      } catch {
        // Invalid match data should not block ordinary result or invitation links.
      }
    }
    const from = params.get("from");
    if (from && !hasValidMatch) {
      const inviter = findPersona(from);
      if (inviter) {
        setInvitation(`${inviter.code} · ${inviter.name}`);
        entrySource.current = "invitation";
      }
    }

    const shared = params.get("result");
    if (!shared) return;
    try {
      const payload = decodeSharedResult(shared);
      const persona = findPersona(payload.p);
      if (!persona) throw new Error("Unknown shared persona");
      const world = getWorld(persona.worldId);
      const answers = decodeAnswerPath(payload.a);
      setResult({ persona, world, scores: payload.s, analysis: createRuleBasedAnalysis(payload.s, persona, world, answers), answers, attemptId: null });
      setScreen("result");
      entrySource.current = "shared_result";
    } catch {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem("travel-personality-language", nextLanguage);
    } catch {
      // The language still changes for the current page when storage is unavailable.
    }
  }

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

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
    trackAnalytics({
      eventType: "quiz_completed",
      attemptId: attemptId.current,
      personaId: persona.id,
      scores,
      answerPath: answers.map((answer) => answer.optionId).join(""),
    });

    const remaining = Math.max(0, 2800 - (Date.now() - startedAt));
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
    window.clearInterval(interval);
    if (currentRun !== runId.current) return;
    setResult({ persona, world, scores, analysis, answers, attemptId: attemptId.current });
    setScreen("result");
    window.scrollTo({ top: 0 });
  }

  function restart() {
    if (attemptId.current) trackAnalytics({ eventType: "quiz_restarted", attemptId: attemptId.current });
    runId.current += 1;
    attemptId.current = null;
    setResult(null);
    setScreen("hero");
    if (friendSnapshot) {
      const inviter = getPersona(friendSnapshot.p);
      setInvitation(`${inviter.code} · ${inviter.name}`);
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      url.searchParams.set("from", inviter.id);
      url.searchParams.set("match", encodeFriendSnapshot(friendSnapshot));
      window.history.replaceState({}, "", url);
    } else {
      setInvitation(null);
      window.history.replaceState({}, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startQuiz() {
    attemptId.current = createAnalyticsAttemptId();
    trackAnalytics({
      eventType: "quiz_started",
      attemptId: attemptId.current,
      entrySource: entrySource.current,
    });
    setScreen("quiz");
  }

  function recordAnswer(answer: Answer) {
    trackAnalytics({ eventType: "answer_selected", attemptId: attemptId.current, ...answer });
  }

  if (screen === "quiz") return <Quiz language={language} onLanguageChange={changeLanguage} onComplete={complete} onExit={restart} onAnswer={recordAnswer} />;
  if (screen === "analyzing") return <Analyzing language={language} onLanguageChange={changeLanguage} stage={stage} />;
  if (screen === "result" && result) {
    const persona = localizePersona(result.persona, language);
    const world = localizeWorld(result.world, language);
    const analysis = createRuleBasedAnalysis(result.scores, persona, world, result.answers, language);
    return <Result {...result} persona={persona} world={world} analysis={analysis} language={language} onLanguageChange={changeLanguage} friendSnapshot={friendSnapshot} onRestart={restart} />;
  }
  return <Hero language={language} onLanguageChange={changeLanguage} analyticsEnabled={analyticsEnabled} invitation={invitation} onStart={startQuiz} />;
}
