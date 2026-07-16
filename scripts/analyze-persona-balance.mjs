import fs from "node:fs";
import vm from "node:vm";

const dimensions = ["npc", "chaos", "hype", "spend", "camera", "control"];
const questions = JSON.parse(fs.readFileSync("data/questions.json", "utf8"));
const calibration = JSON.parse(fs.readFileSync("data/persona-calibration.json", "utf8"));
const catalogSource = fs.readFileSync("data/catalog.ts", "utf8");
const personaSource = catalogSource
  .slice(catalogSource.indexOf("export const personas"), catalogSource.indexOf("export function getPersona"))
  .replace("export const personas: Persona[] =", "const personas =");
const context = {};
vm.runInNewContext(`${personaSource}\nglobalThis.personas = personas;`, context);
const { personas } = context;
const samples = Number(process.argv[2] ?? 500_000);

const maxima = Object.fromEntries(dimensions.map((dimension) => [
  dimension,
  questions.reduce((sum, question) => sum + Math.max(...question.options.map((option) => option.weights[dimension] ?? 0)), 0),
]));

function randomGenerator(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function scoreRandomAnswers(random) {
  const raw = Object.fromEntries(dimensions.map((dimension) => [dimension, 0]));
  questions.forEach((question) => {
    const option = question.options[Math.floor(random() * question.options.length)];
    dimensions.forEach((dimension) => { raw[dimension] += option.weights[dimension] ?? 0; });
  });
  return Object.fromEntries(dimensions.map((dimension) => [
    dimension,
    Math.round(raw[dimension] / maxima[dimension] * 100),
  ]));
}

function squaredDistance(scores, persona) {
  return dimensions.reduce((sum, dimension) => sum + (scores[dimension] - persona.vector[dimension]) ** 2, 0);
}

function match(scores, calibrated) {
  return personas.reduce((best, persona) => {
    const rawDistance = squaredDistance(scores, persona);
    const config = calibration[persona.id];
    const distance = calibrated ? (rawDistance - config.mean) / config.deviation - config.bias : rawDistance;
    return !best || distance < best.distance ? { persona, distance } : best;
  }, null).persona;
}

const random = randomGenerator(20260716);
const rawCounts = Object.fromEntries(personas.map((persona) => [persona.code, 0]));
const calibratedCounts = Object.fromEntries(personas.map((persona) => [persona.code, 0]));
for (let index = 0; index < samples; index += 1) {
  const scores = scoreRandomAnswers(random);
  rawCounts[match(scores, false).code] += 1;
  calibratedCounts[match(scores, true).code] += 1;
}

console.log(`Uniform-choice simulation: ${samples.toLocaleString()} runs; target ${(100 / personas.length).toFixed(2)}%`);
console.log("CODE     BEFORE     AFTER");
personas.forEach((persona) => {
  const before = rawCounts[persona.code] / samples * 100;
  const after = calibratedCounts[persona.code] / samples * 100;
  console.log(`${persona.code.padEnd(6)} ${before.toFixed(2).padStart(8)}% ${after.toFixed(2).padStart(8)}%`);
});
