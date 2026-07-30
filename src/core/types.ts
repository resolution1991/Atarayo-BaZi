export type Gender = "男" | "女";
export type WuXing = "木" | "火" | "土" | "金" | "水";
export type YinYang = "阴" | "阳";
export type PillarName = "year" | "month" | "day" | "hour";

export interface BaziInput {
  name: string;
  gender: Gender;
  birth_datetime: string;
}

export interface ParsedDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface LunarCalendarEntry {
  lunar_year: number;
  lunar_month: number;
  lunar_day: number;
  ganzhi_year: string;
  ganzhi_month: string;
  ganzhi_day: string;
}

export type LunarCalendarMap = Record<string, LunarCalendarEntry>;
export type LunarCalendarTuple = [number, number, number, string, string, string];
export type CompactLunarCalendarByYear = Record<string, LunarCalendarTuple[]>;

export interface LunarCalendarLookup {
  get(dateKey: string): LunarCalendarEntry | undefined;
  findGregorianDatesByLunar?(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
  ): string[];
}

export type LunarCalendarSource = LunarCalendarMap | LunarCalendarLookup;

export interface StemNode {
  symbol: string;
  yin_yang?: YinYang;
  wu_xing?: WuXing;
  shi_shen?: string;
}

export interface HiddenStemNode extends StemNode {
  yin_yang: YinYang;
  wu_xing: WuXing;
  shi_shen?: string;
}

export interface BranchNode {
  symbol: string;
  yin_yang?: YinYang;
  wu_xing?: WuXing;
  hidden_stems?: HiddenStemNode[];
}

export interface Pillar {
  heavenly_stem: StemNode;
  earthly_branch: BranchNode;
}

export interface BirthInfo {
  gregorian_date: string;
  lunar_date: string;
  birth_time: string;
  zodiac?: string;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface BaziData {
  person: {
    name: string;
    gender: Gender;
    birth_info: BirthInfo;
  };
  geju_analysis?: {
    strength?: string;
    geju?: string;
  };
}

export interface LunarInfo {
  lunar_date: string;
  year_ganzhi: string;
  month_ganzhi: string;
  day_ganzhi: string;
  hour_ganzhi: string;
}

export class BaziValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValueError";
  }
}
