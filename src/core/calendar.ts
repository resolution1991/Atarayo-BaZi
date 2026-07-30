import {
  BaziValueError,
  type LunarCalendarEntry,
  type LunarCalendarMap,
  type LunarCalendarSource,
  type LunarInfo,
  type ParsedDateTime,
} from "./types.ts";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "./rules.ts";
import type {
  CalculationSettings,
  DayBoundary,
  ZiHourMode,
} from "./calculation-profile.ts";
import type { SolarTermLookup, SolarTermRecord } from "./solar-terms.ts";

export function normalizeBirthDateTime(value: string): string {
  if (value.includes("T") && value.includes(":")) {
    const [datePart, timePart] = value.split("T");
    return `${datePart}-${timePart.replaceAll(":", "-")}`;
  }
  return value;
}

export function parseDateTime(value: string): ParsedDateTime {
  const normalized = normalizeBirthDateTime(value);
  const parts = normalized.split("-");
  try {
    if (parts.length !== 5) {
      throw new BaziValueError("日期时间格式应为 yyyy-mm-dd-hh-mm");
    }

    const [year, month, day, hour, minute] = parts.map((part) => Number(part));
    if ([year, month, day, hour, minute].some((part) => !Number.isInteger(part))) {
      throw new BaziValueError("日期时间格式应为 yyyy-mm-dd-hh-mm");
    }
    if (!(1900 <= year && year <= 2100)) {
      throw new BaziValueError("年份应在1900-2100之间");
    }
    if (!(1 <= month && month <= 12)) {
      throw new BaziValueError("月份应在1-12之间");
    }
    if (!(1 <= day && day <= 31)) {
      throw new BaziValueError("日应在1-31之间");
    }
    if (!(0 <= hour && hour <= 23)) {
      throw new BaziValueError("小时应在0-23之间");
    }
    if (!(0 <= minute && minute <= 59)) {
      throw new BaziValueError("分钟应在0-59之间");
    }
    if (day > daysInMonth(year, month)) {
      throw new BaziValueError("day is out of range for month");
    }

    return { year, month, day, hour, minute };
  } catch (error) {
    if (error instanceof BaziValueError && error.message.startsWith("日期时间格式错误:")) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new BaziValueError(`日期时间格式错误: ${message}`);
  }
}

export function getShichenGanzhi(dayGan: string, hour: number): string {
  const shichenDizhi: Record<number, string> = {
    0: "子",
    1: "丑",
    2: "丑",
    3: "寅",
    4: "寅",
    5: "卯",
    6: "卯",
    7: "辰",
    8: "辰",
    9: "巳",
    10: "巳",
    11: "午",
    12: "午",
    13: "未",
    14: "未",
    15: "申",
    16: "申",
    17: "酉",
    18: "酉",
    19: "戌",
    20: "戌",
    21: "亥",
    22: "亥",
    23: "子",
  };

  const shiZhi = shichenDizhi[hour];
  const dayGanIndex = HEAVENLY_STEMS.indexOf(dayGan);
  let shiGanStart: number;

  if ([0, 5].includes(dayGanIndex)) {
    shiGanStart = 0;
  } else if ([1, 6].includes(dayGanIndex)) {
    shiGanStart = 2;
  } else if ([2, 7].includes(dayGanIndex)) {
    shiGanStart = 4;
  } else if ([3, 8].includes(dayGanIndex)) {
    shiGanStart = 6;
  } else {
    shiGanStart = 8;
  }

  const zhiIndex = EARTHLY_BRANCHES.indexOf(shiZhi);
  const ganIndex = (shiGanStart + zhiIndex) % 10;
  return `${HEAVENLY_STEMS[ganIndex]}${shiZhi}`;
}

