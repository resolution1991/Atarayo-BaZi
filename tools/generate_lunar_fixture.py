#!/usr/bin/env python3
"""Generate a small lunar-calendar fixture for TypeScript baseline tests."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timedelta
from pathlib import Path


WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_CSV = Path("/Users/algernon/Documents/自制排盘软件/knowledge_base/lunar_calendar.csv")
CASES_PATH = WORKSPACE_ROOT / "baseline" / "cases.json"
OUTPUT_PATH = WORKSPACE_ROOT / "src" / "data" / "lunar-calendar.fixture.ts"


def normalize(value: str) -> str:
    if "T" in value and ":" in value:
        date_part, time_part = value.split("T", 1)
        return f"{date_part}-{time_part.replace(':', '-')}"
    return value


def needed_dates() -> set[str]:
    dates: set[str] = set()
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    for case in cases:
        try:
            year, month, day, hour, minute = [int(part) for part in normalize(case["birth_datetime"]).split("-")]
            dt = datetime(year, month, day, hour, minute)
        except Exception:
            continue
        if dt.hour >= 23:
            dt = dt.replace(hour=0, minute=0) + timedelta(days=1)
        dates.add(dt.strftime("%Y-%m-%d"))
    return dates


def main() -> int:
    dates = needed_dates()
    rows = {}
    with SOURCE_CSV.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date = row["公历日期"]
            if date in dates:
                rows[date] = {
                    "lunar_year": int(row["农历年"]),
                    "lunar_month": int(row["农历月"]),
                    "lunar_day": int(row["农历日"]),
                    "ganzhi_year": row["年天干地支"],
                    "ganzhi_month": row["月天干地支"],
                    "ganzhi_day": row["日天干地支"],
                }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(dict(sorted(rows.items())), ensure_ascii=False, indent=2)
    OUTPUT_PATH.write_text(
        "import type { LunarCalendarMap } from \"../core/types.ts\";\n\n"
        f"export const LUNAR_CALENDAR_FIXTURE: LunarCalendarMap = {body};\n",
        encoding="utf-8",
    )
    missing = sorted(dates - set(rows))
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Fixture dates: {len(rows)}")
    if missing:
      print(f"Missing dates intentionally left unavailable: {', '.join(missing)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

