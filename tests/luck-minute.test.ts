import assert from "node:assert/strict";
import { calculateBaziWithProfile } from "../src/core/calculate.ts";
import {
  APP_VERSION,
  ENGINE_VERSION,
  SOLAR_TERM_DATA_VERSION,
  STANDARD_V0_5_PROFILE,
} from "../src/core/calculation-profile.ts";
import { buildLuckTimeline } from "../src/core/luck.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";
import { SOLAR_TERM_LOOKUP } from "../src/data/solar-terms.ts";

const calculated = calculateBaziWithProfile(
  { name: "分钟起运", gender: "男", birth_datetime: "1990-01-01-00-00" },
  {
    lunarData: LUNAR_CALENDAR,
    solarTerms: SOLAR_TERM_LOOKUP,
    appVersion: APP_VERSION,
    engineVersion: ENGINE_VERSION,
    solarTermDataVersion: SOLAR_TERM_DATA_VERSION,
  },
  STANDARD_V0_5_PROFILE,
);

const timeline = buildLuckTimeline(calculated.data, 10, SOLAR_TERM_LOOKUP);
assert.equal(timeline.start.precision, "minute");
assert.equal(timeline.start.isForward, false);
assert(timeline.start.previousJie);
assert(timeline.start.nextJie);
assert((timeline.start.differenceMinutes ?? 0) > 0);
assert.match(timeline.start.conversionText ?? "", /4320分=1年/);
assert.match(timeline.start.startSolar, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
assert.equal(timeline.daYun[1].ganZhi, "乙亥");

console.log("Minute luck-start tests passed");