export function getLunarInfo(dt: ParsedDateTime, lunarData: LunarCalendarSource): LunarInfo {
  const dateKey = dt.hour >= 23 ? formatDate(addDays(dt, 1)) : formatDate(dt);
  const data = lookupLunarCalendarEntry(lunarData, dateKey);
  if (!data) {
    throw new BaziValueError(`日期 ${dateKey} 不在农历数据范围内`);
  }

  const dayGanzhi = data.ganzhi_day;
  return {
    lunar_date: `${data.lunar_year}年${data.lunar_month}月${data.lunar_day}日`,
    year_ganzhi: data.ganzhi_year,
    month_ganzhi: data.ganzhi_month,
    day_ganzhi: dayGanzhi,
    hour_ganzhi: getShichenGanzhi(dayGanzhi[0], dt.hour),
  };
}

export interface ResolvedPillars {
  lunarDate: string;
  zodiac: string;
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  hourGanzhi: string;
  effectiveDate: string;
  dayRolled: boolean;
  previousJie: SolarTermRecord;
  nextJie: SolarTermRecord;
  yearBoundaryAt: string;
  hourDayStemSource: "effective-day" | "civil-day";
}

const JIE_TO_MONTH_INDEX: Record<string, number> = {
  立春: 0,
  惊蛰: 1,
  清明: 2,
  立夏: 3,
  芒种: 4,
  小暑: 5,
  立秋: 6,
  白露: 7,
  寒露: 8,
  立冬: 9,
  大雪: 10,
  小寒: 11,
};
const ZODIAC_BY_BRANCH: Record<string, string> = {
  子: "鼠",
  丑: "牛",
  寅: "虎",
  卯: "兔",
  辰: "龙",
  巳: "蛇",
  午: "马",
  未: "羊",
  申: "猴",
  酉: "鸡",
  戌: "狗",
  亥: "猪",
};

export function resolvePillars(
  dt: ParsedDateTime,
  lunarData: LunarCalendarSource,
  solarTerms: SolarTermLookup,
  settings: CalculationSettings,
): ResolvedPillars {
  const civilDateKey = formatDate(dt);
  const civilEntry = lookupLunarCalendarEntry(lunarData, civilDateKey);
  if (!civilEntry) {
    throw new BaziValueError(`日期 ${civilDateKey} 不在农历数据范围内`);
  }

  const { dateKey: effectiveDate, rolled: dayRolled } = resolveEffectiveDate(dt, settings.dayBoundary);
  const effectiveEntry = lookupLunarCalendarEntry(lunarData, effectiveDate);
  if (!effectiveEntry) {
    throw new BaziValueError(`日期 ${effectiveDate} 不在农历数据范围内`);
  }

  const epochMinute = cstParsedDateTimeToEpochMinute(dt);
  const jieWindow = solarTerms.findWindow(epochMinute, "jie");
  const lichun = solarTerms.findByNameAndYear("立春", dt.year);
  if (!lichun) {
    throw new BaziValueError(`缺少 ${dt.year} 年立春节气数据`);
  }
  const lichunYear = epochMinute >= lichun.epochMinute ? dt.year : dt.year - 1;
  const lichunYearGanzhi = getYearGanzhi(lichunYear);
  const yearGanzhi =
    settings.yearBoundary === "lichun" ? lichunYearGanzhi : civilEntry.ganzhi_year;
  const zodiacGanzhi =
    settings.zodiacBoundary === "lichun" ? lichunYearGanzhi : civilEntry.ganzhi_year;
  const monthGanzhi = getMonthGanzhi(yearGanzhi[0], jieWindow.previous.name);

  const hourUsesCivilDay = settings.ziHourMode === "split" && dt.hour === 23;
  const hourDayStem = hourUsesCivilDay ? civilEntry.ganzhi_day[0] : effectiveEntry.ganzhi_day[0];

  return {
    lunarDate: `${civilEntry.lunar_year}年${civilEntry.lunar_month}月${civilEntry.lunar_day}日`,
    zodiac: ZODIAC_BY_BRANCH[zodiacGanzhi[1]] ?? "",
    yearGanzhi,
    monthGanzhi,
    dayGanzhi: effectiveEntry.ganzhi_day,
    hourGanzhi: getShichenGanzhi(hourDayStem, dt.hour),
    effectiveDate,
    dayRolled,
    previousJie: jieWindow.previous,
    nextJie: jieWindow.next,
    yearBoundaryAt:
      settings.yearBoundary === "lichun" ? lichun.cst : findLunarNewYearBoundary(dt.year, lunarData),
    hourDayStemSource: hourUsesCivilDay ? "civil-day" : "effective-day",
  };
}

