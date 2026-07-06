import type { BaziData, PillarName } from "./types.ts";
import { getBranchRule, getStemRule } from "./rules.ts";

const PILLARS: PillarName[] = ["year", "month", "day", "hour"];

export function enhanceBaziData(data: BaziData): BaziData {
  const birthInfo = data.person.birth_info;

  for (const pillar of PILLARS) {
    const stem = birthInfo[pillar].heavenly_stem;
    const stemRule = getStemRule(stem.symbol);
    stem.yin_yang = stemRule.yin_yang;
    stem.wu_xing = stemRule.wu_xing;

    const branch = birthInfo[pillar].earthly_branch;
    const branchRule = getBranchRule(branch.symbol);
    branch.yin_yang = branchRule.yin_yang;
    branch.wu_xing = branchRule.wu_xing;
    branch.hidden_stems = branchRule.hidden_stems.map((hiddenStem) => {
      const hiddenRule = getStemRule(hiddenStem);
      return {
        symbol: hiddenStem,
        yin_yang: hiddenRule.yin_yang,
        wu_xing: hiddenRule.wu_xing,
      };
    });
  }

  return data;
}

