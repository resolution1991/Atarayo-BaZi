#!/usr/bin/env python3
"""Generate baseline outputs from the legacy Python implementation.

This script reads the original project as a reference implementation and writes
stable JSON fixtures in this workspace. It does not modify the original project.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
import tempfile
from pathlib import Path
from typing import Any


WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_ROOT = Path("/Users/algernon/Documents/自制排盘软件")
DEFAULT_CASES_PATH = WORKSPACE_ROOT / "baseline" / "cases.json"
DEFAULT_OUTPUT_PATH = WORKSPACE_ROOT / "baseline" / "results" / "current_python_baseline.json"


def load_module(module_name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load module {module_name} from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalize_birth_datetime(value: str) -> str:
    """Match server.py normalization for datetime-local frontend values."""
    if "T" in value and ":" in value:
        date_part, time_part = value.split("T", 1)
        return f"{date_part}-{time_part.replace(':', '-')}"
    return value


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_initial_person_data(case: dict[str, Any], bazi_core: Any, lunar_data: dict[str, Any]) -> dict[str, Any]:
    normalized_datetime = normalize_birth_datetime(case["birth_datetime"])
    dt = bazi_core.parse_datetime(normalized_datetime)
    lunar_info = bazi_core.get_lunar_info(dt, lunar_data)

    birth_info: dict[str, Any] = {
        "gregorian_date": f"{dt.year}-{dt.month:02d}-{dt.day:02d}",
        "lunar_date": lunar_info["lunar_date"],
        "birth_time": f"{dt.hour:02d}:{dt.minute:02d}",
    }

    for pillar, key in [
        ("year", "year_ganzhi"),
        ("month", "month_ganzhi"),
        ("day", "day_ganzhi"),
        ("hour", "hour_ganzhi"),
    ]:
        ganzhi = lunar_info[key]
        birth_info[pillar] = {
            "heavenly_stem": {"symbol": ganzhi[0]},
            "earthly_branch": {"symbol": ganzhi[1]},
        }

    return {
        "person": {
            "name": case["name"],
            "gender": case["gender"],
            "birth_info": birth_info,
        }
    }


def summarize_bazi(data: dict[str, Any]) -> dict[str, Any]:
    birth_info = data["person"]["birth_info"]
    pillars = {}
    for pillar in ["year", "month", "day", "hour"]:
        pillars[pillar] = (
            birth_info[pillar]["heavenly_stem"]["symbol"]
            + birth_info[pillar]["earthly_branch"]["symbol"]
        )

    return {
        "pillars": pillars,
        "strength": data.get("geju_analysis", {}).get("strength"),
        "geju": data.get("geju_analysis", {}).get("geju"),
    }


def calculate_case(case: dict[str, Any], modules: dict[str, Any], lunar_data: dict[str, Any]) -> dict[str, Any]:
    bazi_core = modules["stp1_bazi_core"]
    enhancer = modules["stp2_bazi_enhancer"]
    shi_shen = modules["stp3_shi_shen_analyzer"]
    qiangruo = modules["stp4_bazi_qiangruo"]
    geju = modules["stp5_bazi_geju"]

    result: dict[str, Any] = {
        "case_id": case["id"],
        "input": {
            "name": case["name"],
            "gender": case["gender"],
            "birth_datetime": case["birth_datetime"],
            "normalized_birth_datetime": normalize_birth_datetime(case["birth_datetime"]),
        },
        "purpose": case.get("purpose", ""),
        "expect_error": bool(case.get("expect_error", False)),
    }

    try:
        initial_data = build_initial_person_data(case, bazi_core, lunar_data)
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            first_path = temp_root / "1st.json"
            second_path = temp_root / "2nd.json"
            third_path = temp_root / "3rd.json"

            first_path.write_text(json.dumps(initial_data, ensure_ascii=False, indent=2), encoding="utf-8")
            enhancer.enhance_bazi_data(str(first_path), output_path=str(second_path))
            shi_shen.analyze_shi_shen(str(second_path), output_path=str(third_path))

            bazi_data = json.loads(third_path.read_text(encoding="utf-8"))

        strength = qiangruo.analyze_strength(bazi_data)
        bazi_data.setdefault("geju_analysis", {})["strength"] = strength
        bazi_data["geju_analysis"]["geju"] = geju.analyze_geju(bazi_data)

        result["success"] = True
        result["summary"] = summarize_bazi(bazi_data)
        result["bazi"] = bazi_data
    except Exception as exc:  # Keep legacy error behavior visible as baseline.
        result["success"] = False
        result["error_type"] = type(exc).__name__
        result["error"] = str(exc)

    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate legacy Python baseline results.")
    parser.add_argument("--source-root", type=Path, default=DEFAULT_SOURCE_ROOT)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES_PATH)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH)
    args = parser.parse_args()

    source_root = args.source_root.resolve()
    cases_path = args.cases.resolve()
    output_path = args.output.resolve()

    if not source_root.exists():
        print(f"Source root not found: {source_root}", file=sys.stderr)
        return 1

    module_names = [
        "stp1_bazi_core",
        "stp2_bazi_enhancer",
        "stp3_shi_shen_analyzer",
        "stp4_bazi_qiangruo",
        "stp5_bazi_geju",
    ]
    modules = {
        name: load_module(name, source_root / f"{name}.py")
        for name in module_names
    }

    lunar_path = source_root / "knowledge_base" / "lunar_calendar.csv"
    geju_character_path = source_root / "knowledge_base" / "geju_character.json"
    lunar_data = modules["stp1_bazi_core"].load_lunar_calendar(str(lunar_path))

    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    results = [calculate_case(case, modules, lunar_data) for case in cases]

    payload = {
        "metadata": {
            "source_root": str(source_root),
            "source_fingerprints": {
                **{
                    f"{name}.py": sha256_file(source_root / f"{name}.py")
                    for name in module_names
                },
                "knowledge_base/lunar_calendar.csv": sha256_file(lunar_path),
                "knowledge_base/geju_character.json": sha256_file(geju_character_path),
            },
        },
        "cases": results,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    success_count = sum(1 for item in results if item["success"])
    error_count = len(results) - success_count
    unexpected = [
        item["case_id"]
        for item in results
        if bool(item.get("expect_error")) == bool(item["success"])
    ]
    print(f"Wrote {output_path}")
    print(f"Cases: {len(results)}, success: {success_count}, errors: {error_count}")
    if unexpected:
        print(f"Unexpected expectation mismatches: {', '.join(unexpected)}")
        return 2
    print("All case outcomes match expectation flags.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
