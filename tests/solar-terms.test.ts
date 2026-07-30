import assert from "node:assert/strict";
import { SOLAR_TERMS, SOLAR_TERM_LOOKUP } from "../src/data/solar-terms.ts";
import {
  cstDateTimeToEpochMinute,
  epochMinuteToCst,
} from "../src/core/solar-terms.ts";

assert.equal(SOLAR_TERMS.length, 4808);
assert.equal(new Set(SOLAR_TERMS.map((item) => item.name)).size, 24);
assert(SOLAR_TERMS.every((item, index) => index === 0 || item.epochMinute > SOLAR_TERMS[index - 1].epochMinute));

for (let year = 1900; year < 2100; year += 1) {
  assert.equal(
    SOLAR_TERMS.filter((item) => item.cst.startsWith(`${year}-`)).length,
    24,
    `${year} should contain 24 terms`,
  );
}

const lichun2026 = SOLAR_TERM_LOOKUP.findByNameAndYear("立春", 2026);
assert(lichun2026);
const at = cstDateTimeToEpochMinute(lichun2026.cst);
assert.equal(epochMinuteToCst(at), lichun2026.cst);
const before = SOLAR_TERM_LOOKUP.findWindow(at - 1, "jie");
const after = SOLAR_TERM_LOOKUP.findWindow(at, "jie");
assert.equal(before.next.name, "立春");
assert.equal(after.previous.name, "立春");

console.log("Solar-term lookup tests passed");
