const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const vm = require("node:vm");

function readWorlds() {
  const source = fs.readFileSync("data/catalog.ts", "utf8");
  const worldsOnly = source
    .slice(source.indexOf("export const worlds"), source.indexOf("export const personas"))
    .replace("export const worlds: World[] =", "const worlds =");
  const context = {};
  vm.runInNewContext(`${worldsOnly}\nglobalThis.catalogWorlds = worlds;`, context);
  return context.catalogWorlds;
}

function readPersonas() {
  const source = fs.readFileSync("data/catalog.ts", "utf8");
  const personasOnly = source
    .slice(source.indexOf("export const personas"), source.indexOf("export function getPersona"))
    .replace("export const personas: Persona[] =", "const personas =");
  const context = {};
  vm.runInNewContext(`${personasOnly}\nglobalThis.catalogPersonas = personas;`, context);
  return context.catalogPersonas;
}

test("catalog keeps complete worlds and includes the Pokémon route", () => {
  const catalog = fs.readFileSync("data/catalog.ts", "utf8");
  expect(catalog).toContain('id: "pokemon-world"');
  expect(catalog).toContain('name: "Pokémon World 宝可梦世界"');
  expect(catalog).toContain('city: "Tokyo"');
  expect(catalog).toContain('city: "Taipei"');
  expect(catalog).toContain('city: "Singapore"');
  expect(catalog).toMatch(/id: "fomo-rocketeer"[^\n]+worldId: "pokemon-world"/);

  const personas = readPersonas();
  expect(personas).toHaveLength(9);
  expect(new Set(personas.map((persona) => persona.id)).size).toBe(9);
  expect(new Set(personas.map((persona) => persona.code)).size).toBe(9);
  personas.forEach((persona) => {
    expect(fs.existsSync(`public/personas/${persona.id}-geometric-v2.png`), `${persona.code} character asset`).toBe(true);
  });

  const worlds = readWorlds();
  expect(worlds).toHaveLength(8);
  worlds.forEach((world) => {
    expect(world.destinations, world.name).toHaveLength(3);
    expect(new Set(world.destinations.map((item) => item.country)).size, `${world.name} countries`).toBe(3);
  });
  const worldIds = new Set(worlds.map((world) => world.id));
  personas.forEach((persona) => expect(worldIds.has(persona.worldId), persona.code).toBe(true));
  expect(new Set(personas.map((persona) => persona.worldId))).toEqual(worldIds);
  const destinations = worlds.flatMap((world) => world.destinations);
  expect(new Set(destinations.map((item) => item.city)).size).toBe(destinations.length);
  expect(new Set(destinations.map((item) => item.iata)).size).toBe(destinations.length);
});
