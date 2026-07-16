import questionsData from "@/data/questions.json";
import { personas } from "@/data/catalog";
import calibrationData from "@/data/persona-calibration.json";
import { dimensionIds, type Answer, type Persona, type Question, type Scores } from "@/lib/types";

export const questions = questionsData as Question[];

const zeros = (): Scores => ({ npc: 0, chaos: 0, hype: 0, spend: 0, camera: 0, control: 0 });

const maxima = questions.reduce((totals, question) => {
  for (const dimension of dimensionIds) {
    totals[dimension] += Math.max(...question.options.map((option) => option.weights[dimension] ?? 0));
  }
  return totals;
}, zeros());

export function scoreAnswers(answers: Answer[]): Scores {
  const raw = zeros();
  for (const answer of answers) {
    const question = questions.find((item) => item.id === answer.questionId);
    const option = question?.options.find((item) => item.id === answer.optionId);
    if (!option) continue;
    for (const dimension of dimensionIds) raw[dimension] += option.weights[dimension] ?? 0;
  }

  return Object.fromEntries(
    dimensionIds.map((dimension) => [dimension, Math.round((raw[dimension] / maxima[dimension]) * 100)]),
  ) as Scores;
}

type PersonaCalibration = Record<string, { mean: number; deviation: number; bias: number }>;
const personaCalibration = calibrationData as PersonaCalibration;

function calibratedDistance(scores: Scores, persona: Persona) {
  const squaredDistance = dimensionIds.reduce(
    (sum, dimension) => sum + Math.pow(scores[dimension] - persona.vector[dimension], 2),
    0,
  );
  const calibration = personaCalibration[persona.id];
  if (!calibration) return squaredDistance;
  return (squaredDistance - calibration.mean) / calibration.deviation - calibration.bias;
}

export function matchPersona(scores: Scores): Persona {
  return [...personas].sort((a, b) => calibratedDistance(scores, a) - calibratedDistance(scores, b))[0];
}

export function getTopDimensions(scores: Scores) {
  return [...dimensionIds].sort((a, b) => scores[b] - scores[a]);
}

export type TravelLanguage = "zh" | "en";

const skyscannerLocale: Record<TravelLanguage, { origin: string; market: string; locale: string; currency: string }> = {
  zh: { origin: "CN", market: "CN", locale: "zh-CN", currency: "CNY" },
  en: { origin: "UK", market: "UK", locale: "en-GB", currency: "GBP" },
};

export function skyscannerUrl(iata: string, language: TravelLanguage = "zh") {
  const config = skyscannerLocale[language];
  const url = new URL("https://www.skyscanner.net/g/referrals/v1/flights/browse-view");
  url.searchParams.set("origin", config.origin);
  url.searchParams.set("destination", iata.trim().toUpperCase());
  url.searchParams.set("market", config.market);
  url.searchParams.set("locale", config.locale);
  url.searchParams.set("currency", config.currency);
  return url.toString();
}
