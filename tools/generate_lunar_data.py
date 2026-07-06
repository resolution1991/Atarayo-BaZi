#!/usr/bin/env python3
"""Convert the legacy lunar CSV into a compact TypeScript offline data module."""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_CSV = Path("/Users/algernon/Documents/自制排盘软件/knowledge_base/lunar_calendar.csv")
DEFAULT_OUTPUT = WORKSPACE_ROOT / "src" / "data" / "lunar-calendar.generated.ts"
FIRST_DATE = "1900-01-01"
LAST_DATE = "2100-02-08"


def parse_date(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%d")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate full offline lunar calendar TypeScript data.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE_CSV)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--first-date", default=FIRST_DATE)
    parser.add_argument("--last-date", default=LAST_DATE)
    args = parser.parse_args()

    first_date = parse_date(args.first_date)
    last_date = parse_date(args.last_date)
    by_year: dict[str, list[list[Any]]] = defaultdict(list)
    seen_dates: set[str] = set()

    with args.source.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date = parse_date(row["公历日期"])
            if not (first_date <= date <= last_date):
                continue
            year_key = f"{date.year:04d}"
            by_year[year_key].append(
                [
                    int(row["农历年"]),
                    int(row["农历月"]),
                    int(row["农历日"]),
                    row["年天干地支"],
                    row["月天干地支"],
                    row["日天干地支"],
                ]
            )
            seen_dates.add(row["公历日期"])

    missing = []
    current = first_date
    while current <= last_date:
        date_key = current.strftime("%Y-%m-%d")
        if date_key not in seen_dates:
            missing.append(date_key)
        current += timedelta(days=1)

    if missing:
        raise RuntimeError(f"CSV data is not contiguous; missing {len(missing)} dates, first={missing[0]}")

    years = dict(sorted(by_year.items()))
    total_days = sum(len(rows) for rows in years.values())

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_ts(years, args.first_date, args.last_date, total_days), encoding="utf-8")

    print(f"Wrote {args.output}")
    print(f"Years: {len(years)}, days: {total_days}, range: {args.first_date}..{args.last_date}")
    return 0


def render_ts(years: dict[str, list[list[Any]]], first_date: str, last_date: str, total_days: int) -> str:
    body = json.dumps(years, ensure_ascii=False, separators=(",", ":"))
    return (
        "import type { CompactLunarCalendarByYear, LunarCalendarEntry } from \"../core/types.ts\";\n"
        "import { dayOfYear } from \"../core/calendar.ts\";\n\n"
        "export const LUNAR_CALENDAR_RANGE = {\n"
        f"  first: \"{first_date}\",\n"
        f"  last: \"{last_date}\",\n"
        f"  totalDays: {total_days},\n"
        f"  totalYears: {len(years)},\n"
        "} as const;\n\n"
        f"const LUNAR_CALENDAR_BY_YEAR: CompactLunarCalendarByYear = {body};\n\n"
        "export function getLunarCalendarEntry(dateKey: string): LunarCalendarEntry | undefined {\n"
        "  const year = dateKey.slice(0, 4);\n"
        "  const month = Number(dateKey.slice(5, 7));\n"
        "  const day = Number(dateKey.slice(8, 10));\n"
        "  const rows = LUNAR_CALENDAR_BY_YEAR[year];\n"
        "  if (!rows || !Number.isInteger(month) || !Number.isInteger(day)) {\n"
        "    return undefined;\n"
        "  }\n"
        "  const row = rows[dayOfYear(Number(year), month, day) - 1];\n"
        "  if (!row) {\n"
        "    return undefined;\n"
        "  }\n"
        "  return {\n"
        "    lunar_year: row[0],\n"
        "    lunar_month: row[1],\n"
        "    lunar_day: row[2],\n"
        "    ganzhi_year: row[3],\n"
        "    ganzhi_month: row[4],\n"
        "    ganzhi_day: row[5],\n"
        "  };\n"
        "}\n\n"
        "export const LUNAR_CALENDAR = {\n"
        "  get: getLunarCalendarEntry,\n"
        "};\n"
    )


if __name__ == "__main__":
    raise SystemExit(main())

