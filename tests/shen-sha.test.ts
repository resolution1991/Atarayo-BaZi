import assert from "node:assert/strict";
import { analyzeShenSha, getShenShaDefinition } from "../src/core/shen-sha.ts";
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

function names(data: BaziData, pillar: PillarName): string[] {
  return analyzeShenSha(data)[pillar].map((hit) => hit.name);
}

{
  const referenceLike = makeBazi(["戊", "丁", "甲", "壬"], ["寅", "巳", "子", "申"]);

  assert(names(referenceLike, "year").includes("福星贵人"));
  assert(names(referenceLike, "year").includes("驿马"));
  assert(names(referenceLike, "year").includes("禄神"));

  assert(names(referenceLike, "month").includes("文昌贵人"));
  assert(names(referenceLike, "month").includes("天厨贵人"));
  assert(names(referenceLike, "month").includes("亡神"));
  assert(names(referenceLike, "month").includes("劫煞"));
  assert(names(referenceLike, "month").includes("孤辰"));

  assert(names(referenceLike, "day").includes("太极贵人"));
  assert(names(referenceLike, "day").includes("福星贵人"));
  assert(names(referenceLike, "day").includes("灾煞"));

  assert(names(referenceLike, "hour").includes("文昌贵人"));
  assert(names(referenceLike, "hour").includes("福星贵人"));
  assert(names(referenceLike, "hour").includes("天厨贵人"));
  assert(names(referenceLike, "hour").includes("驿马"));
  assert(names(referenceLike, "hour").includes("学堂"));
  assert(names(referenceLike, "hour").includes("词馆"));
  assert(names(referenceLike, "hour").includes("空亡"));
}

{
  const data = makeBazi(["庚", "辛", "庚", "甲"], ["申", "酉", "辰", "子"]);
  assert(names(data, "day").includes("华盖"));
  assert(names(data, "day").includes("魁罡"));
  assert(names(data, "day").includes("十恶大败"));
}

{
  const data = makeBazi(["甲", "丙", "甲", "乙"], ["子", "巳", "午", "丑"]);
  assert(names(data, "hour").includes("天乙贵人"));
  assert(names(data, "day").includes("天赦"));
}

{
  const data = makeBazi(["甲", "丙", "甲", "乙"], ["申", "寅", "子", "酉"]);
  assert(names(data, "month").includes("驿马"));
  assert(names(data, "hour").includes("桃花"));
}

{
  const definition = getShenShaDefinition("太极贵人");
  assert(definition);
  assert.equal(definition?.category, "吉神");
  assert(definition?.checkMethod.includes("甲乙子午"));
}

console.log("Shen sha tests passed");
