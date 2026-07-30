import type { CalculatedChart, CalculationTrace } from "../core/calculate.ts";
import {
  APP_VERSION,
  ENGINE_VERSION,
  LEGACY_V0_4_PROFILE,
  SOLAR_TERM_DATA_VERSION,
  cloneCalculationSettings,
  type CalculationProfile,
  type CalculationSnapshot,
} from "../core/calculation-profile.ts";
import type { BaziData, BaziInput } from "../core/types.ts";

export const HISTORY_KEY = "bazi_history_records";
export const HISTORY_BACKUP_KEY = "bazi_history_records_backup_v1";
export const HISTORY_SCHEMA_KEY = "bazi_history_schema_version";

interface LegacyHistoryRecord {
  id: string;
  created_at: string;
  data: BaziData;
}

export interface HistoryRecord {
  schemaVersion: 2;
  id: string;
  created_at: string;
  normalizedInput: BaziInput;
  data: BaziData;
  calculation: CalculationSnapshot;
  trace?: CalculationTrace;
  provenance: {
    migratedFrom?: "v1";
    derivedFromRecordId?: string;
    supersededByRecordId?: string;
  };
}

export function readHistory(): HistoryRecord[] {
  const stored = safeRead(HISTORY_KEY);
  if (!Array.isArray(stored)) {
    return [];
  }
  const migration = normalizeHistory(stored);
  if (migration.changed) {
    persistMigration(stored, migration.records);
  }
  return migration.records;
}

export function saveHistory(data: BaziData): HistoryRecord {
  const profile = LEGACY_V0_4_PROFILE;
  return saveRecord({
    data,
    normalizedInput: inputFromData(data),
    calculation: {
      appVersion: APP_VERSION,
      engineVersion: ENGINE_VERSION,
      solarTermDataVersion: SOLAR_TERM_DATA_VERSION,
      profileId: profile.id,
      profileLabel: profile.label,
      settings: cloneCalculationSettings(profile.settings),
    },
    provenance: {},
  });
}

export function saveCalculatedHistory(
  calculated: CalculatedChart,
  profile: CalculationProfile,
  derivedFromRecordId?: string,
): HistoryRecord {
  const record = saveRecord({
    data: calculated.data,
    normalizedInput: { ...calculated.trace.normalizedInput },
    calculation: {
      appVersion: APP_VERSION,
      engineVersion: ENGINE_VERSION,
      solarTermDataVersion: SOLAR_TERM_DATA_VERSION,
      profileId: profile.id,
      profileLabel: profile.label,
      settings: cloneCalculationSettings(profile.settings),
    },
    trace: calculated.trace,
    provenance: derivedFromRecordId ? { derivedFromRecordId } : {},
  });

  if (derivedFromRecordId) {
    const records = readHistory();
    const source = records.find((item) => item.id === derivedFromRecordId);
    if (source) {
      source.provenance.supersededByRecordId = record.id;
      writeRecords(records);
    }
  }
  return record;
}

export function deleteHistoryRecord(id: string): void {
  writeRecords(readHistory().filter((item) => item.id !== id));
}

export function updateHistoryRecordName(id: string, name: string): HistoryRecord | null {
  const records = readHistory();
  const record = records.find((item) => item.id === id);
  if (!record) {
    return null;
  }

  record.data.person.name = name;
  record.normalizedInput.name = name;
  writeRecords(records);
  return record;
}

export function clearHistory(): void {
  uni.removeStorageSync(HISTORY_KEY);
  uni.removeStorageSync(HISTORY_SCHEMA_KEY);
}

export function isLegacyHistoryRecord(record: HistoryRecord): boolean {
  return record.calculation.profileId === "legacy-v0.4" || record.provenance.migratedFrom === "v1";
}

function saveRecord(
  value: Pick<
    HistoryRecord,
    "data" | "normalizedInput" | "calculation" | "provenance"
  > & { trace?: CalculationTrace },
): HistoryRecord {
  const record: HistoryRecord = {
    schemaVersion: 2,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    data: value.data,
    normalizedInput: { ...value.normalizedInput },
    calculation: {
      ...value.calculation,
      settings: cloneCalculationSettings(value.calculation.settings),
    },
    trace: value.trace,
    provenance: { ...value.provenance },
  };
  writeRecords([record, ...readHistory()]);
  return record;
}

