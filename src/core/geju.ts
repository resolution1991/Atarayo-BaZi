import type { BaziData, WuXing } from "./types.ts";
import { GENERATING_RELATIONS, OVERCOMING_RELATIONS } from "./rules.ts";

export function analyzeGeju(baziData: BaziData): string {
  const birthInfo = baziData.person.birth_info;
  const dayGan = birthInfo.day.heavenly_stem.symbol;
  const monthZhi = birthInfo.month.earthly_branch.symbol;

  const jianLuRelations: Record<string, string> = {
    甲: "寅",
    乙: "卯",
    丙: "巳",
    丁: "午",
    戊: "巳",
    己: "午",
    庚: "申",
    辛: "酉",
    壬: "亥",
    癸: "子",
  };

  const yangRenRelations: Record<string, string> = {
    甲: "卯",
    乙: "寅",
    丙: "午",
    丁: "巳",
    戊: "午",
    己: "巳",
    庚: "酉",
    辛: "申",
    壬: "子",
    癸: "亥",
  };

  if (monthZhi === jianLuRelations[dayGan]) {
    return "建禄格";
  }
  if (monthZhi === yangRenRelations[dayGan]) {
    return "阳刃格";
  }

  const yearGan = birthInfo.year.heavenly_stem.symbol;
  const monthGan = birthInfo.month.heavenly_stem.symbol;
  const hourGan = birthInfo.hour.heavenly_stem.symbol;

  const yearGanWuxing = birthInfo.year.heavenly_stem.wu_xing as WuXing;
  const monthGanWuxing = birthInfo.month.heavenly_stem.wu_xing as WuXing;
  const dayGanWuxing = birthInfo.day.heavenly_stem.wu_xing as WuXing;
  const hourGanWuxing = birthInfo.hour.heavenly_stem.wu_xing as WuXing;

  const yearZhiWuxing = birthInfo.year.earthly_branch.wu_xing as WuXing;
  const monthZhiWuxing = birthInfo.month.earthly_branch.wu_xing as WuXing;
  const dayZhiWuxing = birthInfo.day.earthly_branch.wu_xing as WuXing;
  const hourZhiWuxing = birthInfo.hour.earthly_branch.wu_xing as WuXing;

  const wuxingCount: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  for (const wuxing of [
    yearGanWuxing,
    monthGanWuxing,
    dayGanWuxing,
    hourGanWuxing,
    yearZhiWuxing,
    monthZhiWuxing,
    dayZhiWuxing,
    hourZhiWuxing,
  ]) {
    wuxingCount[wuxing] += 1;
  }

  if (
    ["甲", "乙"].includes(dayGan) &&
    ["亥", "寅", "卯", "辰"].includes(monthZhi) &&
    (["甲", "乙"].includes(yearGan) || ["甲", "乙"].includes(monthGan) || ["甲", "乙"].includes(hourGan)) &&
    wuxingCount.木 >= 4
  ) {
    return "曲直格（木专旺）";
  }

  if (
    ["丙", "丁"].includes(dayGan) &&
    ["寅", "巳", "午", "未"].includes(monthZhi) &&
    (["丙", "丁"].includes(yearGan) || ["丙", "丁"].includes(monthGan) || ["丙", "丁"].includes(hourGan)) &&
    wuxingCount.火 >= 4
  ) {
    return "炎上格（火专旺）";
  }

  if (
    ["戊", "己"].includes(dayGan) &&
    ["辰", "戊", "丑", "未"].includes(monthZhi) &&
    (["戊", "己"].includes(yearGan) || ["戊", "己"].includes(monthGan) || ["戊", "己"].includes(hourGan)) &&
    wuxingCount.土 >= 4
  ) {
    return "稼穑格（土专旺）";
  }

  if (
    ["庚", "辛"].includes(dayGan) &&
    ["申", "酉", "戊", "辰", "丑"].includes(monthZhi) &&
    (["庚", "辛"].includes(yearGan) || ["庚", "辛"].includes(monthGan) || ["庚", "辛"].includes(hourGan)) &&
    wuxingCount.金 >= 4
  ) {
    return "从革格（金专旺）";
  }

  if (
    ["壬", "癸"].includes(dayGan) &&
    ["申", "亥", "子", "丑"].includes(monthZhi) &&
    (["壬", "癸"].includes(yearGan) || ["壬", "癸"].includes(monthGan) || ["壬", "癸"].includes(hourGan)) &&
    wuxingCount.水 >= 4
  ) {
    return "润下格（水专旺）";
  }

  const allWuxing = [
    yearGanWuxing,
    monthGanWuxing,
    hourGanWuxing,
    yearZhiWuxing,
    monthZhiWuxing,
    dayZhiWuxing,
    hourZhiWuxing,
  ];
  const allGanWuxing = [yearGanWuxing, monthGanWuxing, hourGanWuxing];
  const allZhiWuxing = [yearZhiWuxing, monthZhiWuxing, dayZhiWuxing, hourZhiWuxing];

  const shengOrSameDayCount = allWuxing.filter(
    (wuxing) => GENERATING_RELATIONS[wuxing] === dayGanWuxing || wuxing === dayGanWuxing,
  ).length;
  const keByDayZhiCount = allZhiWuxing.filter((wuxing) => OVERCOMING_RELATIONS[dayGanWuxing] === wuxing).length;
  const keByDayGanCount = allGanWuxing.filter((wuxing) => OVERCOMING_RELATIONS[dayGanWuxing] === wuxing).length;
  const keDayZhiCount = allZhiWuxing.filter((wuxing) => OVERCOMING_RELATIONS[wuxing] === dayGanWuxing).length;
  const keDayGanCount = allGanWuxing.filter((wuxing) => OVERCOMING_RELATIONS[wuxing] === dayGanWuxing).length;
  const shengByDayZhiCount = allZhiWuxing.filter((wuxing) => GENERATING_RELATIONS[dayGanWuxing] === wuxing).length;
  const shengByDayGanCount = allGanWuxing.filter((wuxing) => GENERATING_RELATIONS[dayGanWuxing] === wuxing).length;

  if (shengOrSameDayCount <= 1 && keByDayZhiCount >= 2 && keByDayGanCount >= 1) {
    return "从财格";
  }
  if (shengOrSameDayCount <= 1 && keDayZhiCount >= 2 && keDayGanCount >= 1) {
    return "从杀格";
  }
  if (shengOrSameDayCount <= 1 && shengByDayZhiCount >= 2 && shengByDayGanCount >= 1) {
    return "从儿格";
  }

  const monthHiddenStems = birthInfo.month.earthly_branch.hidden_stems ?? [];
  const monthBenQi = monthHiddenStems[0];
  const monthZhongQi = monthHiddenStems[1];
  const monthYuQi = monthHiddenStems[2];

  const ganShiShen = [
    birthInfo.year.heavenly_stem.shi_shen,
    birthInfo.month.heavenly_stem.shi_shen,
    birthInfo.hour.heavenly_stem.shi_shen,
  ];

  if (monthBenQi?.shi_shen && ganShiShen.includes(monthBenQi.shi_shen)) {
    return `${monthBenQi.shi_shen}格`;
  }
  if (monthZhongQi?.shi_shen && ganShiShen.includes(monthZhongQi.shi_shen)) {
    return `${monthZhongQi.shi_shen}格`;
  }
  if (monthYuQi?.shi_shen && ganShiShen.includes(monthYuQi.shi_shen)) {
    return `${monthYuQi.shi_shen}格`;
  }
  if (monthBenQi?.shi_shen) {
    return `${monthBenQi.shi_shen}格`;
  }
  return "待定格局";
}

