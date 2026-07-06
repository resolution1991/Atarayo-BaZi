import type { BaziData, WuXing } from "./types.ts";
import { isGenerating } from "./rules.ts";

export function analyzeStrength(baziData: BaziData): string {
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

