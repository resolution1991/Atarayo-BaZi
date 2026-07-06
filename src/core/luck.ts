import { getLunarCalendarEntry } from "../data/lunar-calendar.ts";
import { determineShiShen } from "./shi-shen.ts";
import type { BaziData, Gender, HiddenStemNode, WuXing } from "./types.ts";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS, getBranchRule, getStemRule } from "./rules.ts";

export interface LuckStartInfo {
  isForward: boolean;
  startYear: number;
  startMonth: number;
  startDay: number;
  startHour: number;
  startSolar: string;
  sourceJie: SolarTermPoint;
  targetJie: SolarTermPoint;
  precision: "day";
}

export interface SolarTermPoint {
  name: string;
  dateTime: string;
}

export interface LuckTimeline {
  birthYear: number;
  dayStem: string;
  start: LuckStartInfo;
  daYun: DaYunItem[];
}

export interface DaYunItem {
  index: number;
  label: string;
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  stem?: LuckStem;
  branch?: LuckBranch;
  liuNian: LiuNianItem[];
}

export interface LiuNianItem {
  index: number;
  year: number;
  age: number;
  ganZhi: string;
  stem: LuckStem;
  branch: LuckBranch;
  liuYue: LiuYueItem[];
}

export interface LiuYueItem {
  index: number;
  term: string;
  date: string;
  ganZhi: string;
  stem: LuckStem;
  branch: LuckBranch;
}

export interface LuckStem {
  symbol: string;
  wuXing: WuXing;
  shiShen: string;
}

export interface LuckBranch {
  symbol: string;
  wuXing: WuXing;
  hiddenStems: Array<Pick<HiddenStemNode, "symbol" | "wu_xing" | "shi_shen">>;
}

const JIA_ZI = Array.from({ length: 60 }, (_, index) => {
  return `${HEAVENLY_STEMS[index % HEAVENLY_STEMS.length]}${EARTHLY_BRANCHES[index % EARTHLY_BRANCHES.length]}`;
});

const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);
const MONTH_BRANCHES = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
const MONTH_TERMS = [
  { name: "立春", month: 2, day: 4 },
  { name: "惊蛰", month: 3, day: 5 },
  { name: "清明", month: 4, day: 5 },
  { name: "立夏", month: 5, day: 5 },
  { name: "芒种", month: 6, day: 5 },
  { name: "小暑", month: 7, day: 7 },
  { name: "立秋", month: 8, day: 7 },
  { name: "白露", month: 9, day: 7 },
  { name: "寒露", month: 10, day: 8 },
  { name: "立冬", month: 11, day: 7 },
  { name: "大雪", month: 12, day: 7 },
  { name: "小寒", month: 1, day: 5 },
];
const JIE_BY_MONTH_BRANCH: Record<string, string> = {
  寅: "立春",
  卯: "惊蛰",
  辰: "清明",
  巳: "立夏",
  午: "芒种",
  未: "小暑",
  申: "立秋",
  酉: "白露",
  戌: "寒露",
  亥: "立冬",
  子: "大雪",
  丑: "小寒",
};

export function buildLuckTimeline(data: BaziData, daYunCount = 10): LuckTimeline {
  const birthDate = parseBirthDateTime(data);
  const dayStem = data.person.birth_info.day.heavenly_stem.symbol;
  const start = calculateLuckStart(data);
  const birthYear = birthDate.getUTCFullYear();
  const startSolarDate = addLuckStart(birthDate, start);
  const startSolarYear = startSolarDate.getUTCFullYear();
  const daYun: DaYunItem[] = [];

  const smallLuckEndYear = startSolarYear - 1;
  if (smallLuckEndYear >= birthYear) {
    daYun.push(makeDaYunItem(data, dayStem, 0, "", birthYear, smallLuckEndYear, 1));
  }

  for (let index = 1; index <= daYunCount; index += 1) {
    const startYear = startSolarYear + (index - 1) * 10;
    const startAge = startYear - birthYear + 1;
    const ganZhi = getDaYunGanZhi(data.person.birth_info.month.heavenly_stem.symbol + data.person.birth_info.month.earthly_branch.symbol, index, start.isForward);
    daYun.push(makeDaYunItem(data, dayStem, index, ganZhi, startYear, startYear + 9, startAge));
  }

  return {
    birthYear,
    dayStem,
    start: {
      ...start,
      startSolar: formatDateTime(addLuckStart(birthDate, start)),
    },
    daYun,
  };
}

