#!/usr/bin/env python3
"""Generate the bundled minute-level 24 solar-term table with Skyfield."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import skyfield
from skyfield import almanac, almanac_east_asia
from skyfield.api import Loader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "src" / "data" / "solar-terms.generated.ts"
DEFAULT_METADATA = ROOT / "src" / "data" / "solar-terms.metadata.json"
START_UTC = datetime(1899, 11, 30, 16, 0, tzinfo=timezone.utc)
END_UTC = datetime(2100, 3, 31, 16, 0, tzinfo=timezone.utc)
CST = timezone(timedelta(hours=8))
JIE_NAMES = {
    "立春",
    "惊蛰",
    "清明",
    "立夏",
    "芒种",
    "小暑",
    "立秋",
    "白露",
    "寒露",
    "立冬",
    "大雪",
    "小寒",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def rounded_minute(value: datetime) -> datetime:
    value = value.astimezone(timezone.utc)
    if value.second >= 30 or value.microsecond >= 500_000:
        value += timedelta(minutes=1)
    return value.replace(second=0, microsecond=0)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ephemeris", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--metadata", type=Path, default=DEFAULT_METADATA)
    args = parser.parse_args()

    if not args.ephemeris.is_file():
        raise FileNotFoundError(args.ephemeris)

    load = Loader(str(args.ephemeris.parent))
    timescale = load.timescale()
    ephemeris = load(args.ephemeris.name)
    function = almanac_east_asia.solar_terms(ephemeris)
    t0 = timescale.from_datetime(START_UTC)
    t1 = timescale.from_datetime(END_UTC)
    times, indexes = almanac.find_discrete(t0, t1, function)

    rows: list[dict[str, object]] = []
    names = almanac_east_asia.SOLAR_TERMS_ZHS
    for time, index_value in zip(times, indexes, strict=True):
        index = int(index_value)
        utc = rounded_minute(time.utc_datetime())
        cst = utc.astimezone(CST)
        name = names[index]
        rows.append(
            {
                "name": name,
                "longitude": index * 15,
                "utc": utc.strftime("%Y-%m-%dT%H:%M:00Z"),
                "cst": cst.strftime("%Y-%m-%d %H:%M"),
                "epochMinute": int(utc.timestamp() // 60),
                "kind": "jie" if name in JIE_NAMES else "qi",
            }
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
    source = (
        'import type { SolarTermRecord } from "../core/solar-terms.ts";\n\n'
        f"export const SOLAR_TERMS: readonly SolarTermRecord[] = {body};\n"
    )
    args.output.write_text(source, encoding="utf-8")

    metadata = {
        "schemaVersion": 1,
        "dataVersion": "de440s-skyfield-1.53-v1",
        "range": {"first": rows[0]["cst"], "last": rows[-1]["cst"]},
        "recordCount": len(rows),
        "timeZone": "fixed UTC+08:00",
        "rounding": "nearest minute; 30 seconds rounds up",
        "generator": {
            "script": "tools/generate_solar_terms.py",
            "skyfieldVersion": skyfield.__version__,
            "ephemeris": args.ephemeris.name,
            "ephemerisSha256": sha256(args.ephemeris),
        },
        "outputSha256": sha256(args.output),
    }
    args.metadata.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote {args.output}: {len(rows)} records")
    print(f"Wrote {args.metadata}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
