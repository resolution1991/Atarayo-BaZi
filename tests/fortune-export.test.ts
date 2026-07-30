import assert from "node:assert/strict";
import { calculateBazi } from "../src/core/calculate.ts";
import { formatFutureLuckExport } from "../src/core/fortune-export.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";

const sample = calculateBazi(
  {
    name: "不应出现在导出内容中的姓名",
    gender: "男",
    birth_datetime: "1990-01-01-00-00",
  },
  LUNAR_CALENDAR,
);

const output = formatFutureLuckExport(sample, 2026, 10);

assert(!output.includes(sample.person.name));
assert(output.includes("未来10年流年大运（2026—2035）"));
assert(output.includes("【命盘四柱】"));
assert(output.includes("四柱八字："));

for (const label of ["年柱", "月柱", "日柱", "时柱"]) {
  assert(output.includes(`${label}：`));
}
for (const label of ["主星：", "辅星：", "藏干："]) {
  assert(output.includes(label));
}

const yearHeadings = output.match(/【20\d{2}年】/g) ?? [];
assert.equal(yearHeadings.length, 10);
assert(output.includes("【2026年】"));
assert(output.includes("【2035年】"));
assert(!output.includes("【2036年】"));

assert(output.includes("【2027年】\n大运：癸酉"));
assert(output.includes("【2028年】\n大运：壬申"), "跨大运年份应使用新大运");
for (const label of ["大运主星：", "大运辅星：", "大运藏干：", "流年主星：", "流年辅星：", "流年藏干："]) {
  assert(output.includes(label));
}

console.log("Fortune export tests passed");
