export type SolarTermKind = "jie" | "qi";

export interface SolarTermRecord {
  name: string;
  longitude: number;
  utc: string;
  cst: string;
  epochMinute: number;
  kind: SolarTermKind;
}

export interface SolarTermWindow {
  previous: SolarTermRecord;
  next: SolarTermRecord;
}

export interface SolarTermLookup {
  all: readonly SolarTermRecord[];
  findWindow(epochMinute: number, kind?: SolarTermKind): SolarTermWindow;
  findByNameAndYear(name: string, year: number): SolarTermRecord | undefined;
}

export function createSolarTermLookup(records: readonly SolarTermRecord[]): SolarTermLookup {
  return {
    all: records,
    findWindow(epochMinute, kind) {
      const candidates = kind ? records.filter((item) => item.kind === kind) : records;
      const insertion = upperBound(candidates, epochMinute);
      const previous = candidates[insertion - 1];
      const next = candidates[insertion];
      if (!previous || !next) {
        throw new Error(`节气数据超出范围: ${epochMinute}`);
      }
      return { previous, next };
    },
    findByNameAndYear(name, year) {
      const prefix = `${year}-`;
      return records.find((item) => item.name === name && item.cst.startsWith(prefix));
    },
  };
}

export function cstDateTimeToEpochMinute(value: string): number {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`无效北京时间: ${value}`);
  }
  const [, year, month, day, hour, minute] = match.map(Number);
  return Math.floor(Date.UTC(year, month - 1, day, hour - 8, minute) / 60000);
}

export function epochMinuteToCst(epochMinute: number): string {
  const date = new Date((epochMinute + 480) * 60000);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-") + ` ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function upperBound(records: readonly SolarTermRecord[], epochMinute: number): number {
  let low = 0;
  let high = records.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (records[middle].epochMinute <= epochMinute) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
}
