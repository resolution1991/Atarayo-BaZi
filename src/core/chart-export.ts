import type { BaziData, PillarName } from "./types.ts";
import { analyzeGanzhiRelations, type GanzhiRelation } from "./relations.ts";
import { analyzeShenSha } from "./shen-sha.ts";
import { analyzeStrengthBySchool } from "./strength.ts";
import type { CalculationSettings } from "./calculation-profile.ts";

const PILLARS: Array<{ key: PillarName; label: string }> = [
  { key: "year", label: "年柱" },
  { key: "month", label: "月柱" },
  { key: "day", label: "日柱" },
  { key: "hour", label: "时柱" },
];

const PILLAR_LABELS: Record<PillarName, string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  hour: "时柱",
};

export function formatChartExport(data: BaziData, settings?: CalculationSettings): string {
  const info = data.person.birth_info;
  const shenShaEnabled = settings?.shenSha.enabled !== false;
  const relationsEnabled = settings?.relations.enabled !== false;
  const shenSha = shenShaEnabled ? analyzeShenSha(data) : null;
  const relations = relationsEnabled ? analyzeGanzhiRelations(data) : [];
  const traditionalStrength = analyzeStrengthBySchool(data, "traditional");
  const academicStrength = analyzeStrengthBySchool(data, "academic");

  const lines = [
    "命盘信息",
    "",
    "【基本信息】",
    `性别：${data.person.gender}`,
    `公历生日：${joinDateAndTime(info.gregorian_date, info.birth_time)}`,
    `农历生日：${joinDateAndTime(info.lunar_date, info.birth_time)}`,
    `身强身弱（传统派）：${traditionalStrength}`,
    `身强身弱（学术派）：${academicStrength}`,
    `命盘格局：${data.geju_analysis?.geju || "-"}`,
    `四柱八字：${PILLARS.map(({ key, label }) => `${label}${getPillarGanzhi(data, key)}`).join("　")}`,
    "",
    "【四柱明细】",
  ];

  PILLARS.forEach(({ key, label }, index) => {
    const pillar = info[key];
    const hiddenStems = pillar.earthly_branch.hidden_stems ?? [];
    lines.push(
      `${label}：${getPillarGanzhi(data, key)}`,
      `主星：${pillar.heavenly_stem.shi_shen || "-"}`,
      `辅星：${formatList(hiddenStems.map((hidden) => hidden.shi_shen || "-"))}`,
      `藏干：${formatList(hiddenStems.map((hidden) => hidden.symbol))}`,
      `神煞：${shenSha ? formatList(shenSha[key].map((item) => item.name)) : "未启用"}`,
    );
    if (index < PILLARS.length - 1) {
      lines.push("");
    }
  });

  const stemRelations = relations.filter((relation) => relation.layer === "stem");
  const branchRelations = relations.filter((relation) => relation.layer === "branch");
  lines.push(
    "",
    "【天干作用关系】",
    ...(relationsEnabled ? formatRelations(stemRelations) : ["未启用"]),
    "",
    "【地支作用关系】",
    ...(relationsEnabled ? formatRelations(branchRelations) : ["未启用"]),
  );

  return lines.join("\n");
}

function getPillarGanzhi(data: BaziData, pillar: PillarName): string {
  const item = data.person.birth_info[pillar];
  return `${item.heavenly_stem.symbol}${item.earthly_branch.symbol}`;
}

function joinDateAndTime(date: string, time: string): string {
  return [date, time].filter(Boolean).join(" ");
}

function formatList(items: string[]): string {
  return items.length ? items.join("、") : "-";
}

function formatRelations(relations: GanzhiRelation[]): string[] {
  if (!relations.length) {
    return ["无"];
  }
  return relations.map((relation) => {
    const positions = relation.positions
      .map((position, index) => `${PILLAR_LABELS[position]}${relation.symbols[index] ?? ""}`)
      .join("、");
    return `${positions}：${relation.label}`;
  });
}
