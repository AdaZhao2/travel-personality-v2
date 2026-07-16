import type { DimensionId } from "@/lib/types";

export const dimensions: Array<{ id: DimensionId; label: string; emoji: string; description: string }> = [
  { id: "npc", label: "NPC", emoji: "🎭", description: "跟队程度" },
  { id: "chaos", label: "整活", emoji: "🤡", description: "搞事浓度" },
  { id: "hype", label: "上头", emoji: "🔥", description: "冲动指数" },
  { id: "spend", label: "氪金", emoji: "💸", description: "体验付费" },
  { id: "camera", label: "出片", emoji: "📸", description: "仪式感" },
  { id: "control", label: "拿捏", emoji: "🧠", description: "掌控能力" },
];

export const dimensionLabels = Object.fromEntries(dimensions.map((item) => [item.id, item.label])) as Record<DimensionId, string>;

export function dimensionLevel(score: number) {
  if (score >= 80) return "爆表";
  if (score >= 60) return "高能";
  if (score >= 40) return "在线";
  return "低调";
}
