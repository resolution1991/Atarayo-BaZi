import type { BaziData, PillarName } from "./types.ts";
import { buildLuckTimeline, type DaYunItem, type LiuNianItem, type LuckBranch } from "./luck.ts";

const PILLARS: Array<{ key: PillarName; label: string }> = [
  { key: "year", label: "年柱" },
  { key: "month", label: "月柱" },
  { key: "day", label: "日柱" },
  { key: "hour", label: "时柱" },
];

export function formatFutureLuckExport(
  data: BaziData,
  currentYear = new Date().getFullYear(),
  yearCount = 10,
): string {
  const timeline = buildLuckTimeline(data);
  const endYear = currentYear + yearCount - 1;
  const lines = [
    `未来${yearCount}年流年大运（${currentYear}—${endYear}）`,
    "",
    "【命盘四柱】",
    `四柱八字：${PILLARS.map(({ key, label }) => `${label}${getPillarGanzhi(data, key)}`).join("　")}`,
    "",
  ];

  PILLARS.forEach(({ key, label }, index) => {
    const pillar = data.person.birth_info[key];
    const hiddenStems = pillar.earthly_branch.hidden_stems ?? [];
    lines.push(
      `${label}：${getPillarGanzhi(data, key)}`,
      `主星：${pillar.heavenly_stem.shi_shen || "-"}`,
      `辅星：${formatList(hiddenStems.map((hidden) => hidden.shi_shen || "-"))}`,
      `藏干：${formatList(hiddenStems.map((hidden) => hidden.symbol))}`,
    );
    if (index < PILLARS.length - 1) {
      lines.push("");
    }
  });

  lines.push("", `【${currentYear}—${endYear}年流年大运】`);
  for (let year = currentYear; year <= endYear; year += 1) {
    const daYun = timeline.daYun.find((item) => year >= item.startYear && year <= item.endYear);
    const liuNian = daYun?.liuNian.find((item) => item.year === year);
    lines.push("", ...formatYearLuck(year, daYun, liuNian));
  }

  return lines.join("\n");
}

function getPillarGanzhi(data: BaziData, pillar: PillarName): string {
  const item = data.person.birth_info[pillar];
  return `${item.heavenly_stem.symbol}${item.earthly_branch.symbol}`;
}

function formatYearLuck(year: number, daYun?: DaYunItem, liuNian?: LiuNianItem): string[] {
  return [
    `【${year}年】`,
    ...formatLuckPillar("大运", daYun?.ganZhi || daYun?.label || "-", daYun?.stem?.shiShen, daYun?.branch),
    ...formatLuckPillar("流年", liuNian?.ganZhi || "-", liuNian?.stem.shiShen, liuNian?.branch),
  ];
}

function formatLuckPillar(label: string, ganZhi: string, mainStar?: string, branch?: LuckBranch): string[] {
  const hiddenStems = branch?.hiddenStems ?? [];
  return [
    `${label}：${ganZhi}`,
    `${label}主星：${mainStar || "-"}`,
    `${label}辅星：${formatList(hiddenStems.map((hidden) => hidden.shi_shen || "-"))}`,
    `${label}藏干：${formatList(hiddenStems.map((hidden) => hidden.symbol))}`,
  ];
}

function formatList(items: string[]): string {
  return items.length ? items.join("、") : "-";
}
