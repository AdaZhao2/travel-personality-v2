import questionTranslations from "@/data/questions.en.json";
import { validateQuestionTranslations } from "@/lib/question-data";
import type { Persona, Question, World } from "@/lib/types";

export type Language = "zh" | "en";

export function localizeQuestions(questions: Question[], language: Language): Question[] {
  if (language === "zh") return questions;
  const englishQuestions = validateQuestionTranslations(questionTranslations, questions);
  return questions.map((question) => {
    const translated = englishQuestions.find((item) => item.id === question.id);
    if (!translated) return question;
    return {
      ...question,
      setup: translated.setup,
      prompt: translated.prompt,
      options: question.options.map((option) => {
        const copy = translated.options[option.id];
        return copy ? { ...option, text: copy[0], reaction: copy[1] } : option;
      }),
    };
  });
}

const personaEnglish: Record<string, Partial<Persona>> = {
  "chaos-traveller": { codeMeaning: "Turns travel disasters into group-chat lore", tagline: "Your itinerary is less a plan, more a legally non-binding suggestion.", traits: ["Side-quest magnet", "Elite improviser", "Lore generator"], travelStyle: "an open-ended trip with one night booked and several miracles pending", companion: "someone fun who also remembers where the passports are" },
  "food-hunter": { codeMeaning: "Food is the itinerary", tagline: "Museums have opening hours. Your appetite has demands.", traits: ["Menu roulette", "Queue athlete", "Human food map"], travelStyle: "a city break where lunch, dinner, and second dinner are the anchor points", companion: "someone who shares plates and never says ‘I’m not hungry’" },
  "luxury-escaper": { codeMeaning: "Why suffer when an upgrade exists?", tagline: "You did not take time off to build character in a bad hotel.", traits: ["Upgrade fluent", "Hotel connoisseur", "Allergic to struggle"], travelStyle: "one beautiful base, excellent sheets, and absolutely no 6 a.m. coach", companion: "someone whose budget and definition of ‘worth it’ match yours" },
  "main-character": { code: "LEAD", codeMeaning: "Camera on. Plot activated.", tagline: "You don’t visit cities. You give them a supporting role.", traits: ["Own soundtrack", "Golden-hour union", "Camera ready"], travelStyle: "a cinematic route powered by outfits, street scenes, and suspiciously precise sunsets", companion: "someone with taste, patience, and proven portrait-mode skills" },
  "fomo-rocketeer": { codeMeaning: "Fear Of Missing Out, professionally", tagline: "“Only two left” is not information. It is a starting pistol.", traits: ["Checkout reflex", "Trend bloodhound", "Book now, process later"], travelStyle: "limited drops, opening weekends, festivals, and stories that begin with ‘so I panic-booked…’", companion: "someone who owns a ready-packed bag and asks questions after security" },
  "soft-life-migrant": { codeMeaning: "Zero alarms. Zero guilt.", tagline: "Your dream itinerary is waking up and declining to rush.", traits: ["Slow-life scholar", "Nap positive", "Schedule resistant"], travelStyle: "coffee, wandering, one gentle plan, and a heroic amount of doing nothing", companion: "someone calm who never asks ‘shall we squeeze one more thing in?’" },
  "social-compass": { codeMeaning: "No Plan, Just Good Company", tagline: "You don’t need a destination. You need the right group chat.", traits: ["Vibe reader", "Plan passenger", "Group-chat glue"], travelStyle: "a friend-led trip where your main responsibility is turning up in a good mood", companion: "a decisive organiser who understands that ‘I’m easy’ is not a plan" },
  "budget-alchemist": { codeMeaning: "Good Price System", tagline: "You can turn three fare alerts and a spreadsheet into free breakfast.", traits: ["Deal sorcery", "Route architect", "Backup to the backup"], travelStyle: "off-peak dates, suspiciously good value, and a route optimised within an inch of its life", companion: "someone punctual, transparent about money, and willing to open FINAL-itinerary-v7.pdf" },
  "planet-earth-expat": { codeMeaning: "Signal gone. Personality restored.", tagline: "Your nervous system would like fewer notifications and a much larger mountain.", traits: ["Wild reset", "Big-view addict", "Crowd repellent"], travelStyle: "a long road trip with trails, weather, and entire hours outside phone signal", companion: "someone outdoorsy, low-drama, and respectful enough not to geotag everything" },
};

