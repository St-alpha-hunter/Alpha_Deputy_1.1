import json
from pathlib import Path
from typing import Any, Dict


def read_input_json(input_path: str) -> Dict[str, Any]:
    path = Path(input_path)

    if not path.exists():
        raise FileNotFoundError(f"input json not found: {input_path}")

    with path.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        raise ValueError("input json root must be an object")

    return data