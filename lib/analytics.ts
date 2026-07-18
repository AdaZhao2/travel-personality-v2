"use client";

import type { Scores } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sessionStorageKey = "tpi-anonymous-session-id";

export const analyticsEnabled = Boolean(supabaseUrl && supabaseAnonKey);

type AnalyticsEvent = {
  eventType: "quiz_started" | "answer_selected" | "quiz_completed" | "quiz_restarted" | "result_shared";
  attemptId?: string | null;
  questionId?: string;
  optionId?: string;
  personaId?: string;
  scores?: Scores;
  answerPath?: string;
  entrySource?: "direct" | "invitation" | "shared_result";
  shareChannel?: "result_link" | "invite_link" | "poster" | "poster_download";
};

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === "x" ? value : value & 0x3 | 0x8).toString(16);
  });
}

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(sessionStorageKey);
    if (existing) return existing;
    const sessionId = randomId();
    window.localStorage.setItem(sessionStorageKey, sessionId);
    return sessionId;
  } catch {
    return randomId();
  }
}

export function createAnalyticsAttemptId() {
  return randomId();
}

export function trackAnalytics(event: AnalyticsEvent) {
  if (!supabaseUrl || !supabaseAnonKey || typeof window === "undefined") return;
  if (window.navigator.doNotTrack === "1") return;

  const row = {
    id: randomId(),
    session_id: getSessionId(),
    attempt_id: event.attemptId ?? null,
    event_type: event.eventType,
    question_id: event.questionId ?? null,
    option_id: event.optionId ?? null,
    persona_id: event.personaId ?? null,
    scores: event.scores ?? null,
    answer_path: event.answerPath ?? null,
    entry_source: event.entrySource ?? null,
    share_channel: event.shareChannel ?? null,
  };

  void fetch(`${supabaseUrl}/rest/v1/quiz_events`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
    keepalive: true,
  }).catch(() => undefined);
}
