import type { BaziData, PillarName } from "./types.ts";

const PILLARS: Array<{ key: PillarName; label: string }> = [
  { key: "year", label: "年柱" },
  { key: "month", label: "月柱" },
  { key: "day", label: "日柱" },
  { key: "hour", label: "时柱" },
];

const BRANCHES = "子丑寅卯辰巳午未申酉戌亥".split("");
const GANZHI_60 = [
  "甲子",
  "乙丑",
  "丙寅",
  "丁卯",
  "戊辰",
  "己巳",
  "庚午",
  "辛未",
  "壬申",
  "癸酉",
  "甲戌",
  "乙亥",
  "丙子",
  "丁丑",
  "戊寅",
  "己卯",
  "庚辰",
  "辛巳",
  "壬午",
  "癸未",
  "甲申",
  "乙酉",
  "丙戌",
  "丁亥",
  "戊子",
  "己丑",
  "庚寅",
  "辛卯",
  "壬辰",
  "癸巳",
  "甲午",
  "乙未",
  "丙申",
  "丁酉",
  "戊戌",
  "己亥",
  "庚子",
  "辛丑",
  "壬寅",
  "癸卯",
  "甲辰",
  "乙巳",
  "丙午",
  "丁未",
  "戊申",
  "己酉",
  "庚戌",
  "辛亥",
  "壬子",
  "癸丑",
  "甲寅",
  "乙卯",
  "丙辰",
  "丁巳",
  "戊午",
  "己未",
  "庚申",
  "辛酉",
  "壬戌",
  "癸亥",
];

export interface ShenShaDefinition {
  name: string;
  category: "吉神" | "凶煞" | "中性" | "组合";
  summary: string;
  checkMethod: string;
  detail: string;
}

export interface ShenShaHit {
  name: string;
  pillar: PillarName;
  pillarLabel: string;
  category: ShenShaDefinition["category"];
  basis: string;
  summary: string;
  checkMethod: string;
}

export type ShenShaByPillar = Record<PillarName, ShenShaHit[]>;

type AddHit = (name: string, pillar: PillarName, basis: string) => void;
type RuleApply = (context: ShenShaContext, add: AddHit) => void;

interface ShenShaRule extends ShenShaDefinition {
  apply: RuleApply;
}

interface ShenShaContext {
  stems: Record<PillarName, string>;
  branches: Record<PillarName, string>;
  ganzhi: Record<PillarName, string>;
  yearStem: string;
  dayStem: string;
  yearBranch: string;
  monthBranch: string;
  dayBranch: string;
}

const STEM_SOURCE_LABEL: Record<"yearStem" | "dayStem", string> = {
  yearStem: "年干",
  dayStem: "日干",
};

const BRANCH_SOURCE_LABEL: Record<"yearBranch" | "dayBranch", string> = {
  yearBranch: "年支",
  dayBranch: "日支",
};

const TIAN_YI: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  辛: ["寅", "午"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};

const TAI_JI: Record<string, string[]> = {
  甲: ["子", "午"],
  乙: ["子", "午"],
  丙: ["卯", "酉"],
  丁: ["卯", "酉"],
  戊: ["辰", "戌", "丑", "未"],
  己: ["辰", "戌", "丑", "未"],
  庚: ["寅", "亥"],
  辛: ["寅", "亥"],
  壬: ["巳", "申"],
  癸: ["巳", "申"],
};

const WEN_CHANG: Record<string, string[]> = {
  甲: ["巳"],
  乙: ["午"],
  丙: ["申"],
  戊: ["申"],
  丁: ["酉"],
  己: ["酉"],
  庚: ["亥"],
  辛: ["子"],
  壬: ["寅"],
  癸: ["卯"],
};

const FU_XING: Record<string, string[]> = {
  甲: ["寅", "子"],
  丙: ["寅", "子"],
  乙: ["丑", "卯"],
  癸: ["丑", "卯"],
  丁: ["亥"],
  戊: ["申"],
  己: ["未"],
  庚: ["午"],
  辛: ["巳"],
  壬: ["辰"],
};

const GUO_YIN: Record<string, string[]> = {
  甲: ["戌"],
  乙: ["亥"],
  丙: ["丑"],
  戊: ["丑"],
  丁: ["寅"],
  己: ["寅"],
  庚: ["辰"],
  辛: ["巳"],
  壬: ["未"],
  癸: ["申"],
};

