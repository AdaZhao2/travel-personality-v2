const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const vm = require("node:vm");

test("uniform answer choices give every persona a comparable result probability", () => {
  const dimensions = ["npc", "chaos", "hype", "spend", "camera", "control"];
  const questions = require("../data/questions.json");
  const calibration = require("../data/persona-calibration.json");
  const source = fs.readFileSync("data/catalog.ts", "utf8");
  const personaSource = source
    .slice(source.indexOf("export const personas"), source.indexOf("export function getPersona"))
    .replace("export const personas: Persona[] =", "const personas =");
  const context = {};
  vm.runInNewContext(`${personaSource}\nglobalThis.personas = personas;`, context);
  const { personas } = context;
  expect(Object.keys(calibration).sort()).toEqual(personas.map((persona) => persona.id).sort());
  const maxima = Object.fromEntries(dimensions.map((dimension) => [dimension, questions.reduce(
    (sum, question) => sum + Math.max(...question.options.map((option) => option.weights[dimension] ?? 0)), 0,
  )]));
  let seed = 352;
  const random = () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
  const counts = Object.fromEntries(personas.map((persona) => [persona.id, 0]));
  const samples = 150_000;

  for (let index = 0; index < samples; index += 1) {
    const raw = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
    questions.forEach((question) => {
      const option = question.options[Math.floor(random() * question.options.length)];
      dimensions.forEach((dimension) => { raw[dimension] += option.weights[dimension] ?? 0; });
    });
    const scores = Object.fromEntries(dimensions.map((dimension) => [dimension, Math.round(raw[dimension] / maxima[dimension] * 100)]));
    const winner = personas.reduce((best, persona) => {
      const squaredDistance = dimensions.reduce((sum, dimension) => sum + (scores[dimension] - persona.vector[dimension]) ** 2, 0);
      const config = calibration[persona.id];
      const distance = (squaredDistance - config.mean) / config.deviation - config.bias;
      return !best || distance < best.distance ? { persona, distance } : best;
    }, null).persona;
    counts[winner.id] += 1;
  }

  Object.entries(counts).forEach(([persona, count]) => {
    const percentage = count / samples * 100;
    expect(percentage, persona).toBeGreaterThan(9.8);
    expect(percentage, persona).toBeLessThan(12.4);
  });
});
