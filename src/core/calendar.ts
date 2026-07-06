import {
  BaziValueError,
  type LunarCalendarEntry,
  type LunarCalendarSource,
  type LunarInfo,
  type ParsedDateTime,
} from "./types.ts";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "./rules.ts";

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
  const data = getLunarCalendarEntry(lunarData, dateKey);
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

export function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000) + 1;
}

function getLunarCalendarEntry(source: LunarCalendarSource, dateKey: string): LunarCalendarEntry | undefined {
  if ("get" in source && typeof source.get === "function") {
    return source.get(dateKey);
  }
  return source[dateKey];
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
