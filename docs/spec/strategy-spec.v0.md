# StrategySpec v0

## 1. Overview
StrategySpec v0 defines the immutable contract for backtest strategies.

## 2. Supported Features (v0)
- Signal: linear_weight
- Selector: topk
- Rebalance: fixed frequency

## 3. JSON Structure

### Root Fields
| Field | Type | Required | Description |
|------|------|----------|-------------|
| name | string | yes | Strategy name |
| universe | string | yes | Trading universe |
| dataVersion | string | yes | Data snapshot version |
| rebalance | object | yes | Rebalance rule |
| signal | object | yes | Signal definition |
| portfolio | object | yes | Portfolio construction |

（中间可以继续拆字段说明）

## 4. Full Example (Canonical)

```json
{
  "name": "alpha_v0",
  "universe": "CSI300",
  "dataVersion": "v2026_02_01",
  "rebalance": {
    "freq": "W",
    "dayOfWeek": 1
  },
  "signal": {
    "type": "linear_weight",
    "inputs": [
      {"factor": "mom_20", "weight": 0.6},
      {"factor": "vol_20", "weight": -0.4}
    ]
  },
  "portfolio": {
    "selector": {"type": "topk", "k": 50},
    "weighting": {"type": "equal"},
    "cash": 0.0
  }
}
