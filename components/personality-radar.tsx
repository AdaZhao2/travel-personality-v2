"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { dimensions } from "@/lib/constants";
import type { Scores } from "@/lib/types";

export function PersonalityRadar({ scores }: { scores: Scores }) {
  const data = dimensions.map((dimension) => ({ name: `${dimension.emoji} ${dimension.label}`, value: scores[dimension.id], fullMark: 100 }));
  return (
    <div className="h-[350px] w-full sm:h-[430px] lg:h-[440px]" aria-label="旅行人格六维雷达图">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#17142f" strokeOpacity={.22} />
          <PolarAngleAxis dataKey="name" tick={{ fill: "#17142f", fontSize: 13, fontWeight: 800 }} />
          <Radar dataKey="value" stroke="#7657ff" strokeWidth={3} fill="#7657ff" fillOpacity={.43} dot={{ r: 4, fill: "#c8ff55", stroke: "#17142f", strokeWidth: 2 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
