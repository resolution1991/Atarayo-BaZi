import assert from "node:assert/strict";
import { calculateBazi } from "../src/core/calculate.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";

const storage = new Map<string, unknown>();
(globalThis as any).uni = {
  getStorageSync(key: string) {
    return storage.get(key);
  },
  setStorageSync(key: string, value: unknown) {
    storage.set(key, structuredClone(value));
  },
  removeStorageSync(key: string) {
    storage.delete(key);
  },
};

const {
  HISTORY_BACKUP_KEY,
  HISTORY_KEY,
  readHistory,
} = await import("../src/services/history.ts");

const data = calculateBazi(
  { name: "迁移样例", gender: "女", birth_datetime: "1990-01-01-00-00" },
  LUNAR_CALENDAR,
);
const legacy = [{ id: "legacy-1", created_at: "2026-07-30T00:00:00.000Z", data }];
storage.set(HISTORY_KEY, structuredClone(legacy));

const first = readHistory();
assert.equal(first.length, 1);
assert.equal(first[0].schemaVersion, 2);
assert.equal(first[0].id, "legacy-1");
assert.equal(first[0].calculation.profileId, "legacy-v0.4");
assert.equal(first[0].provenance.migratedFrom, "v1");
assert.equal(first[0].normalizedInput.birth_datetime, "1990-01-01-00-00");
assert.deepEqual(storage.get(HISTORY_BACKUP_KEY), legacy);

const second = readHistory();
assert.deepEqual(second, first);
assert.equal((storage.get(HISTORY_KEY) as unknown[]).length, 1);

console.log("History migration tests passed");
