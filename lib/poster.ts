import QRCode from "qrcode";
import { dimensionLevel, dimensions, englishDimensionLabels } from "@/lib/constants";
import type { Language } from "@/lib/i18n";
import { personaImageSrc } from "@/lib/persona-image";
import type { Analysis, Persona, Scores, World } from "@/lib/types";

const WIDTH = 1080;
const HEIGHT = 1440;
const INK = "#17142f";
const PAPER = "#fffdf7";
const PURPLE = "#7657ff";
const LIME = "#c8ff55";
const YELLOW = "#ffd84d";
const PINK = "#ff4fa3";
const FONT = '"Arial Rounded MT Bold", "Avenir Next", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

type PosterInput = {
  persona: Persona;
  world: World;
  scores: Scores;
  analysis: Analysis;
  inviteUrl: string;
  resultHash: string;
  language?: Language;
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function textLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const value = String(text).trim();
  if (/\s/.test(value)) {
    const lines: string[] = [];
    let line = "";
    for (const word of value.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(value)) {
    const candidate = `${line}${character}`;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line.trimEnd());
      line = character.trimStart();
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function wrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const lines = textLines(ctx, String(text), maxWidth).slice(0, maxLines);
  const allLines = textLines(ctx, String(text), maxWidth);
  if (allLines.length > maxLines && lines.length) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      const withoutLastWord = last.replace(/\s+\S+$/, "");
      last = withoutLastWord === last ? last.slice(0, -1) : withoutLastWord;
    }
    lines[lines.length - 1] = `${last}…`;
  }
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, minSize: number) {
  let size = startSize;
  do {
    ctx.font = `900 ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  } while (size > minSize);
  ctx.font = `900 ${minSize}px ${FONT}`;
  return minSize;
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to create poster")), "image/png");
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function generatePersonalityPoster({ persona, world, scores, analysis, inviteUrl, resultHash, language = "zh" }: PosterInput) {
  const en = language === "en";
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  const personaImage = await loadImage(personaImageSrc(persona.id));

  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, "#5b3bd6");
  background.addColorStop(.52, PURPLE);
  background.addColorStop(1, PINK);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(200,255,85,.9)";
  ctx.beginPath();
  ctx.arc(1000, 180, 235, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,216,77,.85)";
  ctx.beginPath();
  ctx.arc(70, 1280, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(23,20,47,.28)";
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = PAPER;
  roundRect(ctx, 58, 54, 964, 1330, 52);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = INK;
  ctx.font = `900 26px ${FONT}`;
  ctx.fillText("TRAVEL PERSONALITY INDICATOR", 108, 120);
  ctx.textAlign = "right";
  ctx.fillText(`RESULT / ${String(analysis.variant).padStart(2, "0")} · ${resultHash}`, 972, 120);
  ctx.textAlign = "left";

  ctx.save();
  ctx.translate(108, 154);
  ctx.rotate(-.025);
  ctx.shadowColor = INK;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = LIME;
  roundRect(ctx, 0, 0, 270, 58, 20);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `900 24px ${FONT}`;
  ctx.fillText(en ? "YOUR TRAVEL TYPE" : "你的旅行人格是", 24, 38);
  ctx.restore();

  ctx.fillStyle = INK;
  fitFont(ctx, persona.code, 660, 174, 112);
  ctx.fillText(persona.code, 104, 358);

  ctx.save();
  ctx.translate(850, 275);
  ctx.rotate(.08);
  roundRect(ctx, -116, -116, 232, 232, 38);
  ctx.clip();
  ctx.drawImage(personaImage, -116, -116, 232, 232);
  ctx.restore();
  ctx.save();
  ctx.translate(850, 275);
  ctx.rotate(.08);
  roundRect(ctx, -116, -116, 232, 232, 38);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = PURPLE;
  ctx.font = `900 32px ${FONT}`;
  ctx.fillText(persona.name.toUpperCase(), 108, 416);
  ctx.fillStyle = INK;
  const codeMeaning = `${en ? "IN HUMAN TERMS: " : "代码翻译："}${persona.codeMeaning}`;
  fitFont(ctx, codeMeaning, 840, 28, 19);
  ctx.fillText(codeMeaning, 108, 460);
  ctx.fillStyle = "#514d63";
  ctx.font = `700 30px ${FONT}`;
  wrappedText(ctx, persona.tagline, 108, 508, 840, 42, 2);

  ctx.fillStyle = "#f1edff";
  roundRect(ctx, 92, 564, 896, 244, 32);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = `900 24px ${FONT}`;
  ctx.fillText("YOUR TRAVEL DNA", 122, 610);

  dimensions.forEach((dimension, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 122 + column * 286;
    const y = 638 + row * 76;
    const level = dimensionLevel(scores[dimension.id]);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x, y, 258, 58, 16);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `800 ${en ? 17 : 21}px ${FONT}`;
    ctx.fillText(`${dimension.emoji} ${en ? englishDimensionLabels[dimension.id] : dimension.label}`, x + 16, y + 37);
    ctx.textAlign = "right";
    ctx.font = `900 24px ${FONT}`;
    ctx.fillStyle = PURPLE;
    ctx.fillText(level, x + 238, y + 37);
    ctx.textAlign = "left";
  });

  ctx.fillStyle = LIME;
  roundRect(ctx, 92, 832, 896, 254, 34);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = INK;
  const summaryHeading = `${en ? "AI SUMMARY" : "AI 总结"} · ${analysis.strategy}`;
  fitFont(ctx, summaryHeading, 820, 25, 19);
  ctx.fillText(summaryHeading, 126, 882);
  ctx.font = `900 34px ${FONT}`;
  const posterNarrative = analysis.narrative.find((line) => line.emphasis)?.text ?? analysis.roast;
  const narrativeBottom = wrappedText(ctx, posterNarrative, 126, 934, 820, en ? 46 : 50, 2);
  const signature = `${en ? "SIGNATURE: " : "代表台词："}“${analysis.signatureLine}”`;
  fitFont(ctx, signature, 820, 24, 17);
  const signatureY = en ? 1050 : Math.min(1050, narrativeBottom + 38);
  ctx.fillText(signature, 126, signatureY);

  ctx.fillStyle = INK;
  roundRect(ctx, 92, 1110, 590, 210, 32);
  ctx.fill();
  ctx.fillStyle = LIME;
  ctx.font = `900 22px ${FONT}`;
  ctx.fillText("THEORETICAL DESTINATION", 124, 1152);
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 36px ${FONT}`;
  wrappedText(ctx, `${world.emoji} ${world.name}`, 124, 1200, 520, 44, 2);
  ctx.fillStyle = YELLOW;
  ctx.font = `800 22px ${FONT}`;
  wrappedText(ctx, world.destinations.map((item) => item.city).join(" · "), 124, 1286, 520, 30, 2);

  const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
    color: { dark: `${INK}FF`, light: "FFFFFFFF" },
  });
  const qr = await loadImage(qrDataUrl);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 716, 1094, 250, 250, 30);
  ctx.fill();
  ctx.drawImage(qr, 728, 1106, 226, 226);
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  const qrLabel = en ? "SCAN TO TAKE THE QUIZ" : "扫码测你的旅行人格";
  fitFont(ctx, qrLabel, 240, 20, 15);
  ctx.fillText(qrLabel, 841, 1370);
  ctx.textAlign = "left";

  return canvasBlob(canvas);
}
