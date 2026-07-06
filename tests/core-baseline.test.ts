import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateBazi, summarizeBazi } from "../src/core/calculate.ts";
import { LUNAR_CALENDAR_FIXTURE } from "../src/data/lunar-calendar.fixture.ts";

const baseline = JSON.parse(readFileSync("baseline/results/current_python_baseline.json", "utf-8"));

let checked = 0;
for (const item of baseline.cases) {
  const input = {
    name: item.input.name,
    gender: item.input.gender,
    birth_datetime: item.input.birth_datetime,
  };

  if (item.success) {
    const actual = calculateBazi(input, LUNAR_CALENDAR_FIXTURE);
    assert.deepEqual(summarizeBazi(actual), item.summary, `${item.case_id}: summary differs`);
    assert.deepEqual(actual, item.bazi, `${item.case_id}: full bazi data differs`);
  } else {
    assert.throws(
      () => calculateBazi(input, LUNAR_CALENDAR_FIXTURE),
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

console.log(`Core baseline tests passed: ${checked} cases`);
