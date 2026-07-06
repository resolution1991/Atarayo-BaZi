import assert from "node:assert/strict";
import { calculateBazi } from "../src/core/calculate.ts";
import { buildLuckTimeline, getYearGanZhi } from "../src/core/luck.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";

const sample = calculateBazi(
  {
    name: "样例",
    gender: "男",
    birth_datetime: "1990-01-01-00-00",
  },
  LUNAR_CALENDAR,
);

const timeline = buildLuckTimeline(sample);

assert.equal(timeline.start.isForward, false, "己年男命应逆行");
assert.equal(timeline.daYun[0].label, "小运");
assert.equal(timeline.daYun[1].ganZhi, "乙亥");
assert.equal(timeline.daYun[2].ganZhi, "甲戌");
assert.equal(timeline.daYun[3].ganZhi, "癸酉");
assert.equal(timeline.daYun[1].startYear, 1998);
assert.equal(timeline.daYun[3].startYear, 2018);

const selectedDaYun = timeline.daYun.find((item) => item.startYear === 2018);
assert(selectedDaYun);
const liuNian2026 = selectedDaYun.liuNian.find((item) => item.year === 2026);
assert(liuNian2026);
assert.equal(liuNian2026.ganZhi, "丙午");
assert.equal(liuNian2026.liuYue[0].ganZhi, "庚寅");
assert.equal(liuNian2026.liuYue[1].ganZhi, "辛卯");
assert.equal(liuNian2026.liuYue[11].ganZhi, "辛丑");

assert.equal(getYearGanZhi(2026), "丙午");
assert.equal(getYearGanZhi(2027), "丁未");

console.log("Luck timeline tests passed");
