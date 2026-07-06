import assert from "node:assert/strict";
import { analyzeGanzhiRelations } from "../src/core/relations.ts";
import type { BaziData, Gender, PillarName } from "../src/core/types.ts";

const PILLARS: PillarName[] = ["year", "month", "day", "hour"];

function makeBazi(stems: [string, string, string, string], branches: [string, string, string, string]): BaziData {
  const birthInfo = {
    gregorian_date: "1997-01-25",
    lunar_date: "1996年12月17日",
    birth_time: "20:11",
  } as BaziData["person"]["birth_info"];

  PILLARS.forEach((pillar, index) => {
    birthInfo[pillar] = {
      heavenly_stem: { symbol: stems[index] },
      earthly_branch: { symbol: branches[index] },
    };
  });

  return {
    person: {
      name: "测试",
      gender: "男" as Gender,
      birth_info: birthInfo,
    },
  };
}

function relationLabels(data: BaziData): string[] {
  return analyzeGanzhiRelations(data).map((relation) => `${relation.layer}:${relation.label}:${relation.positions.join(",")}`);
}

{
  const data = makeBazi(["丙", "辛", "丁", "庚"], ["子", "丑", "卯", "戌"]);
  const labels = relationLabels(data);

  assert(labels.includes("stem:合水:year,month"));
  assert(labels.includes("stem:丙克辛:year,month"));
  assert(labels.includes("stem:丙克庚:year,hour"));
  assert(labels.includes("stem:丁克辛:day,month"));
  assert(labels.includes("stem:丁克庚:day,hour"));
  assert(labels.includes("branch:合土:year,month"));
  assert(labels.includes("branch:合火:day,hour"));
  assert(labels.includes("branch:子卯刑:year,day"));
}

{
  const data = makeBazi(["甲", "乙", "丙", "丁"], ["申", "子", "辰", "午"]);
  const relations = analyzeGanzhiRelations(data);
  assert(relations.some((relation) => relation.label === "三合水局"));
  assert(!relations.some((relation) => relation.type === "半合" && relation.element === "水"));
  assert(relations.some((relation) => relation.label === "冲"));
}

{
  const data = makeBazi(["甲", "乙", "丙", "丁"], ["寅", "卯", "辰", "酉"]);
  const relations = analyzeGanzhiRelations(data);
  assert(relations.some((relation) => relation.label === "三会木局"));
  assert(relations.some((relation) => relation.label === "冲" && relation.symbols.includes("卯") && relation.symbols.includes("酉")));
  assert(relations.some((relation) => relation.label === "害" && relation.symbols.includes("卯") && relation.symbols.includes("辰")));
}

{
  const data = makeBazi(["甲", "乙", "丙", "丁"], ["辰", "午", "辰", "酉"]);
  const labels = relationLabels(data);
  assert(labels.includes("branch:辰辰自刑:year,day"));
}

{
  const data = makeBazi(["乙", "庚", "戊", "癸"], ["巳", "申", "寅", "亥"]);
  const labels = relationLabels(data);
  assert(labels.includes("stem:合金:year,month"));
  assert(labels.includes("stem:合火:day,hour"));
  assert(labels.some((label) => label.startsWith("branch:合水:year,month")));
  assert(labels.some((label) => label.startsWith("branch:破:year,month")));
  assert(labels.some((label) => label.startsWith("branch:合木:day,hour")));
  assert(labels.some((label) => label.startsWith("branch:破:day,hour")));
}

console.log("Ganzhi relation tests passed");
