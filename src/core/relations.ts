import type { BaziData, PillarName, WuXing } from "./types.ts";
import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  getStemRule,
  OVERCOMING_RELATIONS,
} from "./rules.ts";

export type GanzhiRelationLayer = "stem" | "branch";
export type GanzhiRelationType = "合" | "半合" | "三合" | "三会" | "冲" | "刑" | "害" | "破" | "克";

export interface GanzhiRelation {
  id: string;
  layer: GanzhiRelationLayer;
  type: GanzhiRelationType;
  label: string;
  element?: WuXing;
  positions: PillarName[];
  positionIndexes: number[];
  symbols: string[];
  directed?: boolean;
  fromPosition?: PillarName;
  toPosition?: PillarName;
  subtype?: string;
}

interface PillarPoint {
  position: PillarName;
  index: number;
  label: string;
  symbol: string;
}

interface PairRule {
  symbols: [string, string];
  type: GanzhiRelationType;
  label: string;
  element?: WuXing;
  subtype?: string;
}

interface GroupRule {
  symbols: [string, string, string];
  type: GanzhiRelationType;
  label: string;
  element?: WuXing;
  subtype?: string;
}

const PILLARS: Array<{ key: PillarName; label: string }> = [
  { key: "year", label: "年柱" },
  { key: "month", label: "月柱" },
  { key: "day", label: "日柱" },
  { key: "hour", label: "时柱" },
];

const STEM_COMBINE_RULES: PairRule[] = [
  { symbols: ["甲", "己"], type: "合", label: "合土", element: "土" },
  { symbols: ["乙", "庚"], type: "合", label: "合金", element: "金" },
  { symbols: ["丙", "辛"], type: "合", label: "合水", element: "水" },
  { symbols: ["丁", "壬"], type: "合", label: "合木", element: "木" },
  { symbols: ["戊", "癸"], type: "合", label: "合火", element: "火" },
];

const STEM_CLASH_RULES: PairRule[] = [
  { symbols: ["甲", "庚"], type: "冲", label: "冲" },
  { symbols: ["乙", "辛"], type: "冲", label: "冲" },
  { symbols: ["丙", "壬"], type: "冲", label: "冲" },
  { symbols: ["丁", "癸"], type: "冲", label: "冲" },
];

const BRANCH_COMBINE_RULES: PairRule[] = [
  { symbols: ["子", "丑"], type: "合", label: "合土", element: "土" },
  { symbols: ["寅", "亥"], type: "合", label: "合木", element: "木" },
  { symbols: ["卯", "戌"], type: "合", label: "合火", element: "火" },
  { symbols: ["辰", "酉"], type: "合", label: "合金", element: "金" },
  { symbols: ["巳", "申"], type: "合", label: "合水", element: "水" },
  { symbols: ["午", "未"], type: "合", label: "合土", element: "土" },
];

const BRANCH_TRINE_RULES: GroupRule[] = [
  { symbols: ["申", "子", "辰"], type: "三合", label: "三合水局", element: "水" },
  { symbols: ["巳", "酉", "丑"], type: "三合", label: "三合金局", element: "金" },
  { symbols: ["寅", "午", "戌"], type: "三合", label: "三合火局", element: "火" },
  { symbols: ["亥", "卯", "未"], type: "三合", label: "三合木局", element: "木" },
];

const BRANCH_HALF_COMBINE_RULES: PairRule[] = [
  { symbols: ["申", "子"], type: "半合", label: "半合水局", element: "水" },
  { symbols: ["子", "辰"], type: "半合", label: "半合水局", element: "水" },
  { symbols: ["巳", "酉"], type: "半合", label: "半合金局", element: "金" },
  { symbols: ["酉", "丑"], type: "半合", label: "半合金局", element: "金" },
  { symbols: ["寅", "午"], type: "半合", label: "半合火局", element: "火" },
  { symbols: ["午", "戌"], type: "半合", label: "半合火局", element: "火" },
  { symbols: ["亥", "卯"], type: "半合", label: "半合木局", element: "木" },
  { symbols: ["卯", "未"], type: "半合", label: "半合木局", element: "木" },
];

const BRANCH_MEETING_RULES: GroupRule[] = [
  { symbols: ["亥", "子", "丑"], type: "三会", label: "三会水局", element: "水" },
  { symbols: ["寅", "卯", "辰"], type: "三会", label: "三会木局", element: "木" },
  { symbols: ["巳", "午", "未"], type: "三会", label: "三会火局", element: "火" },
  { symbols: ["申", "酉", "戌"], type: "三会", label: "三会金局", element: "金" },
];

