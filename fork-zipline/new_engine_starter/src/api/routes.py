from __future__ import annotations

from typing import Any, List
from fastapi import APIRouter
from pathlib import Path as FilePath
from pydantic import BaseModel, Field

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from typing import Dict, List, Optional
import json, uuid, redis

from services.draw import render_strategy_selector, render_strategy_executor, render_factor_executor
from fastapi.responses import PlainTextResponse

from services.compute import compute_many


##Compute Factors
import pandas as pd
#from factor.service import compute_factor

# ===== 尝试使用 Redis（可选） =====
USE_REDIS = False
try:
    import redis  # pip install redis
    r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    r.ping()
    USE_REDIS = True
except Exception:
    r = None  # 用内存兜底
    USE_REDIS = False

STATE: Dict[str, dict] = {}

router = APIRouter()
BASE_DIR = FilePath(__file__).resolve().parent.parent
TEMPLATE_DIR = BASE_DIR / "templates"

print("Template directory is:", TEMPLATE_DIR)  # 调试时看一下

templates = Jinja2Templates(directory=str(TEMPLATE_DIR))
# --- 工具函数 ---
def _new_session() -> str:
    return str(uuid.uuid4())

def _set(key: str, value: dict, ttl: int = 3600):
    data = json.dumps(value)
    if USE_REDIS:
        r.setex(key, ttl, data)
    else:
        STATE[key] = value

def _get(key: str) -> Optional[dict]:
    if USE_REDIS:
        raw = r.get(key)
        return json.loads(raw) if raw else None
    return STATE.get(key)

# ========= 数据模型 =========

##因子的Json
class FactorSelectionModel(BaseModel):
    name: str
    code_key:str
    weight: float
    code: str

##因子的选择
class FactorSelection(BaseModel):
    selectedFactors: List[FactorSelectionModel]


##选股的Json
class StockSelection(BaseModel):
    numberOfStocks: int
    selectedIndustries: List[str]
    maxIndustryExposure: float


##投资组合约束的Json
class PortfolioConstraint(BaseModel):
    rebalanceFreq: str
    maxPositionPerChase: int
    riskFreeRatio: float
    positionLimit: int
    commission: float
    slip: float


# class ComputeReq(BaseModel):
#     factor_keys: List[str]
#     data: List[Dict[str, Any]]
# class ComputeResp(BaseModel):
#     values: Dict[str, list]



class ComputeReq(BaseModel):
    factor_keys: List[str]
    tickers: List[str]
    start: str        # "2024-01-01"
    end: str          # "2024-12-31"
    # 可选：频率/数据源等，将来扩展
    # frequency: Optional[str] = "D"

    
class ComputeResp(BaseModel):
    # {factor_key: {ticker: [[date, value], ...]}}
    values: Dict[str, Dict[str, List[List[Any]]]]



###健康检查
@router.get("/ping")
def ping():
    return {"msg": "pong"}


# ========= 1) 因子 JSON =========
@router.post("/factor_selection")
def post_factors(data: FactorSelection, session_id: Optional[str] = None):
    session_id = session_id or _new_session()
    key = f"{session_id}:factors"
    payload = data.dict()
    _set(key, payload)
    # 渲染模板,获取因子
    factor_selection = _get(f"{session_id}:factors") or {}
    rendered = templates.get_template("factor_selector.jinja").render(
        factors=factor_selection.get("selectedFactors", [])
    )
    (BASE_DIR / "strategy_pre").mkdir(exist_ok=True)
    strategy_path = BASE_DIR / "strategy_pre" / f"strategy_{session_id}.py"
    with open(strategy_path, "w", encoding="utf-8") as f:
        f.write(rendered)
    return PlainTextResponse(rendered)


# @router.get("/factor_selection/{session_id}")
# def get_factors(session_id: str):
#     data = _get(f"{session_id}:factors")
#     if not data:
#         raise HTTPException(404, "factors not found")
#     return {"session_id": session_id, "factors": data}



# ========= 2) 选股 JSON =========
@router.post("/stock_selection")
def post_stock(data: StockSelection, session_id: Optional[str] = None):
    session_id = session_id or _new_session()
    key = f"{session_id}:stock"
    payload = data.dict()
    _set(key, payload)
    # 获取选股逻辑
    factor_selection = _get(f"{session_id}:factors") or {}
    factors = factor_selection.get("selectedFactors", [])
    # 渲染 strategy_selector.jinja 模板
    rendered = templates.get_template("strategy_selector.jinja").render(
    factors=factors,
    stock_selection=payload,
    )
    (BASE_DIR / "strategy_pre").mkdir(exist_ok=True)
    strategy_path = BASE_DIR / "strategy_pre" / f"strategy_{session_id}.py"
    try:
        with open(strategy_path, "w", encoding="utf-8") as f:
            f.write(rendered)
    except Exception as e:
        return {"error": str(e)}
    return PlainTextResponse(rendered)

