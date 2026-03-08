from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Literal


class RebalanceSpec(BaseModel):
    freq: str
    dayOfWeek: int


class SignalInputSpec(BaseModel):
    factor: str
    weight: float


class SignalSpec(BaseModel):
    type: Literal["linear_weight"]
    inputs: List[SignalInputSpec]


class SelectorSpec(BaseModel):
    type: Literal["topk"]
    k: int


class WeightingSpec(BaseModel):
    type: Literal["equal"]


class PortfolioSpec(BaseModel):
    selector: SelectorSpec
    weighting: WeightingSpec
    cash: float = 0.0


class StrategySpecV0(BaseModel):
    name: str
    universe: str
    dataVersion: str
    rebalance: RebalanceSpec
    signal: SignalSpec
    portfolio: PortfolioSpec