export function resolveEffectiveDate(
  dt: ParsedDateTime,
  boundary: DayBoundary,
): { dateKey: string; rolled: boolean } {
  const rolled = boundary === "zi-begin" && dt.hour >= 23;
  return {
    dateKey: rolled ? formatDate(addDays(dt, 1)) : formatDate(dt),
    rolled,
  };
}

export function getYearGanzhi(year: number): string {
  const offset = year - 4;
  return `${HEAVENLY_STEMS[positiveModulo(offset, 10)]}${EARTHLY_BRANCHES[positiveModulo(offset, 12)]}`;
}

export function getMonthGanzhi(yearStem: string, jieName: string): string {
  const monthIndex = JIE_TO_MONTH_INDEX[jieName];
  if (!Number.isInteger(monthIndex)) {
    throw new BaziValueError(`无法由节气确定月柱: ${jieName}`);
  }
  const firstMonthStem = getFirstMonthStemIndex(yearStem);
  const stem = HEAVENLY_STEMS[(firstMonthStem + monthIndex) % 10];
  const branch = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf("寅") + monthIndex) % 12];
  return `${stem}${branch}`;
}

export function cstParsedDateTimeToEpochMinute(dt: ParsedDateTime): number {
  return Math.floor(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour - 8, dt.minute) / 60000);
}

export function describeZiHourMode(mode: ZiHourMode): string {
  return mode === "split" ? "早晚子时拆分" : "统一子时";
}

export function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000) + 1;
}

export function lookupLunarCalendarEntry(source: LunarCalendarSource, dateKey: string): LunarCalendarEntry | undefined {
  if ("get" in source && typeof source.get === "function") {
    return source.get(dateKey);
  }
  return (source as LunarCalendarMap)[dateKey];
}

function formatDate(dt: Pick<ParsedDateTime, "year" | "month" | "day">): string {
  return `${dt.year}-${pad2(dt.month)}-${pad2(dt.day)}`;
}

function addDays(dt: ParsedDateTime, days: number): ParsedDateTime {
  const date = new Date(Date.UTC(dt.year, dt.month - 1, dt.day + days, dt.hour, dt.minute));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: dt.hour,
    minute: dt.minute,
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getFirstMonthStemIndex(yearStem: string): number {
  if (yearStem === "甲" || yearStem === "己") return HEAVENLY_STEMS.indexOf("丙");
  if (yearStem === "乙" || yearStem === "庚") return HEAVENLY_STEMS.indexOf("戊");
  if (yearStem === "丙" || yearStem === "辛") return HEAVENLY_STEMS.indexOf("庚");
  if (yearStem === "丁" || yearStem === "壬") return HEAVENLY_STEMS.indexOf("壬");
  return HEAVENLY_STEMS.indexOf("甲");
}

function findLunarNewYearBoundary(year: number, lunarData: LunarCalendarSource): string {
  const start = new Date(Date.UTC(year, 0, 1));
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(start.getTime());
    date.setUTCDate(date.getUTCDate() + offset);
    const dateKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
    const entry = lookupLunarCalendarEntry(lunarData, dateKey);
    if (entry?.lunar_month === 1 && entry.lunar_day === 1) {
      return `${dateKey} 00:00`;
    }
  }
  return `${year}-01-01 00:00`;
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
