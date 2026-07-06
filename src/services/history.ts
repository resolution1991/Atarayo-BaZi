import type { BaziData } from "../core/types.ts";

const HISTORY_KEY = "bazi_history_records";

export interface HistoryRecord {
  id: string;
  created_at: string;
  data: BaziData;
}

export function readHistory(): HistoryRecord[] {
  const records = uni.getStorageSync(HISTORY_KEY);
  return Array.isArray(records) ? records : [];
}

export function saveHistory(data: BaziData): HistoryRecord {
  const record: HistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    data,
  };
  const records = [record, ...readHistory()];
  uni.setStorageSync(HISTORY_KEY, records);
  return record;
}

export function deleteHistoryRecord(id: string): void {
  const records = readHistory().filter((item) => item.id !== id);
  uni.setStorageSync(HISTORY_KEY, records);
}

export function updateHistoryRecordName(id: string, name: string): HistoryRecord | null {
  const records = readHistory();
  const record = records.find((item) => item.id === id);
  if (!record) {
    return null;
  }

  record.data.person.name = name;
  uni.setStorageSync(HISTORY_KEY, records);
  return record;
}

export function clearHistory(): void {
  uni.removeStorageSync(HISTORY_KEY);
}