const TIAN_CHU: Record<string, string[]> = {
  甲: ["巳"],
  丙: ["巳"],
  乙: ["午"],
  丁: ["午"],
  戊: ["申"],
  己: ["酉"],
  庚: ["亥"],
  辛: ["子"],
  壬: ["寅"],
  癸: ["卯"],
};

const JIN_YU: Record<string, string[]> = {
  甲: ["辰"],
  乙: ["巳"],
  丙: ["未"],
  戊: ["未"],
  丁: ["申"],
  己: ["申"],
  庚: ["戌"],
  辛: ["亥"],
  壬: ["丑"],
  癸: ["寅"],
};

const LU_SHEN: Record<string, string[]> = {
  甲: ["寅"],
  乙: ["卯"],
  丙: ["巳"],
  戊: ["巳"],
  丁: ["午"],
  己: ["午"],
  庚: ["申"],
  辛: ["酉"],
  壬: ["亥"],
  癸: ["子"],
};

const YANG_REN: Record<string, string[]> = {
  甲: ["卯"],
  乙: ["寅"],
  丙: ["午"],
  戊: ["午"],
  丁: ["巳"],
  己: ["巳"],
  庚: ["酉"],
  辛: ["申"],
  壬: ["子"],
  癸: ["亥"],
};

const HONG_YAN: Record<string, string[]> = {
  甲: ["午"],
  乙: ["申"],
  丙: ["寅"],
  丁: ["未"],
  戊: ["辰"],
  己: ["辰"],
  庚: ["戌"],
  辛: ["酉"],
  壬: ["子"],
  癸: ["申"],
};

const LIU_XIA: Record<string, string[]> = {
  甲: ["酉"],
  乙: ["戌"],
  丙: ["未"],
  丁: ["申"],
  戊: ["巳"],
  己: ["午"],
  庚: ["辰"],
  辛: ["卯"],
  壬: ["亥"],
  癸: ["寅"],
};

const XUE_REN: Record<string, string[]> = {
  甲: ["卯"],
  乙: ["辰"],
  丙: ["午"],
  戊: ["午"],
  丁: ["未"],
  己: ["未"],
  庚: ["酉"],
  辛: ["戌"],
  壬: ["子"],
  癸: ["丑"],
};

const XUE_TANG: Record<string, string[]> = {
  甲: ["亥"],
  乙: ["午"],
  丙: ["寅"],
  丁: ["酉"],
  戊: ["申"],
  己: ["酉"],
  庚: ["巳"],
  辛: ["子"],
  壬: ["申"],
  癸: ["卯"],
};

const TRIAD_BRANCH_RULES = {
  驿马: {
    申: "寅",
    子: "寅",
    辰: "寅",
    寅: "申",
    午: "申",
    戌: "申",
    巳: "亥",
    酉: "亥",
    丑: "亥",
    亥: "巳",
    卯: "巳",
    未: "巳",
  },
  华盖: {
    申: "辰",
    子: "辰",
    辰: "辰",
    寅: "戌",
    午: "戌",
    戌: "戌",
    巳: "丑",
    酉: "丑",
    丑: "丑",
    亥: "未",
    卯: "未",
    未: "未",
  },
  将星: {
    申: "子",
    子: "子",
    辰: "子",
    寅: "午",
    午: "午",
    戌: "午",
    巳: "酉",
    酉: "酉",
    丑: "酉",
    亥: "卯",
    卯: "卯",
    未: "卯",
  },
  桃花: {
    申: "酉",
    子: "酉",
    辰: "酉",
    寅: "卯",
    午: "卯",
    戌: "卯",
    巳: "午",
    酉: "午",
    丑: "午",
    亥: "子",
    卯: "子",
    未: "子",
  },
  亡神: {
    申: "亥",
    子: "亥",
    辰: "亥",
    寅: "巳",
    午: "巳",
    戌: "巳",
    巳: "申",
    酉: "申",
    丑: "申",
    亥: "寅",
    卯: "寅",
    未: "寅",
  },
  劫煞: {
    申: "巳",
    子: "巳",
    辰: "巳",
    寅: "亥",
    午: "亥",
    戌: "亥",
    巳: "寅",
    酉: "寅",
    丑: "寅",
    亥: "申",
    卯: "申",
    未: "申",
  },
  灾煞: {
    申: "午",
    子: "午",
    辰: "午",
    寅: "子",
    午: "子",
    戌: "子",
    巳: "卯",
    酉: "卯",
    丑: "卯",
    亥: "酉",
    卯: "酉",
    未: "酉",
  },
} as const;

