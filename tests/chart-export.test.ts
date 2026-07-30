import assert from "node:assert/strict";
import { formatChartExport } from "../src/core/chart-export.ts";
import { enhanceBaziData } from "../src/core/enhance.ts";
import type { BaziData, PillarName } from "../src/core/types.ts";

const PILLARS: PillarName[] = ["year", "month", "day", "hour"];
const birthInfo = {
  gregorian_date: "2000-01-01",
  lunar_date: "1999年11月25日",
  birth_time: "12:00",
} as BaziData["person"]["birth_info"];

const stems = ["甲", "庚", "甲", "壬"];
const branches = ["子", "午", "卯", "子"];
PILLARS.forEach((pillar, index) => {
  birthInfo[pillar] = {
    heavenly_stem: { symbol: stems[index] },
    earthly_branch: { symbol: branches[index] },
  };
});

const data = enhanceBaziData({
  person: {
    name: "绝不能出现在导出内容中的姓名",
    gender: "女",
    birth_info: birthInfo,
  },
  geju_analysis: {
    geju: "测试格局",
  },
});

const output = formatChartExport(data);

assert(!output.includes(data.person.name), "导出内容不得包含姓名");
assert(output.includes("性别：女"));
assert(output.includes("公历生日：2000-01-01 12:00"));
assert(output.includes("农历生日：1999年11月25日 12:00"));
assert(output.includes("身强身弱（传统派）："));
assert(output.includes("身强身弱（学术派）："));
assert(output.includes("命盘格局：测试格局"));
assert(output.includes("四柱八字：年柱甲子　月柱庚午　日柱甲卯　时柱壬子"));

for (const label of ["年柱", "月柱", "日柱", "时柱"]) {
  assert(output.includes(`${label}：`));
}
for (const label of ["主星：", "辅星：", "藏干：", "神煞："]) {
  assert(output.includes(label));
}

assert(output.includes("【天干作用关系】"));
assert(output.includes("年柱甲、月柱庚：冲"));
assert(output.includes("月柱庚、年柱甲：庚克甲"));
assert(output.includes("【地支作用关系】"));
assert(output.includes("年柱子、月柱午：冲"));

console.log("Chart export tests passed");
