import json
from pathlib import Path
from typing import Any, Dict


def write_output_json(output_path: str, result: Dict[str, Any]) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8-sig") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)