function normalizeHistory(stored: unknown[]): { records: HistoryRecord[]; changed: boolean } {
  const records: HistoryRecord[] = [];
  let changed = false;
  for (const value of stored) {
    if (isHistoryRecordV2(value)) {
      records.push(value);
      continue;
    }
    if (isLegacyRecord(value)) {
      records.push(migrateLegacyRecord(value));
      changed = true;
    }
  }
  if (records.length !== stored.length) {
    changed = true;
  }
  return { records, changed };
}

function migrateLegacyRecord(record: LegacyHistoryRecord): HistoryRecord {
  return {
    schemaVersion: 2,
    id: record.id,
    created_at: record.created_at,
    normalizedInput: inputFromData(record.data),
    data: record.data,
    calculation: {
      appVersion: "0.4.0-or-earlier",
      engineVersion: "legacy-day-table",
      solarTermDataVersion: "legacy-day-table",
      profileId: "legacy-v0.4",
      profileLabel: "旧版默认口径",
      settings: cloneCalculationSettings(LEGACY_V0_4_PROFILE.settings),
    },
    provenance: { migratedFrom: "v1" },
  };
}

function inputFromData(data: BaziData): BaziInput {
  const info = data.person.birth_info;
  return {
    name: data.person.name,
    gender: data.person.gender,
    birth_datetime: `${info.gregorian_date}-${info.birth_time.replace(":", "-")}`,
  };
}

function persistMigration(original: unknown[], records: HistoryRecord[]): void {
  try {
    if (!safeRead(HISTORY_BACKUP_KEY)) {
      uni.setStorageSync(HISTORY_BACKUP_KEY, original);
    }
    if (!validateMigration(original, records)) {
      return;
    }
    writeRecords(records);
  } catch {
    // Keep the normalized in-memory result and leave the original storage untouched.
  }
}

function validateMigration(original: unknown[], records: HistoryRecord[]): boolean {
  const legacyCount = original.filter(isLegacyRecord).length;
  const v2Count = original.filter(isHistoryRecordV2).length;
  if (records.length !== legacyCount + v2Count) {
    return false;
  }
  return records.every((record) => {
    const originalRecord = original.find(
      (item) => isObject(item) && item.id === record.id,
    ) as LegacyHistoryRecord | HistoryRecord | undefined;
    if (!originalRecord) {
      return false;
    }
    return (
      originalRecord.created_at === record.created_at &&
      originalRecord.data.person.name === record.data.person.name &&
      pillarSignature(originalRecord.data) === pillarSignature(record.data)
    );
  });
}

function pillarSignature(data: BaziData): string {
  const info = data.person.birth_info;
  return [info.year, info.month, info.day, info.hour]
    .map((pillar) => `${pillar.heavenly_stem.symbol}${pillar.earthly_branch.symbol}`)
    .join("|");
}

function writeRecords(records: HistoryRecord[]): void {
  uni.setStorageSync(HISTORY_KEY, records);
  uni.setStorageSync(HISTORY_SCHEMA_KEY, 2);
}

function safeRead(key: string): unknown {
  try {
    return uni.getStorageSync(key);
  } catch {
    return undefined;
  }
}

function isHistoryRecordV2(value: unknown): value is HistoryRecord {
  return (
    isObject(value) &&
    value.schemaVersion === 2 &&
    typeof value.id === "string" &&
    typeof value.created_at === "string" &&
    isObject(value.data) &&
    isObject(value.calculation) &&
    isObject(value.normalizedInput) &&
    isObject(value.provenance)
  );
}

function isLegacyRecord(value: unknown): value is LegacyHistoryRecord {
  return (
    isObject(value) &&
    !("schemaVersion" in value) &&
    typeof value.id === "string" &&
    typeof value.created_at === "string" &&
    isObject(value.data)
  );
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
