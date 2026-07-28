import assert from "node:assert/strict";
import { calculateBazi } from "../src/core/calculate.ts";
import { analyzeAcademicStrength, analyzeTraditionalStrength } from "../src/core/strength.ts";
import { LUNAR_CALENDAR } from "../src/data/lunar-calendar.ts";
import { enhanceBaziData } from "../src/core/enhance.ts";
import type { BaziData, Gender, PillarName } from "../src/core/types.ts";

const PILLARS: PillarName[] = ["year", "month", "day", "hour"];

function makeBazi(stems: [string, string, string, string], branches: [string, string, string, string]): BaziData {
  const birthInfo = {
    gregorian_date: "2000-01-01",
    lunar_date: "1999年11月25日",
    birth_time: "12:00",
  } as BaziData["person"]["birth_info"];

  PILLARS.forEach((pillar, index) => {
    birthInfo[pillar] = {
      heavenly_stem: { symbol: stems[index] },
      earthly_branch: { symbol: branches[index] },
    };
  });

  return enhanceBaziData({
    person: {
      name: "测试",
      gender: "男" as Gender,
      birth_info: birthInfo,
    },
  });
}

function formatPillars(data: BaziData): string[] {
  const birthInfo = data.person.birth_info;
  return PILLARS.map(
    (pillar) => `${birthInfo[pillar].heavenly_stem.symbol}${birthInfo[pillar].earthly_branch.symbol}`,
  );
}

{
  // 参考文档示例：甲子、丙寅、甲午、庚午。
  const data = makeBazi(["甲", "丙", "甲", "庚"], ["子", "寅", "午", "午"]);
  assert.deepEqual(analyzeAcademicStrength(data), { score: 39, strength: "身弱" });
  assert.equal(analyzeTraditionalStrength(data), "身强", "两套流派应能给出各自独立的结论");
}

{
  // 七个有效字全部为同我或生我，帮扶分应为满分。
  const data = makeBazi(["壬", "甲", "甲", "癸"], ["亥", "子", "卯", "亥"]);
  assert.deepEqual(analyzeAcademicStrength(data), { score: 100, strength: "身强" });
}

{
  // 月支寅 24 分 + 月干壬 10 分 + 日支亥 15 分 = 49 分。
  const data = makeBazi(["丙", "壬", "甲", "庚"], ["午", "寅", "亥", "午"]);
  assert.deepEqual(analyzeAcademicStrength(data), { score: 49, strength: "中和" });
}

{
  // 阈值上界：月支子 40 分 + 日支亥 15 分 = 55 分，仍判为中和。
  const data = makeBazi(["丙", "丁", "甲", "庚"], ["午", "子", "亥", "午"]);
  assert.deepEqual(analyzeAcademicStrength(data), { score: 55, strength: "中和" });
}

const divergentCases = [
  {
    id: "wood-traditional-strong",
    birthDatetime: "1980-02-11-20-00",
    pillars: ["己未", "戊寅", "甲寅", "甲戌"],
    traditional: "身强",
    academic: { score: 44.4, strength: "身弱" },
  },
  {
    id: "fire-traditional-strong",
    birthDatetime: "1980-02-13-10-00",
    pillars: ["己未", "戊寅", "丙辰", "癸巳"],
    traditional: "身强",
    academic: { score: 43.8, strength: "身弱" },
  },
  {
    id: "earth-traditional-strong",
    birthDatetime: "1980-04-06-08-00",
    pillars: ["庚申", "庚辰", "己酉", "戊辰"],
    traditional: "身强",
    academic: { score: 41.4, strength: "身弱" },
  },
  {
    id: "metal-traditional-strong",
    birthDatetime: "1980-07-16-00-00",
    pillars: ["庚申", "癸未", "庚寅", "丙子"],
    traditional: "身强",
    academic: { score: 40.6, strength: "身弱" },
  },
  {
    id: "water-traditional-strong",
    birthDatetime: "1982-08-27-08-00",
    pillars: ["壬戌", "戊申", "壬午", "甲辰"],
    traditional: "身强",
    academic: { score: 43.4, strength: "身弱" },
  },
  {
    id: "wood-academic-strong",
    birthDatetime: "1980-01-03-00-00",
    pillars: ["己未", "丙子", "乙亥", "丙子"],
    traditional: "身弱",
    academic: { score: 66.4, strength: "身强" },
  },
  {
    id: "fire-academic-strong",
    birthDatetime: "1980-02-23-14-00",
    pillars: ["庚申", "戊寅", "丙寅", "乙未"],
    traditional: "身弱",
    academic: { score: 58, strength: "身强" },
  },
  {
    id: "earth-academic-strong",
    birthDatetime: "1980-02-05-08-00",
    pillars: ["己未", "戊寅", "戊申", "丙辰"],
    traditional: "身弱",
    academic: { score: 58.6, strength: "身强" },
  },
  {
    id: "metal-academic-strong",
    birthDatetime: "1980-01-08-02-00",
    pillars: ["己未", "丁丑", "庚辰", "丁丑"],
    traditional: "身弱",
    academic: { score: 61.2, strength: "身强" },
  },
  {
    id: "water-academic-strong",
    birthDatetime: "1980-01-01-08-00",
    pillars: ["己未", "丙子", "癸酉", "丙辰"],
    traditional: "身弱",
    academic: { score: 57, strength: "身强" },
  },
] as const;

for (const testCase of divergentCases) {
  const data = calculateBazi(
    {
      name: "分歧案例",
      gender: "男",
      birth_datetime: testCase.birthDatetime,
    },
    LUNAR_CALENDAR,
  );

  assert.deepEqual(formatPillars(data), testCase.pillars, `${testCase.id}: 四柱与预期不一致`);
  assert.equal(
    analyzeTraditionalStrength(data),
    testCase.traditional,
    `${testCase.id}: 传统派结论与预期不一致`,
  );
  assert.deepEqual(
    analyzeAcademicStrength(data),
    testCase.academic,
    `${testCase.id}: 学术派结论或分数与预期不一致`,
  );
  assert.notEqual(
    testCase.traditional,
    testCase.academic.strength,
    `${testCase.id}: 两派结论应相反`,
  );
}

console.log(`Strength school tests passed: ${4 + divergentCases.length} cases`);