const GU_CHEN: Record<string, string> = {
  亥: "寅",
  子: "寅",
  丑: "寅",
  寅: "巳",
  卯: "巳",
  辰: "巳",
  巳: "申",
  午: "申",
  未: "申",
  申: "亥",
  酉: "亥",
  戌: "亥",
};

const GUA_SU: Record<string, string> = {
  亥: "戌",
  子: "戌",
  丑: "戌",
  寅: "丑",
  卯: "丑",
  辰: "丑",
  巳: "辰",
  午: "辰",
  未: "辰",
  申: "未",
  酉: "未",
  戌: "未",
};

const HONG_LUAN: Record<string, string> = {
  子: "卯",
  丑: "寅",
  寅: "丑",
  卯: "子",
  辰: "亥",
  巳: "戌",
  午: "酉",
  未: "申",
  申: "未",
  酉: "午",
  戌: "巳",
  亥: "辰",
};

const TIAN_XI: Record<string, string> = {
  子: "酉",
  丑: "申",
  寅: "未",
  卯: "午",
  辰: "巳",
  巳: "辰",
  午: "卯",
  未: "寅",
  申: "丑",
  酉: "子",
  戌: "亥",
  亥: "戌",
};

const TIAN_DE: Record<string, string> = {
  寅: "丁",
  卯: "申",
  辰: "壬",
  巳: "辛",
  午: "亥",
  未: "甲",
  申: "癸",
  酉: "寅",
  戌: "丙",
  亥: "乙",
  子: "巳",
  丑: "庚",
};

const YUE_DE: Record<string, string> = {
  寅: "丙",
  午: "丙",
  戌: "丙",
  申: "壬",
  子: "壬",
  辰: "壬",
  亥: "甲",
  卯: "甲",
  未: "甲",
  巳: "庚",
  酉: "庚",
  丑: "庚",
};

const TIAN_YI_MEDICINE: Record<string, string> = {
  寅: "丑",
  卯: "寅",
  辰: "卯",
  巳: "辰",
  午: "巳",
  未: "午",
  申: "未",
  酉: "申",
  戌: "酉",
  亥: "戌",
  子: "亥",
  丑: "子",
};

const TIAN_SHE_BY_SEASON: Record<string, string> = {
  spring: "戊寅",
  summer: "甲午",
  autumn: "戊申",
  winter: "甲子",
};

const SI_FEI_BY_SEASON: Record<string, string[]> = {
  spring: ["庚申", "辛酉"],
  summer: ["壬子", "癸亥"],
  autumn: ["甲寅", "乙卯"],
  winter: ["丙午", "丁巳"],
};

const KUI_GANG = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);
const SHI_E_DA_BAI = new Set(["甲辰", "乙巳", "丙申", "丁亥", "戊戌", "己丑", "庚辰", "辛巳", "壬申", "癸亥"]);
const YIN_CHA_YANG_CUO = new Set([
  "丙子",
  "丁丑",
  "戊寅",
  "辛卯",
  "壬辰",
  "癸巳",
  "丙午",
  "丁未",
  "戊申",
  "辛酉",
  "壬戌",
  "癸亥",
]);
const JIN_SHEN = new Set(["乙丑", "己巳", "癸酉"]);

