import assert from "node:assert/strict";
import { calculateBaziWithProfile } from "../src/core/calculate.ts";
import {
  APP_VERSION,
  ENGINE_VERSION,
  SOLAR_TERM_DATA_VERSION,
  STANDARD_V0_5_PROFILE,
  cloneCalculationSettings,
  createStandardProfile,
} from "../src/core/calculation-profile.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";
import { SOLAR_TERM_LOOKUP } from "../src/data/solar-terms.ts";

const context = {
  lunarData: LUNAR_CALENDAR,
  solarTerms: SOLAR_TERM_LOOKUP,
  appVersion: APP_VERSION,
  engineVersion: ENGINE_VERSION,
  solarTermDataVersion: SOLAR_TERM_DATA_VERSION,
};

function calculate(dateTime: string, overrides: Partial<typeof STANDARD_V0_5_PROFILE.settings> = {}) {
  const settings = cloneCalculationSettings(STANDARD_V0_5_PROFILE.settings);
  Object.assign(settings, overrides);
  return calculateBaziWithProfile(
    { name: "边界", gender: "男", birth_datetime: dateTime },
    context,
    createStandardProfile(settings),
  );
}

const dayTimes = ["22-59", "23-00", "23-59", "00-00", "00-59"];
for (const time of dayTimes) {
  calculate(`2026-05-${time.startsWith("0") ? "11" : "10"}-${time}`);
}

const at2259 = calculate("2026-05-10-22-59");
const at2300 = calculate("2026-05-10-23-00");
const midnight2300 = calculate("2026-05-10-23-00", { dayBoundary: "midnight" });
assert.notEqual(at2259.trace.dayBoundary.result, at2300.trace.dayBoundary.result);
assert.equal(at2259.trace.dayBoundary.result, midnight2300.trace.dayBoundary.result);
assert.equal(at2300.trace.dayBoundary.rolled, true);
assert.equal(midnight2300.trace.dayBoundary.rolled, false);

const split2300 = calculate("2026-05-10-23-00", { ziHourMode: "split" });
assert.equal(split2300.trace.hourRule.dayStemSource, "civil-day");
assert.notEqual(split2300.trace.hourRule.result, at2300.trace.hourRule.result);

const lichun = SOLAR_TERM_LOOKUP.findByNameAndYear("立春", 2026);
assert(lichun);
const [datePart, timePart] = lichun.cst.split(" ");
const asInput = (minuteDelta: number) => {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute + minuteDelta));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
    String(value.getUTCHours()).padStart(2, "0"),
    String(value.getUTCMinutes()).padStart(2, "0"),
  ].join("-");
};
const beforeLichun = calculate(asInput(-1), { yearBoundary: "lichun" });
const atLichun = calculate(asInput(0), { yearBoundary: "lichun" });
assert.equal(beforeLichun.trace.yearBoundary.result, "乙巳");
assert.equal(atLichun.trace.yearBoundary.result, "丙午");
assert.equal(beforeLichun.trace.monthBoundary.nextJie.name, "立春");
assert.equal(atLichun.trace.monthBoundary.previousJie.name, "立春");
assert.notEqual(beforeLichun.trace.monthBoundary.result, atLichun.trace.monthBoundary.result);

for (const name of ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"]) {
  const term = SOLAR_TERM_LOOKUP.findByNameAndYear(name, name === "小寒" ? 2027 : 2026);
  assert(term, name);
  const [date, time] = term.cst.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const makeInput = (delta: number) => {
    const value = new Date(Date.UTC(year, month - 1, day, hour, minute + delta));
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}-${String(value.getUTCHours()).padStart(2, "0")}-${String(value.getUTCMinutes()).padStart(2, "0")}`;
  };
  const before = calculate(makeInput(-1), { yearBoundary: "lichun" });
  const after = calculate(makeInput(0), { yearBoundary: "lichun" });
  assert.notEqual(before.trace.monthBoundary.result, after.trace.monthBoundary.result, name);
}

console.log("Calendar boundary tests passed");
