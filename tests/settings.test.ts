import assert from "node:assert/strict";
import {
  STANDARD_V0_5_PROFILE,
  cloneCalculationSettings,
  normalizeCalculationSettings,
} from "../src/core/calculation-profile.ts";
import {
  SETTINGS_KEY,
  readCalculationSettings,
  resetCalculationSettings,
  saveCalculationSettings,
} from "../src/services/settings.ts";

const storage = new Map<string, unknown>();
(globalThis as any).uni = {
  getStorageSync(key: string) {
    return storage.get(key);
  },
  setStorageSync(key: string, value: unknown) {
    storage.set(key, structuredClone(value));
  },
};

const defaults = readCalculationSettings();
assert.deepEqual(defaults, STANDARD_V0_5_PROFILE.settings);

const changed = cloneCalculationSettings(defaults);
changed.dayBoundary = "midnight";
changed.ziHourMode = "split";
changed.defaultStrengthSchool = "academic";
changed.shenSha.enabled = false;
saveCalculationSettings(changed);
assert.deepEqual(readCalculationSettings(), changed);

storage.set(SETTINGS_KEY, {
  dayBoundary: "invalid",
  ziHourMode: "split",
  timeZoneOffsetMinutes: 0,
  shenSha: { enabled: "yes", ruleSet: "unknown" },
});
const normalized = readCalculationSettings();
assert.equal(normalized.dayBoundary, "zi-begin");
assert.equal(normalized.ziHourMode, "split");
assert.equal(normalized.timeZoneOffsetMinutes, 480);
assert.equal(normalized.shenSha.enabled, true);
assert.equal(normalized.shenSha.ruleSet, "legacy-v1");

assert.deepEqual(resetCalculationSettings(), STANDARD_V0_5_PROFILE.settings);
assert.notEqual(resetCalculationSettings(), STANDARD_V0_5_PROFILE.settings);
assert.deepEqual(normalizeCalculationSettings(null), STANDARD_V0_5_PROFILE.settings);

console.log("Calculation settings tests passed");
