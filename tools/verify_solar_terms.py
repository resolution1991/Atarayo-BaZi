#!/usr/bin/env python3
"""Verify generated solar-term ordering, names, coverage, and metadata hash."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "data" / "solar-terms.generated.ts"
METADATA = ROOT / "src" / "data" / "solar-terms.metadata.json"
EXPECTED_NAMES = {
    "春分", "清明", "谷雨", "立夏", "小满", "芒种",
    "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
    "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
    "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--metadata", type=Path, default=METADATA)
    args = parser.parse_args()

    text = args.source.read_text(encoding="utf-8")
    match = re.search(r"= (\[.*\]);\s*$", text, re.S)
    if not match:
        raise RuntimeError("Cannot locate generated solar-term array")
    rows = json.loads(match.group(1))
    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))

    assert len(rows) == metadata["recordCount"]
    assert sha256(args.source) == metadata["outputSha256"]
    assert {row["name"] for row in rows} == EXPECTED_NAMES
    assert all(left["epochMinute"] < right["epochMinute"] for left, right in zip(rows, rows[1:]))
    assert all(row["kind"] in {"jie", "qi"} for row in rows)

    counts = Counter(row["cst"][:4] for row in rows)
    for year in range(1900, 2100):
        assert counts[str(year)] == 24, (year, counts[str(year)])

    print(
        "Solar-term data verified:",
        len(rows),
        "records,",
        rows[0]["cst"],
        "..",
        rows[-1]["cst"],
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