const SHEN_SHA_RULES: ShenShaRule[] = [
  stemBranchRule(
    "天乙贵人",
    "吉神",
    "贵人类神煞，常作为遇助、解厄、逢凶化吉的辅助提示。",
    "以年干、日干查四柱地支：甲戊庚丑未，乙己子申，丙丁亥酉，辛寅午，壬癸卯巳。",
    "天乙贵人是八字神煞中常见的贵人星，本版按年干与日干并查，命中哪个地支就落在哪一柱。",
    TIAN_YI,
  ),
  stemBranchRule(
    "太极贵人",
    "吉神",
    "主悟性、学习、玄学兴趣和遇事有转圜空间。",
    "以年干、日干查四柱地支：甲乙子午，丙丁卯酉，戊己辰戌丑未，庚辛寅亥，壬癸巳申。",
    "太极贵人偏重悟性和学习能力，常用于辅助观察命局中的学术、术数或理解力倾向。",
    TAI_JI,
  ),
  stemBranchRule(
    "文昌贵人",
    "吉神",
    "主文书、考试、表达、学习和条理能力。",
    "以年干、日干查四柱地支：甲巳，乙午，丙戊申，丁己酉，庚亥，辛子，壬寅，癸卯。",
    "文昌贵人是文书学习类神煞，适合在弹窗中提示其只代表辅助倾向，不直接等同学历或成绩。",
    WEN_CHANG,
  ),
  stemBranchRule(
    "福星贵人",
    "吉神",
    "主福气、顺遂和较容易得到照拂。",
    "以年干、日干查四柱地支：甲丙寅子，乙癸丑卯，丁亥，戊申，己未，庚午，辛巳，壬辰。",
    "福星贵人常作为吉星展示，参考图中的戊寅、甲子样例可由甲见寅子和戊见申触发。",
    FU_XING,
  ),
  stemBranchRule(
    "国印贵人",
    "吉神",
    "主印信、资质、名誉、规则意识和组织体系中的凭据。",
    "以年干、日干查四柱地支：甲戌，乙亥，丙戊丑，丁己寅，庚辰，辛巳，壬未，癸申。",
    "国印贵人偏向制度、证书、职衔、印信一类象意，落点只作为提示。",
    GUO_YIN,
  ),
  stemBranchRule(
    "天厨贵人",
    "吉神",
    "主饮食、福禄、资源和生活享受。",
    "以年干、日干查四柱地支：甲丙巳，乙丁午，戊申，己酉，庚亥，辛子，壬寅，癸卯。",
    "天厨贵人常被解释为食禄之星；参考图中甲见巳、戊见申的结果，本版按年日干并查。",
    TIAN_CHU,
  ),
  stemBranchRule(
    "金舆",
    "吉神",
    "主车舆、仪仗、享受、配偶助力和外在条件。",
    "以年干、日干查四柱地支：甲辰，乙巳，丙戊未，丁己申，庚戌，辛亥，壬丑，癸寅。",
    "金舆为传统吉星之一，现代产品中多作为生活条件、交通车舆和伴侣助力的辅助提示。",
    JIN_YU,
  ),
  stemBranchRule(
    "禄神",
    "吉神",
    "主禄位、资源、俸禄和个人根气。",
    "以年干、日干查四柱地支：甲寅，乙卯，丙戊巳，丁己午，庚申，辛酉，壬亥，癸子。",
    "禄神取天干临官之地，本版按年干与日干并查，命中地支所在柱显示。",
    LU_SHEN,
  ),
  stemBranchRule(
    "羊刃",
    "凶煞",
    "主刚烈、冲劲、锋芒，也提示过强过急的风险。",
    "以年干、日干查四柱地支：甲卯，乙寅，丙戊午，丁己巳，庚酉，辛申，壬子，癸亥。",
    "羊刃不必一概作凶，需结合命局强弱和用神；本版仅展示命中信息。",
    YANG_REN,
  ),
  stemBranchRule(
    "红艳",
    "中性",
    "主人缘、审美、外在吸引力，也可能提示情感扰动。",
    "以年干、日干查四柱地支：甲午，乙申，丙寅，丁未，戊己辰，庚戌，辛酉，壬子，癸申。",
    "红艳是桃花类神煞之一，解释上需要避免直接作感情结论。",
    HONG_YAN,
  ),
  stemBranchRule(
    "流霞",
    "凶煞",
    "传统多作血光、伤灾类提示，现代产品宜弱化为风险提醒。",
    "以年干、日干查四柱地支：甲酉，乙戌，丙未，丁申，戊巳，己午，庚辰，辛卯，壬亥，癸寅。",
    "流霞属于风险类神煞，必须结合全局，不应单独判断健康或灾祸。",
    LIU_XIA,
  ),
  stemBranchRule(
    "血刃",
    "凶煞",
    "传统多提示伤血、手术、金属锐器等风险象意。",
    "以年干、日干查四柱地支：甲卯，乙辰，丙戊午，丁己未，庚酉，辛戌，壬子，癸丑。",
    "血刃只做传统文化展示，不构成健康、医疗或安全判断。",
    XUE_REN,
  ),
  branchTriadRule("驿马", "中性", "主迁动、出行、变动、奔波和外部机会。", "以年支、日支所属三合局查：申子辰见寅，寅午戌见申，巳酉丑见亥，亥卯未见巳。", "驿马表示动象，可能是出行迁移，也可能是工作节奏和环境变化。"),
  branchTriadRule("华盖", "中性", "主独立、技艺、宗教玄学、审美，也有孤高之象。", "以年支、日支所属三合局查：申子辰见辰，寅午戌见戌，巳酉丑见丑，亥卯未见未。", "华盖常被用于观察艺术、专研、清高或孤独倾向，不能单独作吉凶。"),
  branchTriadRule("将星", "吉神", "主掌控、组织、行动力和一定领导象意。", "以年支、日支所属三合局查：申子辰见子，寅午戌见午，巳酉丑见酉，亥卯未见卯。", "将星偏行动和掌控力，落点仅提示柱位，不直接代表职务高低。"),
  branchTriadRule("桃花", "中性", "主人缘、审美、情感互动和社交吸引力。", "以年支、日支所属三合局查：申子辰见酉，寅午戌见卯，巳酉丑见午，亥卯未见子。", "桃花又称咸池，解释时需结合十神、合冲和全局，避免单点断语。"),
  branchTriadRule("亡神", "凶煞", "主失落、耗散、心神不宁等传统风险象意。", "以年支、日支所属三合局查：申子辰见亥，寅午戌见巳，巳酉丑见申，亥卯未见寅。", "亡神属于传统凶煞，实际解读必须结合命局喜忌。"),
  branchTriadRule("劫煞", "凶煞", "主阻碍、争夺、突发变动和损耗象意。", "以年支、日支所属三合局查：申子辰见巳，寅午戌见亥，巳酉丑见寅，亥卯未见申。", "劫煞只提示传统象意，不应单独定性事件。"),
  branchTriadRule("灾煞", "凶煞", "传统用于提示灾扰、冲击和不顺因素。",
    "以年支、日支所属三合局查：申子辰见午，寅午戌见子，巳酉丑见卯，亥卯未见酉。",
    "灾煞属于风险提示类神煞，需要与刑冲合害、用神喜忌共同判断。"),
  singleYearBranchRule("孤辰", "凶煞", "主孤独、自立、亲缘淡薄等传统象意。", "以年支查：亥子丑见寅，寅卯辰见巳，巳午未见申，申酉戌见亥。", "孤辰与寡宿常成对观察，不宜单独下结论。", GU_CHEN),
  singleYearBranchRule("寡宿", "凶煞", "主孤寡、情感距离和独处倾向等传统象意。", "以年支查：亥子丑见戌，寅卯辰见丑，巳午未见辰，申酉戌见未。", "寡宿常与孤辰、夫妻宫和全局组合一起看。", GUA_SU),
  singleYearBranchRule("红鸾", "吉神", "主婚恋、人缘、喜庆与情感机会。", "以年支查固定地支：子卯、丑寅、寅丑、卯子、辰亥、巳戌、午酉、未申、申未、酉午、戌巳、亥辰。", "红鸾属于喜庆类神煞，和天喜常配套出现。", HONG_LUAN),
  singleYearBranchRule("天喜", "吉神", "主喜庆、人缘、婚恋助力和愉悦事件。", "以年支查红鸾对冲位：子酉、丑申、寅未、卯午、辰巳、巳辰、午卯、未寅、申丑、酉子、戌亥、亥戌。", "天喜常与红鸾互参，落点只表示传统象意触发。", TIAN_XI),
  {
    name: "天德贵人",
    category: "吉神",
    summary: "主德泽、解厄、贵助和较温和的保护性象意。",
    checkMethod: "以月支查天干或地支：寅丁、卯申、辰壬、巳辛、午亥、未甲、申癸、酉寅、戌丙、亥乙、子巳、丑庚。",
    detail: "天德贵人取月令为依据，目标可能是天干也可能是地支，因此本版会同时匹配四柱天干和地支。",
    apply(context, add) {
      const target = TIAN_DE[context.monthBranch];
      addSymbolMatches("天德贵人", context, add, [target], `月支${context.monthBranch}见${target}`);
    },
  },
  {
    name: "月德贵人",
    category: "吉神",
    summary: "主德泽、贵助、缓和冲突和逢凶化吉的辅助象意。",
    checkMethod: "以月支查天干：寅午戌月见丙，申子辰月见壬，亥卯未月见甲，巳酉丑月见庚。",
    detail: "月德贵人以月支三合局取天干，本版只匹配四柱天干。",
    apply(context, add) {
      const target = YUE_DE[context.monthBranch];
      addStemMatches("月德贵人", context, add, [target], `月支${context.monthBranch}见${target}`);
    },
  },
  {
    name: "天医",
    category: "吉神",
    summary: "主医药、调养、修复和健康照护相关象意。",
    checkMethod: "以月支前一位为天医：寅月见丑，卯月见寅，依十二支逆推。",
    detail: "天医按月令取前一支，本版匹配四柱地支。",
    apply(context, add) {
      const target = TIAN_YI_MEDICINE[context.monthBranch];
      addBranchMatches("天医", context, add, [target], `月支${context.monthBranch}前一位${target}`);
    },
  },
  stemBranchRule(
    "学堂",
    "吉神",
    "主学习、悟性、专业训练和知识积累。",
    "以年干、日干查四柱地支：甲亥，乙午，丙寅，丁酉，戊申，己酉，庚巳，辛子，壬申，癸卯。",
    "学堂存在纳音派别。本版采用排盘软件常见的年干、日干并查表，便于四柱静态展示。",
    XUE_TANG,
  ),
  stemBranchRule(
    "词馆",
    "吉神",
    "主文才、表达、文章、名誉和知识输出。",
    "首版按学堂同位并列显示；后续如引入纳音派别，可在文档中拆分 variant。",
    "词馆的派别差异明显。本版为贴近常见排盘展示，先与学堂同位显示，并在文档中标注可扩展。",
    XUE_TANG,
  ),
  {
    name: "空亡",
    category: "中性",
    summary: "又称旬空，主虚、空、迟滞或落空的传统象意。",
    checkMethod: "以年柱、日柱所在旬计算旬空；若其他柱地支落入年柱或日柱旬空，则显示空亡。",
    detail: "空亡可按年柱、日柱或各柱自旬显示，不同软件口径不同。本版神煞行采用年柱、日柱旬空触发。",
    apply(context, add) {
      const yearEmpty = getEmptyBranches(context.ganzhi.year);
      const dayEmpty = getEmptyBranches(context.ganzhi.day);
      addBranchMatches("空亡", context, add, yearEmpty, `年柱${context.ganzhi.year}旬空${yearEmpty.join("")}`);
      addBranchMatches("空亡", context, add, dayEmpty, `日柱${context.ganzhi.day}旬空${dayEmpty.join("")}`);
    },
  },
  {
    name: "天赦",
    category: "吉神",
    summary: "主赦免、缓和、解厄和得到转机。",
    checkMethod: "春寅卯辰月戊寅日；夏巳午未月甲午日；秋申酉戌月戊申日；冬亥子丑月甲子日。",
    detail: "天赦以月令季节和日柱组合判定，只落在日柱。",
    apply(context, add) {
      const season = getSeason(context.monthBranch);
      const target = TIAN_SHE_BY_SEASON[season];
      if (context.ganzhi.day === target) {
        add("天赦", "day", `${seasonLabel(season)}月令见${target}日`);
      }
    },
  },
  wholeDayRule("魁罡", "中性", "主刚强、果断、气势重，也可能过刚。", "日柱为庚辰、庚戌、壬辰、戊戌。", "魁罡只按日柱判定，解释时需结合命局强弱。", KUI_GANG),
  wholeDayRule("十恶大败", "凶煞", "传统多作破耗、不利积累的风险提示。", "日柱为甲辰、乙巳、丙申、丁亥、戊戌、己丑、庚辰、辛巳、壬申、癸亥。", "十恶大败只按日柱判定，不应单独推断财务结果。", SHI_E_DA_BAI),
  wholeDayRule("阴差阳错", "凶煞", "传统多用于婚恋、人际错位和事与愿违的辅助提示。", "日柱为丙子、丁丑、戊寅、辛卯、壬辰、癸巳、丙午、丁未、戊申、辛酉、壬戌、癸亥。", "阴差阳错只按日柱判定，不能脱离全局作感情结论。", YIN_CHA_YANG_CUO),
  {
    name: "金神",
    category: "中性",
    summary: "传统特殊日时神煞，主刚锐、肃杀和特殊格局触发条件。",
    checkMethod: "日柱或时柱为乙丑、己巳、癸酉。",
    detail: "金神多用于特定格局讨论，本版只展示日柱、时柱是否命中。",
    apply(context, add) {
      (["day", "hour"] as PillarName[]).forEach((pillar) => {
        if (JIN_SHEN.has(context.ganzhi[pillar])) {
          add("金神", pillar, `${pillarLabel(pillar)}${context.ganzhi[pillar]}命中`);
        }
      });
    },
  },
  {
    name: "四废",
    category: "凶煞",
    summary: "传统多作时令失势、不宜作为的风险象意。",
    checkMethod: "春庚申辛酉，夏壬子癸亥，秋甲寅乙卯，冬丙午丁巳。",
    detail: "四废按月令季节与日柱组合判定，只落在日柱。",
    apply(context, add) {
      const season = getSeason(context.monthBranch);
      if (SI_FEI_BY_SEASON[season].includes(context.ganzhi.day)) {
        add("四废", "day", `${seasonLabel(season)}月令见${context.ganzhi.day}日`);
      }
    },
  },
];

