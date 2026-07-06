import type { WuXing, YinYang } from "./types.ts";

export interface StemRule {
  symbol: string;
  yin_yang: YinYang;
  wu_xing: WuXing;
}

export interface BranchRule {
  symbol: string;
  yin_yang: YinYang;
  wu_xing: WuXing;
  hidden_stems: string[];
}

export const HEAVENLY_STEMS = "甲乙丙丁戊己庚辛壬癸".split("");
export const EARTHLY_BRANCHES = "子丑寅卯辰巳午未申酉戌亥".split("");

export const STEM_RULES: StemRule[] = [
  { symbol: "甲", yin_yang: "阳", wu_xing: "木" },
  { symbol: "乙", yin_yang: "阴", wu_xing: "木" },
  { symbol: "丙", yin_yang: "阳", wu_xing: "火" },
  { symbol: "丁", yin_yang: "阴", wu_xing: "火" },
  { symbol: "戊", yin_yang: "阳", wu_xing: "土" },
  { symbol: "己", yin_yang: "阴", wu_xing: "土" },
  { symbol: "庚", yin_yang: "阳", wu_xing: "金" },
  { symbol: "辛", yin_yang: "阴", wu_xing: "金" },
  { symbol: "壬", yin_yang: "阳", wu_xing: "水" },
  { symbol: "癸", yin_yang: "阴", wu_xing: "水" },
];

export const BRANCH_RULES: BranchRule[] = [
  { symbol: "子", yin_yang: "阳", wu_xing: "水", hidden_stems: ["癸"] },
  { symbol: "丑", yin_yang: "阴", wu_xing: "土", hidden_stems: ["己", "癸", "辛"] },
  { symbol: "寅", yin_yang: "阳", wu_xing: "木", hidden_stems: ["甲", "丙", "戊"] },
  { symbol: "卯", yin_yang: "阴", wu_xing: "木", hidden_stems: ["乙"] },
  { symbol: "辰", yin_yang: "阳", wu_xing: "土", hidden_stems: ["戊", "乙", "癸"] },
  { symbol: "巳", yin_yang: "阴", wu_xing: "火", hidden_stems: ["丙", "庚", "戊"] },
  { symbol: "午", yin_yang: "阳", wu_xing: "火", hidden_stems: ["丁", "己"] },
  { symbol: "未", yin_yang: "阴", wu_xing: "土", hidden_stems: ["己", "丁", "乙"] },
  { symbol: "申", yin_yang: "阳", wu_xing: "金", hidden_stems: ["庚", "壬", "戊"] },
  { symbol: "酉", yin_yang: "阴", wu_xing: "金", hidden_stems: ["辛"] },
  { symbol: "戌", yin_yang: "阳", wu_xing: "土", hidden_stems: ["戊", "辛", "丁"] },
  { symbol: "亥", yin_yang: "阴", wu_xing: "水", hidden_stems: ["壬", "甲"] },
];

export const GENERATING_RELATIONS: Record<WuXing, WuXing> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

export const OVERCOMING_RELATIONS: Record<WuXing, WuXing> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

export function getStemRule(symbol: string): StemRule {
  const rule = STEM_RULES.find((item) => item.symbol === symbol);
  if (!rule) {
    throw new Error(`未知天干: ${symbol}`);
  }
  return rule;
}

export function getBranchRule(symbol: string): BranchRule {
  const rule = BRANCH_RULES.find((item) => item.symbol === symbol);
  if (!rule) {
    throw new Error(`未知地支: ${symbol}`);
  }
  return rule;
}

export function isGenerating(wuxing1: WuXing, wuxing2: WuXing): boolean {
  return GENERATING_RELATIONS[wuxing1] === wuxing2;
}