const BRANCH_CLASH_RULES: PairRule[] = [
  { symbols: ["子", "午"], type: "冲", label: "冲" },
  { symbols: ["丑", "未"], type: "冲", label: "冲" },
  { symbols: ["寅", "申"], type: "冲", label: "冲" },
  { symbols: ["卯", "酉"], type: "冲", label: "冲" },
  { symbols: ["辰", "戌"], type: "冲", label: "冲" },
  { symbols: ["巳", "亥"], type: "冲", label: "冲" },
];

const BRANCH_HARM_RULES: PairRule[] = [
  { symbols: ["子", "未"], type: "害", label: "害" },
  { symbols: ["丑", "午"], type: "害", label: "害" },
  { symbols: ["寅", "巳"], type: "害", label: "害" },
  { symbols: ["卯", "辰"], type: "害", label: "害" },
  { symbols: ["申", "亥"], type: "害", label: "害" },
  { symbols: ["酉", "戌"], type: "害", label: "害" },
];

const BRANCH_BREAK_RULES: PairRule[] = [
  { symbols: ["子", "酉"], type: "破", label: "破" },
  { symbols: ["午", "卯"], type: "破", label: "破" },
  { symbols: ["巳", "申"], type: "破", label: "破" },
  { symbols: ["寅", "亥"], type: "破", label: "破" },
  { symbols: ["辰", "丑"], type: "破", label: "破" },
  { symbols: ["戌", "未"], type: "破", label: "破" },
];

const BRANCH_TRIPLE_PUNISHMENT_RULES: GroupRule[] = [
  { symbols: ["寅", "巳", "申"], type: "刑", label: "无恩之刑", subtype: "无恩之刑" },
  { symbols: ["丑", "戌", "未"], type: "刑", label: "持势之刑", subtype: "持势之刑" },
];

const BRANCH_PAIR_PUNISHMENT_RULES: PairRule[] = [
  { symbols: ["寅", "巳"], type: "刑", label: "寅刑巳", subtype: "无恩之刑" },
  { symbols: ["巳", "申"], type: "刑", label: "巳刑申", subtype: "无恩之刑" },
  { symbols: ["申", "寅"], type: "刑", label: "申刑寅", subtype: "无恩之刑" },
  { symbols: ["未", "丑"], type: "刑", label: "未刑丑", subtype: "持势之刑" },
  { symbols: ["丑", "戌"], type: "刑", label: "丑刑戌", subtype: "持势之刑" },
  { symbols: ["戌", "未"], type: "刑", label: "戌刑未", subtype: "持势之刑" },
  { symbols: ["子", "卯"], type: "刑", label: "子卯刑", subtype: "无礼之刑" },
];

const BRANCH_SELF_PUNISHMENT_SYMBOLS = ["辰", "午", "酉", "亥"];
const RELATION_PRIORITY: Record<GanzhiRelationType, number> = {
  三会: 1,
  三合: 2,
  合: 3,
  半合: 4,
  冲: 5,
  刑: 6,
  害: 7,
  破: 8,
  克: 9,
};

export function analyzeGanzhiRelations(data: BaziData): GanzhiRelation[] {
  const stemPoints = getStemPoints(data);
  const branchPoints = getBranchPoints(data);
  const relations: GanzhiRelation[] = [];

  relations.push(...analyzeStemPairRules(stemPoints, STEM_COMBINE_RULES));
  relations.push(...analyzeStemPairRules(stemPoints, STEM_CLASH_RULES));
  relations.push(...analyzeStemOvercoming(stemPoints));

  const fullTrines = analyzeBranchGroupRules(branchPoints, BRANCH_TRINE_RULES);
  relations.push(...fullTrines);
  relations.push(...analyzeBranchGroupRules(branchPoints, BRANCH_MEETING_RULES));
  relations.push(...analyzeBranchPairRules(branchPoints, BRANCH_COMBINE_RULES));
  relations.push(...analyzeBranchPairRules(branchPoints, BRANCH_HALF_COMBINE_RULES, fullTrines));
  relations.push(...analyzeBranchPairRules(branchPoints, BRANCH_CLASH_RULES));
  relations.push(...analyzeBranchTriplePunishments(branchPoints));
  relations.push(...analyzeBranchPairPunishments(branchPoints));
  relations.push(...analyzeBranchSelfPunishments(branchPoints));
  relations.push(...analyzeBranchPairRules(branchPoints, BRANCH_HARM_RULES));
  relations.push(...analyzeBranchPairRules(branchPoints, BRANCH_BREAK_RULES));

  return relations
    .map((relation, index) => ({ ...relation, id: `${relation.id}-${index}` }))
    .sort(sortRelations);
}