export const SHEN_SHA_DEFINITIONS: ShenShaDefinition[] = SHEN_SHA_RULES.map(({ apply: _apply, ...definition }) => definition);

export function analyzeShenSha(data: BaziData): ShenShaByPillar {
  const context = createContext(data);
  const result: ShenShaByPillar = {
    year: [],
    month: [],
    day: [],
    hour: [],
  };
  const seen = new Set<string>();
  const definitionMap = new Map(SHEN_SHA_RULES.map((rule) => [rule.name, rule]));

  const add: AddHit = (name, pillar, basis) => {
    const key = `${name}:${pillar}`;
    if (seen.has(key)) {
      return;
    }
    const definition = definitionMap.get(name);
    if (!definition) {
      return;
    }
    seen.add(key);
    result[pillar].push({
      name,
      pillar,
      pillarLabel: pillarLabel(pillar),
      category: definition.category,
      basis,
      summary: definition.summary,
      checkMethod: definition.checkMethod,
    });
  };

  for (const rule of SHEN_SHA_RULES) {
    rule.apply(context, add);
  }

  return result;
}

export function getShenShaDefinition(name: string): ShenShaDefinition | null {
  return SHEN_SHA_DEFINITIONS.find((definition) => definition.name === name) ?? null;
}

function stemBranchRule(
  name: string,
  category: ShenShaDefinition["category"],
  summary: string,
  checkMethod: string,
  detail: string,
  table: Record<string, string[]>,
): ShenShaRule {
  return {
    name,
    category,
    summary,
    checkMethod,
    detail,
    apply(context, add) {
      applyStemBranchTable(name, context, add, table);
    },
  };
}