export function calculateLuckStart(data: BaziData): LuckStartInfo {
  const birthInfo = data.person.birth_info;
  const birthDate = parseBirthDateTime(data);
  const isForward = isDaYunForward(birthInfo.year.heavenly_stem.symbol, data.person.gender);
  const dateKey = birthInfo.gregorian_date;
  const sourceDate = isForward ? birthDate : dateFromKey(findCurrentJieDate(dateKey));
  const targetDate = isForward ? dateFromKey(findNextJieDate(dateKey)) : birthDate;
  const minutes = Math.max(0, Math.floor((targetDate.getTime() - sourceDate.getTime()) / 60000));
  const startParts = convertMinutesToLuckStart(minutes);
  const sourceEntry = getLunarCalendarEntry(formatDate(sourceDate));
  const targetEntry = getLunarCalendarEntry(formatDate(targetDate));

  return {
    ...startParts,
    isForward,
    startSolar: formatDateTime(addLuckStart(birthDate, { ...startParts })),
    sourceJie: {
      name: sourceEntry ? JIE_BY_MONTH_BRANCH[sourceEntry.ganzhi_month[1]] ?? "节" : "节",
      dateTime: formatDateTime(sourceDate),
    },
    targetJie: {
      name: targetEntry ? JIE_BY_MONTH_BRANCH[targetEntry.ganzhi_month[1]] ?? "节" : "节",
      dateTime: formatDateTime(targetDate),
    },
    precision: "day",
  };
}

export function getYearGanZhi(year: number): string {
  return `${HEAVENLY_STEMS[positiveModulo(year - 4, 10)]}${EARTHLY_BRANCHES[positiveModulo(year - 4, 12)]}`;
}

function makeDaYunItem(
  data: BaziData,
  dayStem: string,
  index: number,
  ganZhi: string,
  startYear: number,
  endYear: number,
  startAge: number,
): DaYunItem {
  const endAge = startAge + (endYear - startYear);
  const liuNian = Array.from({ length: endYear - startYear + 1 }, (_, liuNianIndex) =>
    makeLiuNian(data, dayStem, startYear + liuNianIndex, startAge + liuNianIndex, liuNianIndex),
  );
  return {
    index,
    label: index === 0 ? "小运" : ganZhi,
    ganZhi,
    startYear,
    endYear,
    startAge,
    endAge,
    stem: ganZhi ? makeLuckStem(dayStem, ganZhi[0]) : undefined,
    branch: ganZhi ? makeLuckBranch(dayStem, ganZhi[1]) : undefined,
    liuNian,
  };
}

function makeLiuNian(
  data: BaziData,
  dayStem: string,
  year: number,
  age: number,
  index: number,
): LiuNianItem {
  const ganZhi = getYearGanZhi(year);
  return {
    index,
    year,
    age,
    ganZhi,
    stem: makeLuckStem(dayStem, ganZhi[0]),
    branch: makeLuckBranch(dayStem, ganZhi[1]),
    liuYue: makeLiuYue(dayStem, year, ganZhi),
  };
}

function makeLiuYue(dayStem: string, year: number, yearGanZhi: string): LiuYueItem[] {
  const startStemIndex = getFirstMonthStemIndex(yearGanZhi[0]);
  return MONTH_BRANCHES.map((branch, index) => {
    const stem = HEAVENLY_STEMS[(startStemIndex + index) % HEAVENLY_STEMS.length];
    const term = MONTH_TERMS[index];
    const ganZhi = `${stem}${branch}`;
    return {
      index,
      term: term.name,
      date: `${term.month}/${term.day}`,
      ganZhi,
      stem: makeLuckStem(dayStem, stem),
      branch: makeLuckBranch(dayStem, branch),
    };
  });
}

