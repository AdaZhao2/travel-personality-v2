import { dimensionIds, type Scores } from "@/lib/types";

export type SharedResultPayload = {
  p: string;
  s: Scores;
  a?: string;
};

const maxEncodedPayloadLength = 4096;

function isScores(value: unknown): value is Scores {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return dimensionIds.every((dimension) => {
    const score = (value as Record<string, unknown>)[dimension];
    return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
  });
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedResult(payload: SharedResultPayload) {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSharedResult(value: string): SharedResultPayload {
  if (!value || value.length > maxEncodedPayloadLength) throw new Error("Invalid shared result payload");
  const payload: unknown = JSON.parse(fromBase64Url(value));
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid shared result payload");
  }
  const { p, s, a } = payload as Record<string, unknown>;
  if (
    typeof p !== "string"
    || p.length === 0
    || p.length > 64
    || !isScores(s)
    || (a !== undefined && (typeof a !== "string" || !/^[a-d]{0,16}$/.test(a)))
  ) {
    throw new Error("Invalid shared result payload");
  }
  return { p, s, ...(typeof a === "string" ? { a } : {}) };
}

export function createResultHash(personaId: string, scores: Scores, answerPath: string) {
  const source = [personaId, ...dimensionIds.map((id) => scores[id]), answerPath].join("|");
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `#TPI-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

export function cleanPageUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Unable to copy share link");
  }
}