type WorldEnglish = { name: string; unavailable: string; destinations: Array<{ country: string; reason: string; connection: string }> };
const worldEnglish: Record<string, WorldEnglish> = {
  "grand-line": { name: "Grand Line", unavailable: "Spiritually, you’re ready to captain a pirate ship. Legally, your travel insurance has questions.", destinations: [{country:"Japan",reason:"Island roads and sea air make every drive feel like an opening sequence.",connection:"The sort of place where a crew could assemble by lunchtime."},{country:"Philippines",reason:"Every island hop feels like a side quest with suspiciously good water.",connection:"Limestone cliffs bring full fantasy-map energy."},{country:"Thailand",reason:"The long-tail boat starts and adventure mode loads automatically.",connection:"High-seas chaos, but bookable and with hotel breakfast."}] },
  "middle-earth": { name: "Middle-earth", unavailable: "You have the soul of an epic quest. Your annual-leave balance has the range of a short errand.", destinations: [{country:"New Zealand",reason:"Mountains, lakes, and roads arrive pre-scored for an epic.",connection:"The closest reality gets to casually wandering into Middle-earth."},{country:"United Kingdom",reason:"Highlands, castles, and lochs make a road trip feel like a noble mission.",connection:"A quiet base with enormous, mildly haunted energy."},{country:"Canada",reason:"Stock up in Calgary, then head for Banff’s peaks, forests, and glacial lakes.",connection:"Basically a real-world portal with decent coffee on the way."}] },
  "galactic-empire": { name: "Galactic Frontier", unavailable: "The system recommends leaving Earth. Skyscanner remains weirdly unhelpful with light-years.", destinations: [{country:"Iceland",reason:"Black sand, lava, and auroras make Earth look like it has downloadable skins.",connection:"The galactic frontier, with rental cars."},{country:"Norway",reason:"Chasing the northern lights is already a space mission with knitwear.",connection:"Maximum ceremony for anyone who treats stargazing as an event."},{country:"Finland",reason:"The snow is quiet enough to mute the entire internet.",connection:"Ideal when you need to leave the human group chat."}] },
  "atlantis": { name: "Atlantis", unavailable: "Your standards have officially gone underwater. Sadly, airport security still hates waterproof electronics.", destinations: [{country:"Greece",reason:"Blue-and-white cliffs make looking at the sea feel like an occasion.",connection:"Atlantis, if it resurfaced with excellent terraces."},{country:"Maldives",reason:"Overwater villas turn ‘I live in the sea now’ into a room category.",connection:"The premium checkout lane to an underwater kingdom."},{country:"Indonesia",reason:"Sea, beautiful hotels, and ritual-level relaxation come bundled.",connection:"A tropical temple and water world sharing one very photogenic map."}] },
  "disney-castle": { name: "Fairytale Castle", unavailable: "You require daily fireworks and a sweeping score. Your neighbours have filed a complaint.", destinations: [{country:"Germany",reason:"Neuschwanstein lets you complete the castle subplot properly.",connection:"Where a storybook illustrator appears to have done the planning."},{country:"France",reason:"Parisian streets, château energy, and Disneyland all understand their angles.",connection:"Main-character mode, from pavement café to parade."},{country:"Czechia",reason:"Spires and cobbles turn an ordinary walk into Act Two.",connection:"A fairytale filter without the theme-park queue."}] },
  "pokemon-world": { name: "Pokémon World", unavailable: "Your starter is ready. Unfortunately, your Pokédex still cannot generate a boarding pass.", destinations: [{country:"Japan",reason:"Pokémon Centers, the Pokémon Café, and endless city side quests keep the map busy.",connection:"A fully stocked hub where adventure can begin before lunch."},{country:"Taiwan",reason:"The official Pokémon Center slots neatly between excellent food and shopping.",connection:"A Pokédex mission at an enjoyably human pace."},{country:"Singapore",reason:"Jewel Changi has a Pokémon Center, so the quest begins before baggage claim.",connection:"The airport is a portal lobby; the city is the polished new map."}] },
  "pandora": { name: "Pandora", unavailable: "Your nervous system has rejected cities. Interplanetary visas are, predictably, still in beta.", destinations: [{country:"China",reason:"Cloud-wrapped stone pillars deliver floating-mountain visuals with no CGI required.",connection:"Pandora’s most convincing Earth-based body double."},{country:"United States",reason:"Canyons, rainforest, and coast look like somebody turned saturation all the way up.",connection:"An ecosystem running the premium graphics pack."},{country:"Costa Rica",reason:"Rainforest, volcanoes, and wildlife make every day feel extremely alive.",connection:"For explorers who respect nature but still need to inspect everything."}] },
  "bikini-bottom": { name: "Bikini Bottom", unavailable: "The pineapple house is yours. The deposit, regrettably, is payable only in jellyfish currency.", destinations: [{country:"United States",reason:"Beach, surf, and gloriously unserious energy are available all day.",connection:"The fastest route into a Bikini Bottom state of mind."},{country:"Mexico",reason:"The joy is immediate and the holiday needs no PowerPoint justification.",connection:"Leave your brain with reception; collect it at checkout."},{country:"Philippines",reason:"Island hops, diving, and affordable fun arrive in generous quantities.",connection:"A real-world guest pass for the underwater neighbourhood."}] },
};

export function localizePersona(persona: Persona, language: Language): Persona {
  return language === "en" ? { ...persona, ...personaEnglish[persona.id] } : persona;
}

export function localizeWorld(world: World, language: Language): World {
  if (language === "zh") return world;
  const copy = worldEnglish[world.id];
  if (!copy) return world;
  return { ...world, name: copy.name, unavailable: copy.unavailable, destinations: world.destinations.map((destination, index) => ({ ...destination, ...copy.destinations[index] })) };
}