function makeLuckStem(dayStem: string, stem: string): LuckStem {
  return {
    symbol: stem,
    wuXing: getStemRule(stem).wu_xing,
    shiShen: determineShiShen(dayStem, stem),
  };
}

function makeLuckBranch(dayStem: string, branch: string): LuckBranch {
  const rule = getBranchRule(branch);
  return {
    symbol: branch,
    wuXing: rule.wu_xing,
    hiddenStems: rule.hidden_stems.map((stem) => ({
      symbol: stem,
      wu_xing: getStemRule(stem).wu_xing,
      shi_shen: determineShiShen(dayStem, stem),
    })),
  };
}

function isDaYunForward(yearStem: string, gender: Gender): boolean {
  const isYangYear = YANG_STEMS.has(yearStem);
  const isMale = gender === "男";
  return (isYangYear && isMale) || (!isYangYear && !isMale);
}

function getDaYunGanZhi(monthGanZhi: string, index: number, isForward: boolean): string {
  const monthIndex = JIA_ZI.indexOf(monthGanZhi);
  if (monthIndex < 0) {
    return "";
  }
  return JIA_ZI[positiveModulo(monthIndex + (isForward ? index : -index), JIA_ZI.length)];
}

function getFirstMonthStemIndex(yearStem: string): number {
  if (yearStem === "甲" || yearStem === "己") {
    return HEAVENLY_STEMS.indexOf("丙");
  }
  if (yearStem === "乙" || yearStem === "庚") {
    return HEAVENLY_STEMS.indexOf("戊");
  }
  if (yearStem === "丙" || yearStem === "辛") {
    return HEAVENLY_STEMS.indexOf("庚");
  }
  if (yearStem === "丁" || yearStem === "壬") {
    return HEAVENLY_STEMS.indexOf("壬");
  }
  return HEAVENLY_STEMS.indexOf("甲");
}

function convertMinutesToLuckStart(minutes: number): Pick<LuckStartInfo, "startYear" | "startMonth" | "startDay" | "startHour"> {
  let remaining = minutes;
  const startYear = Math.floor(remaining / 4320);
  remaining -= startYear * 4320;
  const startMonth = Math.floor(remaining / 360);
  remaining -= startMonth * 360;
  const startDay = Math.floor(remaining / 12);
  remaining -= startDay * 12;
  const startHour = remaining * 2;
  return { startYear, startMonth, startDay, startHour };
}

function addLuckStart(
  date: Date,
  start: Pick<LuckStartInfo, "startYear" | "startMonth" | "startDay" | "startHour">,
): Date {
  const result = new Date(date.getTime());
  result.setUTCFullYear(result.getUTCFullYear() + start.startYear);
  result.setUTCMonth(result.getUTCMonth() + start.startMonth);
  result.setUTCDate(result.getUTCDate() + start.startDay);
  result.setUTCHours(result.getUTCHours() + start.startHour);
  return result;
}

function parseBirthDateTime(data: BaziData): Date {
  const info = data.person.birth_info;
  const [year, month, day] = info.gregorian_date.split("-").map(Number);
  const [hour, minute] = info.birth_time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

function findCurrentJieDate(dateKey: string): string {
  const current = getLunarCalendarEntry(dateKey);
  if (!current) {
    return dateKey;
  }

  let cursor = dateFromKey(dateKey);
  while (true) {
    const previous = addDays(cursor, -1);
    const previousEntry = getLunarCalendarEntry(formatDate(previous));
    if (!previousEntry || previousEntry.ganzhi_month !== current.ganzhi_month) {
      return formatDate(cursor);
    }
    cursor = previous;
  }
}

function findNextJieDate(dateKey: string): string {
  const current = getLunarCalendarEntry(dateKey);
  if (!current) {
    return dateKey;
  }

  let cursor = dateFromKey(dateKey);
  while (true) {
    cursor = addDays(cursor, 1);
    const entry = getLunarCalendarEntry(formatDate(cursor));
    if (!entry || entry.ganzhi_month !== current.ganzhi_month) {
      return formatDate(cursor);
    }
  }
}

function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
