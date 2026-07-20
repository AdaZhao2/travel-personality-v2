import { HeartHandshake, Link2, Sparkles, Users } from "lucide-react";
import { dimensions } from "@/lib/constants";
import { getPersona } from "@/data/catalog";
import { calculateFriendMatch, type FriendSnapshot } from "@/lib/friend-match";
import type { Persona, Scores } from "@/lib/types";
import { localizePersona, type Language } from "@/lib/i18n";

export function FriendMatch({ persona, scores, friend, language = "zh" }: { persona: Persona; scores: Scores; friend?: FriendSnapshot | null; language?: Language }) {
  const en = language === "en";
  if (!friend) {
    return (
      <section data-testid="friend-match" className="mt-6 overflow-hidden rounded-[2rem] border-2 border-[#17142f] bg-[#ffd84d] p-6 shadow-[6px_6px_0_#17142f] sm:p-9">
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-[#17142f] bg-white shadow-[4px_4px_0_#7657ff]"><Users size={36} strokeWidth={2.5} /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#5635c7]">Friend Match · {en ? "Locked" : "待解锁"}</p>
            <h2 className="display mt-2 text-3xl sm:text-5xl">{en ? "Now put the friendship through airport security" : "你负责交卷，好友负责接受友情质检"}</h2>
            <p className="mt-3 max-w-3xl font-bold leading-relaxed text-black/65">{en ? "Send them the invite. Once they finish, AI will decide whether you belong on the same flight—or in separate terminals." : "把下方邀请链接发给好友。对方完成测试后，AI 会告诉你们：是该坐同一班飞机，还是保持安全距离"}</p>
          </div>
        </div>
      </section>
    );
  }

  const friendPersona = localizePersona(getPersona(friend.p), language);
  const match = calculateFriendMatch(scores, friend.s, language);
  const closestDimension = dimensions.find((item) => item.id === match.closest.dimension);
  const frictionDimension = dimensions.find((item) => item.id === match.friction.dimension);

  return (
    <section data-testid="friend-match" className="mt-6 overflow-hidden rounded-[2rem] border-2 border-[#17142f] bg-[#ffd84d] p-6 shadow-[6px_6px_0_#17142f] sm:p-9">
      <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
        <div className="rounded-[1.75rem] border-2 border-[#17142f] bg-[#17142f] p-6 text-center text-white shadow-[6px_6px_0_#7657ff]">
          <HeartHandshake className="mx-auto text-[#c8ff55]" size={34} />
          <p className="mt-3 text-xs font-black uppercase tracking-[.2em] text-white/65">Friend Match</p>
          <strong data-testid="friend-match-percentage" className="display mt-2 block text-7xl text-[#ffd84d] sm:text-8xl">{match.percentage}%</strong>
          <p className="mt-3 text-sm font-black">{persona.code} × {friendPersona.code}</p>
          <p className="mt-2 text-xs font-bold text-white/60">{en ? "Based on the average difference across six travel dimensions" : "按六个旅行分项的平均差异计算"}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[#5635c7]"><Sparkles size={19} /><span className="text-xs font-black uppercase tracking-[.18em]">{en ? "Travel compatibility report" : "友情旅行兼容性报告"}</span></div>
          <h2 className="display mt-3 text-balance text-4xl leading-tight sm:text-5xl">{match.headline}</h2>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed text-black/70">{match.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#17142f] bg-[#c8ff55] p-5">
              <p className="text-xs font-black uppercase tracking-wider text-black/55">{en ? "Closest match" : "最合拍分项"}</p>
              <h3 className="display mt-2 text-2xl">{closestDimension?.emoji} {match.closest.label} · {en ? "Gap" : "差"} {match.closest.difference}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-black/65">{match.closestTease}</p>
            </div>
            <div className="rounded-2xl border-2 border-[#17142f] bg-[#ffeff7] p-5">
              <p className="text-xs font-black uppercase tracking-wider text-[#b51662]">{en ? "Most likely friction" : "最容易互相无语"}</p>
              <h3 className="display mt-2 text-2xl">{frictionDimension?.emoji} {match.friction.label} · {en ? "Gap" : "差"} {match.friction.difference}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-black/65">{match.frictionTease}</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs font-bold text-black/50"><Link2 size={14} /> {en ? "Send the result back so they can face the same friendship audit." : "把结果链接发回去，让对方也接受这份友情审计。"}</p>
        </div>
      </div>
    </section>
  );
}
