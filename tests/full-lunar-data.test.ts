import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateBazi, summarizeBazi } from "../src/core/calculate.ts";
import {
  findGregorianDatesByLunar,
  LUNAR_CALENDAR,
  LUNAR_CALENDAR_RANGE,
} from "../src/data/lunar-calendar.ts";

const baseline = JSON.parse(readFileSync("baseline/results/current_python_baseline.json", "utf-8"));

assert.equal(LUNAR_CALENDAR_RANGE.first, "1900-01-01");
assert.equal(LUNAR_CALENDAR_RANGE.last, "2100-02-08");
assert.equal(LUNAR_CALENDAR_RANGE.totalDays, 73088);
assert.deepEqual(findGregorianDatesByLunar(1990, 12, 15), ["1991-01-30"]);
assert.deepEqual(findGregorianDatesByLunar(1900, 2, 1), ["1900-03-11", "1900-04-10"]);

let checked = 0;
for (const item of baseline.cases) {
  const input = {
    name: item.input.name,
    gender: item.input.gender,
    birth_datetime: item.input.birth_datetime,
  };

  if (item.success) {
    const actual = calculateBazi(input, LUNAR_CALENDAR);
    assert.deepEqual(summarizeBazi(actual), item.summary, `${item.case_id}: summary differs`);
    assert.deepEqual(actual, item.bazi, `${item.case_id}: full bazi data differs`);
  } else {
    assert.throws(
      () => calculateBazi(input, LUNAR_CALENDAR),
      (error) => {
        assert.equal((error as Error).name, item.error_type, `${item.case_id}: error type differs`);
        assert.equal((error as Error).message, item.error, `${item.case_id}: error message differs`);
        return true;
      },
      `${item.case_id}: expected error`,
    );
  }
  checked += 1;
}

console.log(`Full lunar data tests passed: ${checked} cases`);
