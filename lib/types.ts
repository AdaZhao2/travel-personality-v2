export const dimensionIds = ["npc", "chaos", "hype", "spend", "camera", "control"] as const;
export type DimensionId = (typeof dimensionIds)[number];

export type Scores = Record<DimensionId, number>;

export type QuestionOption = {
  id: string;
  text: string;
  reaction: string;
  weights: Partial<Record<DimensionId, number>>;
};

export type Question = {
  id: string;
  setup: string;
  prompt: string;
  emoji: string;
  options: QuestionOption[];
};

export type Answer = {
  questionId: string;
  optionId: string;
};

export type Destination = {
  city: string;
  country: string;
  emoji: string;
  iata: string;
  reason: string;
  connection: string;
};

export type Persona = {
  id: string;
  code: string;
  codeMeaning: string;
  name: string;
  emoji: string;
  tagline: string;
  traits: string[];
  strength: string;
  weakness: string;
  travelStyle: string;
  companion: string;
  worldId: string;
  vector: Scores;
};

export type World = {
  id: string;
  name: string;
  emoji: string;
  unavailable: string;
  color: string;
  destinations: Destination[];
};

export type Analysis = {
  variant: number;
  strategy: string;
  opening: string;
  roast: string;
  narrative: { text: string; emphasis?: boolean }[];
  signatureLine: string;
  travelAdvice: string;
  worldReason: string;
  destinationReasons: string[];
};
