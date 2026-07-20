import { dimensionIds, type Question } from "@/lib/types";

type EnglishQuestion = {
  id: string;
  setup: string;
  prompt: string;
  options: Record<string, [string, string]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(message: string): never {
  throw new Error(`Invalid question data: ${message}`);
}

export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || value.length === 0) fail("questions must be a non-empty array");
  const seenQuestionIds = new Set<string>();
  const questions = value.map((questionValue, questionIndex) => {
    if (!isRecord(questionValue)) fail(`question ${questionIndex + 1} must be an object`);
    const { id, setup, prompt, emoji, options } = questionValue;
    if (typeof id !== "string" || !id) fail(`question ${questionIndex + 1} has no id`);
    if (seenQuestionIds.has(id)) fail(`duplicate question id ${id}`);
    seenQuestionIds.add(id);
    if (typeof setup !== "string" || typeof prompt !== "string" || typeof emoji !== "string") fail(`${id} has invalid copy`);
    if (!Array.isArray(options) || options.length !== 4) fail(`${id} must contain exactly four options`);
    const seenOptionIds = new Set<string>();
    const parsedOptions = options.map((optionValue, optionIndex) => {
      if (!isRecord(optionValue)) fail(`${id} option ${optionIndex + 1} must be an object`);
      const { id: optionId, text, reaction, weights } = optionValue;
      if (typeof optionId !== "string" || !/^[a-d]$/.test(optionId)) fail(`${id} has invalid option id`);
      if (seenOptionIds.has(optionId)) fail(`${id} has duplicate option ${optionId}`);
      seenOptionIds.add(optionId);
      if (typeof text !== "string" || typeof reaction !== "string" || !isRecord(weights)) fail(`${id}.${optionId} has invalid copy or weights`);
      for (const [dimension, weight] of Object.entries(weights)) {
        if (!dimensionIds.includes(dimension as (typeof dimensionIds)[number])) fail(`${id}.${optionId} uses unknown dimension ${dimension}`);
        if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) fail(`${id}.${optionId} has invalid ${dimension} weight`);
      }
      return { id: optionId, text, reaction, weights };
    });
    return { id, setup, prompt, emoji, options: parsedOptions } as Question;
  });
  for (const dimension of dimensionIds) {
    if (!questions.some((question) => question.options.some((option) => (option.weights[dimension] ?? 0) > 0))) fail(`dimension ${dimension} is never scored`);
  }
  return questions;
}

export function validateQuestionTranslations(value: unknown, questions: Question[]): EnglishQuestion[] {
  if (!Array.isArray(value) || value.length !== questions.length) fail("English question count does not match Chinese questions");
  return questions.map((question) => {
    const translated = value.find((item) => isRecord(item) && item.id === question.id);
    if (!isRecord(translated) || typeof translated.setup !== "string" || typeof translated.prompt !== "string" || !isRecord(translated.options)) fail(`missing English copy for ${question.id}`);
    const translatedOptions = translated.options;
    const options = Object.fromEntries(question.options.map((option) => {
      const copy = translatedOptions[option.id];
      if (!Array.isArray(copy) || copy.length !== 2 || copy.some((item) => typeof item !== "string")) fail(`missing English copy for ${question.id}.${option.id}`);
      return [option.id, copy as [string, string]];
    }));
    return { id: question.id, setup: translated.setup, prompt: translated.prompt, options };
  });
}

export function validateOptionOrder(value: unknown, questions: Question[]): Record<string, string[]> {
  if (!isRecord(value)) fail("option order must be an object");
  return Object.fromEntries(questions.map((question) => {
    const order = value[question.id];
    const expected = question.options.map((option) => option.id).sort();
    if (!Array.isArray(order) || order.length !== expected.length || [...order].sort().join("") !== expected.join("")) fail(`invalid option order for ${question.id}`);
    return [question.id, order as string[]];
  }));
}