function getStemPoints(data: BaziData): PillarPoint[] {
  const birthInfo = data.person.birth_info;
  return PILLARS.map((pillar, index) => ({
    position: pillar.key,
    index,
    label: pillar.label,
    symbol: birthInfo[pillar.key].heavenly_stem.symbol,
  }));
}

function getBranchPoints(data: BaziData): PillarPoint[] {
  const birthInfo = data.person.birth_info;
  return PILLARS.map((pillar, index) => ({
    position: pillar.key,
    index,
    label: pillar.label,
    symbol: birthInfo[pillar.key].earthly_branch.symbol,
  }));
}

function analyzeStemPairRules(points: PillarPoint[], rules: PairRule[]): GanzhiRelation[] {
  const relations: GanzhiRelation[] = [];
  forEachPointPair(points, (left, right) => {
    const rule = findUnorderedPairRule(rules, left.symbol, right.symbol, HEAVENLY_STEMS);
    if (rule) {
      relations.push(makePairRelation("stem", rule, left, right));
    }
  });
  return relations;
}

function analyzeStemOvercoming(points: PillarPoint[]): GanzhiRelation[] {
  const relations: GanzhiRelation[] = [];
  forEachPointPair(points, (left, right) => {
    const leftRule = getStemRule(left.symbol);
    const rightRule = getStemRule(right.symbol);

    if (OVERCOMING_RELATIONS[leftRule.wu_xing] === rightRule.wu_xing) {
      relations.push(makeDirectedRelation(left, right));
    } else if (OVERCOMING_RELATIONS[rightRule.wu_xing] === leftRule.wu_xing) {
      relations.push(makeDirectedRelation(right, left));
    }
  });
  return relations;
}

function analyzeBranchGroupRules(points: PillarPoint[], rules: GroupRule[]): GanzhiRelation[] {
  const relations: GanzhiRelation[] = [];
  for (const rule of rules) {
    const combinations = getGroupCombinations(points, rule.symbols);
    for (const combination of combinations) {
      relations.push(makeGroupRelation(rule, combination));
    }
  }
  return relations;
}

function analyzeBranchPairRules(
  points: PillarPoint[],
  rules: PairRule[],
  suppressedByGroups: GanzhiRelation[] = [],
): GanzhiRelation[] {
  const relations: GanzhiRelation[] = [];
  forEachPointPair(points, (left, right) => {
    const rule = findUnorderedPairRule(rules, left.symbol, right.symbol, EARTHLY_BRANCHES);
    if (!rule || isSuppressedByGroup(rule, left, right, suppressedByGroups)) {
      return;
    }
    relations.push(makePairRelation("branch", rule, left, right));
  });
  return relations;
}

function analyzeBranchTriplePunishments(points: PillarPoint[]): GanzhiRelation[] {
  return analyzeBranchGroupRules(points, BRANCH_TRIPLE_PUNISHMENT_RULES);
}

function analyzeBranchPairPunishments(points: PillarPoint[]): GanzhiRelation[] {
  const activeTriplePunishments = BRANCH_TRIPLE_PUNISHMENT_RULES.filter((rule) =>
    rule.symbols.every((symbol) => points.some((point) => point.symbol === symbol)),
  );
  const relations: GanzhiRelation[] = [];

  for (const rule of BRANCH_PAIR_PUNISHMENT_RULES) {
    if (activeTriplePunishments.some((tripleRule) => sameSymbolSet(tripleRule.symbols, rule.symbols))) {
      continue;
    }
    const [fromSymbol, toSymbol] = rule.symbols;
    const fromPoints = points.filter((point) => point.symbol === fromSymbol);
    const toPoints = points.filter((point) => point.symbol === toSymbol);
    for (const fromPoint of fromPoints) {
      for (const toPoint of toPoints) {
        relations.push(makePairRelation("branch", rule, fromPoint, toPoint, true));
      }
    }
  }

  return relations;
}

function analyzeBranchSelfPunishments(points: PillarPoint[]): GanzhiRelation[] {
  const relations: GanzhiRelation[] = [];
  for (const symbol of BRANCH_SELF_PUNISHMENT_SYMBOLS) {
    const sameSymbolPoints = points.filter((point) => point.symbol === symbol);
    forEachPointPair(sameSymbolPoints, (left, right) => {
      relations.push(
        makePairRelation(
          "branch",
          { symbols: [symbol, symbol], type: "刑", label: `${symbol}${symbol}自刑`, subtype: "自刑" },
          left,
          right,
        ),
      );
    });
  }
  return relations;
}

