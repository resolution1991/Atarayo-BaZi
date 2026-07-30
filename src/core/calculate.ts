import type { BaziData, BaziInput, LunarCalendarSource, PillarName } from "./types.ts";
import { getLunarInfo, parseDateTime, resolvePillars } from "./calendar.ts";
import { enhanceBaziData } from "./enhance.ts";
import { analyzeShiShen } from "./shi-shen.ts";
import { analyzeStrength } from "./strength.ts";
import { analyzeGeju } from "./geju.ts";
import type { CalculationProfile } from "./calculation-profile.ts";
import type { SolarTermLookup } from "./solar-terms.ts";

const PILLAR_KEYS: Array<[PillarName, "year_ganzhi" | "month_ganzhi" | "day_ganzhi" | "hour_ganzhi"]> = [
  ["year", "year_ganzhi"],
  ["month", "month_ganzhi"],
  ["day", "day_ganzhi"],
  ["hour", "hour_ganzhi"],
];

export function calculateBazi(input: BaziInput, lunarData: LunarCalendarSource): BaziData {
  const dt = parseDateTime(input.birth_datetime);
  const lunarInfo = getLunarInfo(dt, lunarData);

  const birthInfo = {
    gregorian_date: `${dt.year}-${pad2(dt.month)}-${pad2(dt.day)}`,
    lunar_date: lunarInfo.lunar_date,
    birth_time: `${pad2(dt.hour)}:${pad2(dt.minute)}`,
  } as BaziData["person"]["birth_info"];

  for (const [pillar, key] of PILLAR_KEYS) {
    const ganzhi = lunarInfo[key];
    birthInfo[pillar] = {
      heavenly_stem: { symbol: ganzhi[0] },
      earthly_branch: { symbol: ganzhi[1] },
    };
  }

  const data: BaziData = {
    person: {
      name: input.name,
      gender: input.gender,
      birth_info: birthInfo,
    },
  };

  enhanceBaziData(data);
  analyzeShiShen(data);

  const strength = analyzeStrength(data);
  const geju = analyzeGeju(data);
  data.geju_analysis = { strength, geju };

  return data;
}

export interface CalculationContext {
  lunarData: LunarCalendarSource;
  solarTerms: SolarTermLookup;
  appVersion: string;
  engineVersion: string;
  solarTermDataVersion: string;
}

export interface CalculationTrace {
  normalizedInput: BaziInput;
  effectiveDate: string;
  yearBoundary: {
    mode: CalculationProfile["settings"]["yearBoundary"];
    boundaryAt: string;
    result: string;
  };
  monthBoundary: {
    previousJie: { name: string; dateTime: string };
    nextJie: { name: string; dateTime: string };
    result: string;
  };
  dayBoundary: {
    mode: CalculationProfile["settings"]["dayBoundary"];
    rolled: boolean;
    result: string;
  };
  hourRule: {
    ziHourMode: CalculationProfile["settings"]["ziHourMode"];
    dayStemSource: "effective-day" | "civil-day";
    result: string;
  };
}

export interface CalculatedChart {
  data: BaziData;
  trace: CalculationTrace;
}

export function calculateBaziWithProfile(
  input: BaziInput,
  context: CalculationContext,
  profile: CalculationProfile,
): CalculatedChart {
  const dt = parseDateTime(input.birth_datetime);
  const resolved = resolvePillars(dt, context.lunarData, context.solarTerms, profile.settings);
  const birthInfo = {
    gregorian_date: `${dt.year}-${pad2(dt.month)}-${pad2(dt.day)}`,
    lunar_date: resolved.lunarDate,
    birth_time: `${pad2(dt.hour)}:${pad2(dt.minute)}`,
    zodiac: resolved.zodiac,
  } as BaziData["person"]["birth_info"];

  const ganzhiByPillar: Record<PillarName, string> = {
    year: resolved.yearGanzhi,
    month: resolved.monthGanzhi,
    day: resolved.dayGanzhi,
    hour: resolved.hourGanzhi,
  };
  for (const pillar of Object.keys(ganzhiByPillar) as PillarName[]) {
    const ganzhi = ganzhiByPillar[pillar];
    birthInfo[pillar] = {
      heavenly_stem: { symbol: ganzhi[0] },
      earthly_branch: { symbol: ganzhi[1] },
    };
  }

  const data: BaziData = {
    person: {
      name: input.name,
      gender: input.gender,
      birth_info: birthInfo,
    },
  };
  enhanceBaziData(data);
  analyzeShiShen(data);
  data.geju_analysis = {
    strength: analyzeStrength(data),
    geju: analyzeGeju(data),
  };

  return {
    data,
    trace: {
      normalizedInput: { ...input },
      effectiveDate: resolved.effectiveDate,
      yearBoundary: {
        mode: profile.settings.yearBoundary,
        boundaryAt: resolved.yearBoundaryAt,
        result: resolved.yearGanzhi,
      },
      monthBoundary: {
        previousJie: { name: resolved.previousJie.name, dateTime: resolved.previousJie.cst },
        nextJie: { name: resolved.nextJie.name, dateTime: resolved.nextJie.cst },
        result: resolved.monthGanzhi,
      },
      dayBoundary: {
        mode: profile.settings.dayBoundary,
        rolled: resolved.dayRolled,
        result: resolved.dayGanzhi,
      },
      hourRule: {
        ziHourMode: profile.settings.ziHourMode,
        dayStemSource: resolved.hourDayStemSource,
        result: resolved.hourGanzhi,
      },
    },
  };
}

export function summarizeBazi(data: BaziData) {
  const birthInfo = data.person.birth_info;
  return {
    pillars: {
      year: `${birthInfo.year.heavenly_stem.symbol}${birthInfo.year.earthly_branch.symbol}`,
      month: `${birthInfo.month.heavenly_stem.symbol}${birthInfo.month.earthly_branch.symbol}`,
      day: `${birthInfo.day.heavenly_stem.symbol}${birthInfo.day.earthly_branch.symbol}`,
      hour: `${birthInfo.hour.heavenly_stem.symbol}${birthInfo.hour.earthly_branch.symbol}`,
    },
    strength: data.geju_analysis?.strength,
    geju: data.geju_analysis?.geju,
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
