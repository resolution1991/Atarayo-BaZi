import type { BaziData, WuXing } from "./types.ts";
import { getBranchRule, getStemRule, isGenerating } from "./rules.ts";

export type StrengthSchool = "traditional" | "academic";
export type StrengthLevel = "身强" | "中和" | "身弱";

export interface AcademicStrengthAnalysis {
  strength: StrengthLevel;
  score: number;
}

const ACADEMIC_STEM_WEIGHTS = {
  year: 8,
  month: 10,
  hour: 10,
} as const;

const ACADEMIC_BRANCH_WEIGHTS = {
  year: 7,
  month: 40,
  day: 15,
  hour: 10,
} as const;

const HIDDEN_STEM_RATIOS: Record<string, number[]> = {
  子: [1],
  丑: [0.6, 0.2, 0.2],
  寅: [0.6, 0.2, 0.2],
  卯: [1],
  辰: [0.6, 0.2, 0.2],
  巳: [0.6, 0.2, 0.2],
  午: [0.6, 0.4],
  未: [0.6, 0.2, 0.2],
  申: [0.6, 0.2, 0.2],
  酉: [1],
  戌: [0.6, 0.2, 0.2],
  亥: [0.6, 0.4],
};

export function analyzeStrength(baziData: BaziData): string {
  return analyzeTraditionalStrength(baziData);
}

export function analyzeStrengthBySchool(baziData: BaziData, school: StrengthSchool): StrengthLevel {
  return school === "academic"
    ? analyzeAcademicStrength(baziData).strength
    : analyzeTraditionalStrength(baziData);
}

export function analyzeTraditionalStrength(baziData: BaziData): StrengthLevel {
  const birthInfo = baziData.person.birth_info;
  const dayGanWuxing = birthInfo.day.heavenly_stem.wu_xing as WuXing;
  const monthZhiWuxing = birthInfo.month.earthly_branch.wu_xing as WuXing;

  let condition1 = false;
  if (monthZhiWuxing === dayGanWuxing) {
    condition1 = true;
  } else if (isGenerating(monthZhiWuxing, dayGanWuxing)) {
    condition1 = true;
  }

  let condition2 = false;
  const otherZhiWuxing = [
    birthInfo.year.earthly_branch.wu_xing as WuXing,
    birthInfo.day.earthly_branch.wu_xing as WuXing,
    birthInfo.hour.earthly_branch.wu_xing as WuXing,
  ];
  for (const zhiWuxing of otherZhiWuxing) {
    if (zhiWuxing === dayGanWuxing && zhiWuxing !== monthZhiWuxing) {
      condition2 = true;
      break;
    }
  }

  let condition3 = false;
  const otherGanWuxing = [
    birthInfo.year.heavenly_stem.wu_xing as WuXing,
    birthInfo.month.heavenly_stem.wu_xing as WuXing,
    birthInfo.hour.heavenly_stem.wu_xing as WuXing,
  ];
  for (const ganWuxing of otherGanWuxing) {
    if (ganWuxing === dayGanWuxing) {
      condition3 = true;
      break;
    }
  }

  return condition1 && (condition2 || condition3) ? "身强" : "身弱";
}

/**
 * 学术派基础量化版。
 *
 * 日干仅作为参照，不参与计分。其余三天干和四地支按 100 分权重拆分，
 * 与日元同五行或生助日元的部分计入帮扶分。
 *
 * 参考文档中的进阶修正依赖尚未明确的合化成功条件，因此这里暂不启用，
 * 以保证相同命盘始终得到可复现的基础分。
 */
export function analyzeAcademicStrength(baziData: BaziData): AcademicStrengthAnalysis {
  const birthInfo = baziData.person.birth_info;
  const dayElement = getStemRule(birthInfo.day.heavenly_stem.symbol).wu_xing;
  let score = 0;

  const weightedStems = [
    { symbol: birthInfo.year.heavenly_stem.symbol, weight: ACADEMIC_STEM_WEIGHTS.year },
    { symbol: birthInfo.month.heavenly_stem.symbol, weight: ACADEMIC_STEM_WEIGHTS.month },
    { symbol: birthInfo.hour.heavenly_stem.symbol, weight: ACADEMIC_STEM_WEIGHTS.hour },
  ];

  for (const stem of weightedStems) {
    if (isSupportingElement(getStemRule(stem.symbol).wu_xing, dayElement)) {
      score += stem.weight;
    }
  }

  const weightedBranches = [
    { symbol: birthInfo.year.earthly_branch.symbol, weight: ACADEMIC_BRANCH_WEIGHTS.year },
    { symbol: birthInfo.month.earthly_branch.symbol, weight: ACADEMIC_BRANCH_WEIGHTS.month },
    { symbol: birthInfo.day.earthly_branch.symbol, weight: ACADEMIC_BRANCH_WEIGHTS.day },
    { symbol: birthInfo.hour.earthly_branch.symbol, weight: ACADEMIC_BRANCH_WEIGHTS.hour },
  ];

  for (const branch of weightedBranches) {
    const hiddenStems = getBranchRule(branch.symbol).hidden_stems;
    const ratios = HIDDEN_STEM_RATIOS[branch.symbol];
    if (!ratios || hiddenStems.length !== ratios.length) {
      throw new Error(`地支藏干比例配置不完整: ${branch.symbol}`);
    }

    hiddenStems.forEach((hiddenStem, index) => {
      if (isSupportingElement(getStemRule(hiddenStem).wu_xing, dayElement)) {
        score += branch.weight * ratios[index];
      }
    });
  }

  const roundedScore = Math.round(score * 10) / 10;
  return {
    score: roundedScore,
    strength: classifyAcademicStrength(roundedScore),
  };
}

function isSupportingElement(candidate: WuXing, dayElement: WuXing): boolean {
  return candidate === dayElement || isGenerating(candidate, dayElement);
}

function classifyAcademicStrength(score: number): StrengthLevel {
  if (score > 55) {
    return "身强";
  }
  if (score >= 45) {
    return "中和";
  }
  return "身弱";
}