function branchTriadRule(
  name: keyof typeof TRIAD_BRANCH_RULES,
  category: ShenShaDefinition["category"],
  summary: string,
  checkMethod: string,
  detail: string,
): ShenShaRule {
  return {
    name,
    category,
    summary,
    checkMethod,
    detail,
    apply(context, add) {
      const table = TRIAD_BRANCH_RULES[name];
      (["yearBranch", "dayBranch"] as const).forEach((source) => {
        const branch = context[source];
        const target = table[branch as keyof typeof table];
        addBranchMatches(name, context, add, [target], `${BRANCH_SOURCE_LABEL[source]}${branch}见${target}`);
      });
    },
  };
}

function singleYearBranchRule(
  name: string,
  category: ShenShaDefinition["category"],
  summary: string,
  checkMethod: string,
  detail: string,
  table: Record<string, string>,
): ShenShaRule {
  return {
    name,
    category,
    summary,
    checkMethod,
    detail,
    apply(context, add) {
      const target = table[context.yearBranch];
      addBranchMatches(name, context, add, [target], `年支${context.yearBranch}见${target}`);
    },
  };
}

function wholeDayRule(
  name: string,
  category: ShenShaDefinition["category"],
  summary: string,
  checkMethod: string,
  detail: string,
  ganzhiSet: Set<string>,
): ShenShaRule {
  return {
    name,
    category,
    summary,
    checkMethod,
    detail,
    apply(context, add) {
      if (ganzhiSet.has(context.ganzhi.day)) {
        add(name, "day", `日柱${context.ganzhi.day}命中`);
      }
    },
  };
}

