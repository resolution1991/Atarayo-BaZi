import type { StrengthSchool } from "./strength.ts";

export type DayBoundary = "midnight" | "zi-begin";
export type ZiHourMode = "unified" | "split";
export type YearBoundary = "lichun" | "lunar-new-year";
export type ZodiacBoundary = "lichun" | "lunar-new-year";
export type PillarDisplayOrder = "year-to-hour" | "hour-to-year";
export type RuleSetId = "legacy-v1";

export interface RuleSetSelection {
  enabled: boolean;
  ruleSet: RuleSetId;
}

export interface CalculationSettings {
  schemaVersion: 1;
  dayBoundary: DayBoundary;
  ziHourMode: ZiHourMode;
  yearBoundary: YearBoundary;
  zodiacBoundary: ZodiacBoundary;
  pillarDisplayOrder: PillarDisplayOrder;
  defaultStrengthSchool: StrengthSchool;
  shenSha: RuleSetSelection;
  relations: RuleSetSelection;
  timeZoneOffsetMinutes: 480;
}

export interface CalculationProfile {
  id: "legacy-v0.4" | "standard-v0.5";
  label: string;
  settings: CalculationSettings;
}

export interface CalculationSnapshot {
  appVersion: string;
  engineVersion: string;
  solarTermDataVersion: string;
  profileId: CalculationProfile["id"];
  profileLabel: string;
  settings: CalculationSettings;
}

export const APP_VERSION = "0.5.0";
export const ENGINE_VERSION = "bazi-engine-0.5.0";
export const SOLAR_TERM_DATA_VERSION = "de440s-skyfield-1.53-v1";

const DEFAULT_SETTINGS: CalculationSettings = {
  schemaVersion: 1,
  dayBoundary: "zi-begin",
  ziHourMode: "unified",
  yearBoundary: "lunar-new-year",
  zodiacBoundary: "lunar-new-year",
  pillarDisplayOrder: "year-to-hour",
  defaultStrengthSchool: "traditional",
  shenSha: { enabled: true, ruleSet: "legacy-v1" },
  relations: { enabled: true, ruleSet: "legacy-v1" },
  timeZoneOffsetMinutes: 480,
};

export const LEGACY_V0_4_PROFILE: Readonly<CalculationProfile> = deepFreeze({
  id: "legacy-v0.4",
  label: "旧版默认口径",
  settings: cloneCalculationSettings(DEFAULT_SETTINGS),
});

export const STANDARD_V0_5_PROFILE: Readonly<CalculationProfile> = deepFreeze({
  id: "standard-v0.5",
  label: "标准口径 0.5",
  settings: cloneCalculationSettings(DEFAULT_SETTINGS),
});

export function cloneCalculationSettings(settings: CalculationSettings): CalculationSettings {
  return {
    ...settings,
    shenSha: { ...settings.shenSha },
    relations: { ...settings.relations },
  };
}

export function createStandardProfile(settings: CalculationSettings): CalculationProfile {
  return {
    id: "standard-v0.5",
    label: "标准口径 0.5",
    settings: cloneCalculationSettings(settings),
  };
}

export function normalizeCalculationSettings(value: unknown): CalculationSettings {
  const source = isRecord(value) ? value : {};
  const shenSha = isRecord(source.shenSha) ? source.shenSha : {};
  const relations = isRecord(source.relations) ? source.relations : {};

  return {
    schemaVersion: 1,
    dayBoundary: oneOf(source.dayBoundary, ["midnight", "zi-begin"], DEFAULT_SETTINGS.dayBoundary),
    ziHourMode: oneOf(source.ziHourMode, ["unified", "split"], DEFAULT_SETTINGS.ziHourMode),
    yearBoundary: oneOf(source.yearBoundary, ["lichun", "lunar-new-year"], DEFAULT_SETTINGS.yearBoundary),
    zodiacBoundary: oneOf(
      source.zodiacBoundary,
      ["lichun", "lunar-new-year"],
      DEFAULT_SETTINGS.zodiacBoundary,
    ),
    pillarDisplayOrder: oneOf(
      source.pillarDisplayOrder,
      ["year-to-hour", "hour-to-year"],
      DEFAULT_SETTINGS.pillarDisplayOrder,
    ),
    defaultStrengthSchool: oneOf(
      source.defaultStrengthSchool,
      ["traditional", "academic"],
      DEFAULT_SETTINGS.defaultStrengthSchool,
    ),
    shenSha: {
      enabled: typeof shenSha.enabled === "boolean" ? shenSha.enabled : DEFAULT_SETTINGS.shenSha.enabled,
      ruleSet: "legacy-v1",
    },
    relations: {
      enabled: typeof relations.enabled === "boolean" ? relations.enabled : DEFAULT_SETTINGS.relations.enabled,
      ruleSet: "legacy-v1",
    },
    timeZoneOffsetMinutes: 480,
  };
}

export function describeCalculationSettings(settings: CalculationSettings): string {
  return [
    settings.dayBoundary === "zi-begin" ? "23点换日" : "0点换日",
    settings.ziHourMode === "split" ? "早晚子时" : "统一子时",
    settings.yearBoundary === "lichun" ? "立春年界" : "农历年界",
    settings.defaultStrengthSchool === "traditional" ? "传统派" : "学术派",
  ].join(" · ");
}

function oneOf<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) {
      deepFreeze(nested);
    }
  }
  return value;
}
