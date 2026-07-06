import type { BaziData, PillarName, WuXing, YinYang } from "./types.ts";

const PILLARS: PillarName[] = ["year", "month", "day", "hour"];

const GAN_PROPS: Record<string, { wx: WuXing; yy: YinYang }> = {
  甲: { wx: "木", yy: "阳" },
  乙: { wx: "木", yy: "阴" },
  丙: { wx: "火", yy: "阳" },
  丁: { wx: "火", yy: "阴" },
  戊: { wx: "土", yy: "阳" },
  己: { wx: "土", yy: "阴" },
  庚: { wx: "金", yy: "阳" },
  辛: { wx: "金", yy: "阴" },
  壬: { wx: "水", yy: "阳" },
  癸: { wx: "水", yy: "阴" },
};

const WX_RELATIONS: Record<WuXing, { 生: WuXing; 克: WuXing }> = {
  木: { 生: "火", 克: "土" },
  火: { 生: "土", 克: "金" },
  土: { 生: "金", 克: "水" },
  金: { 生: "水", 克: "木" },
  水: { 生: "木", 克: "火" },
};

export function determineShiShen(dayGan: string, targetGan: string): string {
  const dg = GAN_PROPS[dayGan];
  const tg = GAN_PROPS[targetGan];

  if (dg.wx === tg.wx) {
    return dg.yy === tg.yy ? "比肩" : "劫财";
  }
  if (tg.wx === WX_RELATIONS[dg.wx].生) {
    return dg.yy === tg.yy ? "食神" : "伤官";
  }
  if (tg.wx === WX_RELATIONS[dg.wx].克) {
    return dg.yy === tg.yy ? "偏财" : "正财";
  }
  if (dg.wx === WX_RELATIONS[tg.wx].克) {
    return dg.yy === tg.yy ? "七杀" : "正官";
  }
  return dg.yy === tg.yy ? "偏印" : "正印";
}

export function analyzeShiShen(data: BaziData): BaziData {
  const birthInfo = data.person.birth_info;
  const dayGan = birthInfo.day.heavenly_stem.symbol;

  for (const pillar of PILLARS) {
    const stem = birthInfo[pillar].heavenly_stem;
    stem.shi_shen = determineShiShen(dayGan, stem.symbol);

    const branch = birthInfo[pillar].earthly_branch;
    for (const hiddenStem of branch.hidden_stems ?? []) {
      hiddenStem.shi_shen = determineShiShen(dayGan, hiddenStem.symbol);
    }
  }

  if (data.person.gender === "男") {
    birthInfo.day.heavenly_stem.shi_shen = "元男";
  } else if (data.person.gender === "女") {
    birthInfo.day.heavenly_stem.shi_shen = "元女";
  }

  return data;
}