# @router.get("/stock_selection/{session_id}")
# def get_stock(session_id: str):
#     data = _get(f"{session_id}:stock")
#     if not data:
#         raise HTTPException(404, "stock_selection not found")
#     return {"session_id": session_id, "stock_selection": data}



# ========= 3) 投资组合约束 JSON ========
@router.post("/portfolio_constraint")
def post_constraint(data: PortfolioConstraint, session_id: Optional[str] = None):
    session_id = session_id or _new_session()
    key = f"{session_id}:constraint"
    payload = data.dict()
    _set(key, payload)
        # 渲染 strategy_executor.jinja 模板
    rendered = templates.get_template("strategy_executor.jinja").render(
        constraint=payload,
    )
    (BASE_DIR / "strategy_pre").mkdir(exist_ok=True)
    strategy_path = BASE_DIR / "strategy_pre" / f"strategy_{session_id}.py"
    try:
        with open(strategy_path, "w", encoding="utf-8") as f:
            f.write(rendered)
    except Exception as e:
        return {"error": str(e)}
    return PlainTextResponse(rendered)

# @router.get("/portfolio_constraint/{session_id}")
# def get_constraint(session_id: str):
#     data = _get(f"{session_id}:constraint")
#     if not data:
#         raise HTTPException(404, "portfolio_constraint not found")
#     return {"session_id": session_id, "portfolio_constraint": data}


class ComputeReq(BaseModel):
    factor_keys: List[str]
    tickers: List[str]
    start: str        # "2024-01-01"
    end: str          # "2024-12-31"
    # 可选：频率/数据源等，将来扩展
    # frequency: Optional[str] = "D"

    
class ComputeResp(BaseModel):
    # {factor_key: {ticker: [[date, value], ...]}}
    values: Dict[str, Dict[str, List[List[Any]]]]

@router.post("/factors/compute", response_model=ComputeResp)
def compute_factors(req: ComputeReq):
    # 1. 加载面板数据（假设你已读入 DataFrame panel）
    # 这里举例：你可以根据 req.tickers, req.start, req.end 过滤 panel
    panel = pd.read_parquet(BASE_DIR/"ultimate_data"/"merged_data.parquet")
    panel = panel[
        (panel["symbol"].isin(req.tickers)) &
        (panel["date"] >= req.start) &
        (panel["date"] <= req.end)
    ]
    # 2. 计算
    results = compute_many(panel, factor_keys=req.factor_keys)
    # 3. 整理为 JSON 格式
    out = {}
    for key, symbol_dict in results.items():
        out[key] = {}
        for symbol, series in symbol_dict.items():
            # series: pd.Series, index=date, value=factor
            out[key][symbol] = [[str(idx), val if pd.notna(val) else None] for idx, val in series.items()]
    return {"values": out}


# class ComputeSelect(BaseModel):
#     selected_factors: List[Dict[str, Any]]  # [{"name": "factor1", "weight": 0.5}, ...]
#     number_of_stocks: int
class StockSelectionReq(BaseModel):
    session_id:str
    start:str
    end:str

from strategy.stock_selector import select_stocks
@router.post("/compute_factors_select_stocks")
def select_stocks(req: StockSelectionReq):
    # 读取股票池子
    with open(BASE_DIR / "symbols_from_asset.txt", "r", encoding="utf-8") as f:
         symbols = [line.strip() for line in f if line.strip()]
    # 加载面板数据
    panel = pd.read_parquet(BASE_DIR / "ultimate_data" / "merged_data.parquet")
    panel = panel[
        (panel["symbol"].isin(symbols)) &
        (panel["date"] >= req.start) &
        (panel["date"] <= req.end)
    ]
    # 调用选股逻辑
    selected_stocks = select_stocks(panel, req.session_id)
    return {"selected_stocks": selected_stocks}

# class Backtest(BaseModel):
#     session_id: str
#     start_date: str = Field(..., description="回测开始日期，格式 YYYY-MM-DD")
#     end_date: str = Field(..., description="回测结束日期，格式 YYYY-MM-DD")
#     initial_capital: float = Field(1000000.0, description="初始资金，默认 100 万")
#     commission: float = Field(0.001, description="交易佣金率，默认 0.1%")
#     slip: float = Field(0.001, description="滑点率，默认 0.1%")

# @router.post("/backtest")


# FastAPI 的路由接口通常写在 routes.py 里，然后在 main.py 里注册到 FastAPI 应用。
# 具体做法是：

# 在 routes.py 里定义 API 路由和接口逻辑。
# 在 main.py 里用 app.include_router(router) 注册