function makePairRelation(
  layer: GanzhiRelationLayer,
  rule: PairRule,
  left: PillarPoint,
  right: PillarPoint,
  directed = false,
): GanzhiRelation {
  const positions = [left.position, right.position];
  const positionIndexes = [left.index, right.index];
  return {
    id: `${layer}-${rule.type}-${positions.join("-")}-${rule.label}`,
    layer,
    type: rule.type,
    label: rule.label,
    element: rule.element,
    positions,
    positionIndexes,
    symbols: [left.symbol, right.symbol],
    subtype: rule.subtype,
    directed,
    fromPosition: directed ? left.position : undefined,
    toPosition: directed ? right.position : undefined,
  };
}

function makeGroupRelation(rule: GroupRule, points: PillarPoint[]): GanzhiRelation {
  const sortedPoints = [...points].sort((left, right) => left.index - right.index);
  return {
    id: `branch-${rule.type}-${sortedPoints.map((point) => point.position).join("-")}-${rule.label}`,
    layer: "branch",
    type: rule.type,
    label: rule.label,
    element: rule.element,
    positions: sortedPoints.map((point) => point.position),
    positionIndexes: sortedPoints.map((point) => point.index),
    symbols: sortedPoints.map((point) => point.symbol),
    subtype: rule.subtype,
  };
}

function makeDirectedRelation(from: PillarPoint, to: PillarPoint): GanzhiRelation {
  const positions = [from.position, to.position];
  return {
    id: `stem-克-${from.position}-${to.position}-${from.symbol}克${to.symbol}`,
    layer: "stem",
    type: "克",
    label: `${from.symbol}克${to.symbol}`,
    element: getStemRule(from.symbol).wu_xing,
    positions,
    positionIndexes: [from.index, to.index],
    symbols: [from.symbol, to.symbol],
    directed: true,
    fromPosition: from.position,
    toPosition: to.position,
  };
}

function forEachPointPair(points: PillarPoint[], callback: (left: PillarPoint, right: PillarPoint) => void): void {
  for (let leftIndex = 0; leftIndex < points.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < points.length; rightIndex += 1) {
      callback(points[leftIndex], points[rightIndex]);
    }
  }
}

function findUnorderedPairRule(
  rules: PairRule[],
  left: string,
  right: string,
  order: string[],
): PairRule | undefined {
  const targetKey = normalizePairKey(left, right, order);
  return rules.find((rule) => normalizePairKey(rule.symbols[0], rule.symbols[1], order) === targetKey);
}

function normalizePairKey(left: string, right: string, order: string[]): string {
  return [left, right]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .join("");
}

function getGroupCombinations(points: PillarPoint[], symbols: [string, string, string]): PillarPoint[][] {
  const groupPoints = symbols.map((symbol) => points.filter((point) => point.symbol === symbol));
  if (groupPoints.some((items) => items.length === 0)) {
    return [];
  }

  const combinations: PillarPoint[][] = [];
  for (const first of groupPoints[0]) {
    for (const second of groupPoints[1]) {
      for (const third of groupPoints[2]) {
        const ids = new Set([first.position, second.position, third.position]);
        if (ids.size === 3) {
          combinations.push([first, second, third]);
        }
      }
    }
  }
  return combinations;
}

function isSuppressedByGroup(
  rule: PairRule,
  left: PillarPoint,
  right: PillarPoint,
  groups: GanzhiRelation[],
): boolean {
  if (rule.type !== "半合") {
    return false;
  }
  return groups.some((group) => {
    const groupSymbols = new Set(group.symbols);
    return group.type === "三合" && groupSymbols.has(left.symbol) && groupSymbols.has(right.symbol);
  });
}

function sameSymbolSet(fullSet: readonly string[], subset: readonly string[]): boolean {
  return subset.every((symbol) => fullSet.includes(symbol));
}

function sortRelations(left: GanzhiRelation, right: GanzhiRelation): number {
  const layerDiff = left.layer.localeCompare(right.layer);
  if (layerDiff !== 0) {
    return left.layer === "stem" ? -1 : 1;
  }
  const priorityDiff = RELATION_PRIORITY[left.type] - RELATION_PRIORITY[right.type];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }
  const leftIndex = Math.min(...left.positionIndexes);
  const rightIndex = Math.min(...right.positionIndexes);
  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }
  return Math.max(...left.positionIndexes) - Math.max(...right.positionIndexes);
}
