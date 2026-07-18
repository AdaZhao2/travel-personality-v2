import { dimensionLabels, englishDimensionLabels } from "@/lib/constants";
import type { Language } from "@/lib/i18n";
import { decodeSharedResult, encodeSharedResult } from "@/lib/share";
import { dimensionIds, type DimensionId, type Scores } from "@/lib/types";

export type FriendSnapshot = { p: string; s: Scores };

const frictionTeases: Record<DimensionId, string> = {
  npc: "一个等对方拍板，一个已经替全队做主；群聊不会冷场，但可能很长。",
  chaos: "一个把意外叫隐藏支线，另一个已经在搜索客服；翻车时记得先保护友情。",
  hype: "一个已经付款，另一个还在研究退款规则；限定名额会成为感情压力测试。",
  spend: "一个想升级房型，一个在心算人均；建议出发前先统一“值得”的定义。",
  camera: "一个在追光找角度，一个已经走出画面；摄影师岗位需要提前排班。",
  control: "一个想给散步建表格，一个把表格当壁纸；行程表最好准备可编辑版本。",
};

function isScores(value: unknown): value is Scores {
  if (!value || typeof value !== "object") return false;
  return dimensionIds.every((dimension) => {
    const score = (value as Record<string, unknown>)[dimension];
    return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
  });
}

export function encodeFriendSnapshot(snapshot: FriendSnapshot) {
  return encodeSharedResult(snapshot);
}

export function decodeFriendSnapshot(value: string): FriendSnapshot {
  const payload = decodeSharedResult(value);
  if (typeof payload.p !== "string" || !isScores(payload.s)) throw new Error("Invalid friend snapshot");
  return { p: payload.p, s: payload.s };
}

function matchVerdict(percentage: number) {
  if (percentage >= 90) return { headline: "旅行脑电波疑似共用同一条 Wi‑Fi", summary: "默契高到有点可疑。唯一的风险是，你们可能一起上头，却没人负责踩刹车。" };
  if (percentage >= 75) return { headline: "适合一起出发，偶尔争夺导游话筒", summary: "大方向不用解释，小分歧足够制造旅途素材，属于回来后还能继续约下一次。" };
  if (percentage >= 60) return { headline: "有默契也有分工，吵完还能赶上车", summary: "你们不是复制粘贴，但差异暂时还在友情可承受范围内。" };
  if (percentage >= 40) return { headline: "互补得很具体，出发前建议先划分权限", summary: "一个人的理所当然，可能是另一个人的突发事故；好消息是至少不容易无聊。" };
  return { headline: "友情经得起考验，行程未必经得起", summary: "建议购买可取消选项、准备两份路线，并约定谁先翻白眼谁负责买咖啡。" };
}

export function calculateFriendMatch(yours: Scores, friend: Scores, language: Language = "zh") {
  const differences = dimensionIds
    .map((dimension) => ({ dimension, difference: Math.abs(yours[dimension] - friend[dimension]) }))
    .sort((a, b) => a.difference - b.difference);
  const averageDifference = differences.reduce((sum, item) => sum + item.difference, 0) / dimensionIds.length;
  const percentage = Math.max(0, Math.min(100, Math.round(100 - averageDifference)));
  const closest = differences[0];
  const friction = differences[differences.length - 1];
  if (language === "en") {
    const verdict = percentage >= 90 ? ["Same travel brain. One shared remaining brain cell.", "The compatibility is suspicious. Main risk: you will enable each other and nobody will know where the passports are."] : percentage >= 75 ? ["Book the trip. Expect one dramatic disagreement at Departures.", "You agree on the important things and differ just enough to generate excellent post-trip lore."] : percentage >= 60 ? ["Compatible enough to share a room—and the blame", "Not identical, but the differences are still within friendship’s baggage allowance."] : percentage >= 40 ? ["A strong case for separate itineraries and one shared dinner", "One person’s obvious choice is the other’s minor emergency. You will not, however, be bored."] : ["The friendship is strong. It will need to be.", "Book cancellable everything, keep two itineraries, and decide in advance who gets custody of the charger."];
    const frictionCopy: Record<DimensionId, string> = { npc: "One is waiting for a decision; the other has formed a transport ministry. The group chat will require minutes.", chaos: "One calls it a side quest. The other is already on hold with customer service. Save the friendship before filming the recap.", hype: "One has paid; the other is reading the cancellation policy. A red countdown timer could end this friendship.", spend: "One wants the suite; the other has opened Splitwise. Define ‘worth it’ before anyone enters card details.", camera: "One is chasing golden hour; the other has walked out of frame. Photographer duties require a formal rota.", control: "One has made a spreadsheet for wandering. The other has muted the spreadsheet. Keep one editable copy and several deep breaths." };
    return { percentage, closest: { ...closest, label: englishDimensionLabels[closest.dimension] }, friction: { ...friction, label: englishDimensionLabels[friction.dimension] }, closestTease: `Only ${closest.difference} points apart on ${englishDimensionLabels[closest.dimension]}. Finally, something that does not need a poll.`, frictionTease: frictionCopy[friction.dimension], headline: verdict[0], summary: verdict[1] };
  }

  return {
    percentage,
    closest: { ...closest, label: dimensionLabels[closest.dimension] },
    friction: { ...friction, label: dimensionLabels[friction.dimension] },
    closestTease: `你们在「${dimensionLabels[closest.dimension]}」上只差 ${closest.difference} 分，至少这件事不用开会。`,
    frictionTease: frictionTeases[friction.dimension],
    ...matchVerdict(percentage),
  };
}
