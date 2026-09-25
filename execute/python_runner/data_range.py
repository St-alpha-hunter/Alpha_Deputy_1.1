#!/usr/bin/env python3
"""Read the usable date range from the parquet files used by BackTrader."""

import argparse
import calendar
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import pyarrow.parquet as parquet


DEFAULT_BACKTEST_DIR = (
    Path(__file__).resolve().parents[2] / "pipeline" / "data" / "backtest_data"
)


def _date_column(file: Path) -> str:
    names = parquet.ParquetFile(file).schema.names
    lower_names = {name.lower(): name for name in names}
    for candidate in ("date", "datetime"):
        if candidate in lower_names:
            return lower_names[candidate]
    raise ValueError(f"{file.name} 缺少 date/datetime 列")


def _last_complete_month_end(raw_max: date) -> date:
    """Return the last calendar day of the latest complete month in the data.

    Daily market data often ends on a recent day in the current month. That
    partial month should not become the default backtest endpoint. A maximum
    date within the final three calendar days is treated as a complete month
    so that month ends falling on a weekend remain usable.
    """

    month_end_day = calendar.monthrange(raw_max.year, raw_max.month)[1]
    month_end = raw_max.replace(day=month_end_day)
    if raw_max >= month_end - timedelta(days=3):
        return month_end

    previous_month_end = raw_max.replace(day=1) - timedelta(days=1)
    return previous_month_end


def read_data_range(data_dir: Path) -> dict[str, object]:
    files = sorted(data_dir.glob("*.parquet"))
    if not files:
        raise ValueError(f"No backtest parquet data found in {data_dir}.")

    min_date: date | None = None
    raw_max_date: date | None = None
    valid_file_count = 0

    for file in files:
        column = _date_column(file)
        values = pd.read_parquet(file, columns=[column])[column]
        dates = pd.to_datetime(values, errors="coerce", utc=True).dropna()
        if dates.empty:
            continue

        file_min = dates.min().date()
        file_max = dates.max().date()
        min_date = file_min if min_date is None else min(min_date, file_min)
        raw_max_date = file_max if raw_max_date is None else max(raw_max_date, file_max)
        valid_file_count += 1

    if min_date is None or raw_max_date is None:
        raise ValueError(f"No valid dates found in {data_dir}.")

    max_date = _last_complete_month_end(raw_max_date)
    if max_date < min_date:
        raise ValueError(
            f"The latest complete month ({max_date}) is earlier than the earliest data ({min_date})."
        )

    return {
        "minDate": min_date.isoformat(),
        "maxDate": max_date.isoformat(),
        "rawMaxDate": raw_max_date.isoformat(),
        "fileCount": valid_file_count,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data-dir",
        default=os.getenv("BACKTEST_DATA_DIR", str(DEFAULT_BACKTEST_DIR)),
    )
    args = parser.parse_args()

    try:
        result = read_data_range(Path(args.data_dir))
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