function applyStemBranchTable(name: string, context: ShenShaContext, add: AddHit, table: Record<string, string[]>): void {
  (["yearStem", "dayStem"] as const).forEach((source) => {
    const stem = context[source];
    const targets = table[stem] ?? [];
    addBranchMatches(name, context, add, targets, `${STEM_SOURCE_LABEL[source]}${stem}见${targets.join("")}`);
  });
}

function addStemMatches(name: string, context: ShenShaContext, add: AddHit, targets: string[], basis: string): void {
  if (!targets.length) {
    return;
  }
  for (const pillar of PILLARS) {
    if (targets.includes(context.stems[pillar.key])) {
      add(name, pillar.key, basis);
    }
  }
}

function addBranchMatches(name: string, context: ShenShaContext, add: AddHit, targets: string[], basis: string): void {
  if (!targets.length) {
    return;
  }
  for (const pillar of PILLARS) {
    if (targets.includes(context.branches[pillar.key])) {
      add(name, pillar.key, basis);
    }
  }
}

function addSymbolMatches(name: string, context: ShenShaContext, add: AddHit, targets: string[], basis: string): void {
  if (!targets.length) {
    return;
  }
  for (const pillar of PILLARS) {
    if (targets.includes(context.stems[pillar.key]) || targets.includes(context.branches[pillar.key])) {
      add(name, pillar.key, basis);
    }
  }
}

function createContext(data: BaziData): ShenShaContext {
  const birthInfo = data.person.birth_info;
  const stems = {} as Record<PillarName, string>;
  const branches = {} as Record<PillarName, string>;
  const ganzhi = {} as Record<PillarName, string>;

  for (const pillar of PILLARS) {
    const stem = birthInfo[pillar.key].heavenly_stem.symbol;
    const branch = birthInfo[pillar.key].earthly_branch.symbol;
    stems[pillar.key] = stem;
    branches[pillar.key] = branch;
    ganzhi[pillar.key] = `${stem}${branch}`;
  }

  return {
    stems,
    branches,
    ganzhi,
    yearStem: stems.year,
    dayStem: stems.day,
    yearBranch: branches.year,
    monthBranch: branches.month,
    dayBranch: branches.day,
  };
}

function getEmptyBranches(ganzhi: string): string[] {
  const index = GANZHI_60.indexOf(ganzhi);
  if (index < 0) {
    return [];
  }
  const xunStart = Math.floor(index / 10) * 10;
  const startBranch = GANZHI_60[xunStart][1];
  const startBranchIndex = BRANCHES.indexOf(startBranch);
  return [BRANCHES[(startBranchIndex + 10) % 12], BRANCHES[(startBranchIndex + 11) % 12]];
}

function getSeason(monthBranch: string): "spring" | "summer" | "autumn" | "winter" {
  if (["寅", "卯", "辰"].includes(monthBranch)) {
    return "spring";
  }
  if (["巳", "午", "未"].includes(monthBranch)) {
    return "summer";
  }
  if (["申", "酉", "戌"].includes(monthBranch)) {
    return "autumn";
  }
  return "winter";
}

function seasonLabel(season: ReturnType<typeof getSeason>): string {
  const labels: Record<ReturnType<typeof getSeason>, string> = {
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
  };
  return labels[season];
}

function pillarLabel(pillar: PillarName): string {
  return PILLARS.find((item) => item.key === pillar)?.label ?? pillar;
}
