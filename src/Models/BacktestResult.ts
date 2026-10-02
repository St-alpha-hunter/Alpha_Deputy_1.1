// 回测结果（execute/python_runner/runner.py 写出的 output.json）解析后的结构
// 后端把 output.json 原样存进 resultJson，前端 JSON.parse 后就是这里的 BacktestResult

export interface BacktestResult {
  message: string
  success: boolean
  /** 每一笔成交，见 strategy.py 的 notify_order；旧报告里是空数组 */
  tradeList: TradeRecord[]
  metrics: Metrics
  rawSpec: RawSpec
  /** 每个交易日一条，见 strategy.py 的 _record_portfolio_value；旧报告里可能没有 */
  equityCurve?: EquityCurve[]
  /** [换手率限制 2026-09-30] 每次调仓一条，见 strategy.py 的 _plan_rebalance_with_turnover_limit；旧报告里没有 */
  turnoverList?: TurnoverRecord[]
}

/** [换手率限制 2026-09-30] 一次调仓的换手情况 */
export interface TurnoverRecord {
  /** 调仓日期 YYYY-MM-DD */
  date: string;
  /** 预估单边换手率（按调仓当天收盘价算，0.1 = 10%）；用现金填空位、止损不计入 */
  turnover: number;
  /** 这次换掉了几只（卖一只旧的 + 买一只新的 算一次） */
  swaps: number;
  /** 用现金填空位买入了几只（第一次建仓、止损后补位） */
  fills: number;
  /** 是否被 maxTurnover 额度挡住了一部分调仓 */
  limited: boolean;
}

export interface Metrics {
  "sharpe 夏普比率": Sharpe
  "returns 累计收益率": Returns
  "maxDrawdown 最大回撤": MaxDrawdown
}

export interface Sharpe {
  // 回测区间太短或收益方差为 0 时 backtrader 返回 null
  sharperatio: number | null
}

export interface Returns {
  ravg: number
  rtot: number
  rnorm: number
  rnorm100: number
}

export interface MaxDrawdown {
  len: number
  drawdown: number
  moneydown: number
  max: {
    len: number
    drawdown: number
    moneydown: number
  }
}

/** 净值曲线上的一个点 */
export interface EquityCurve {
  /** ISO 日期 YYYY-MM-DD */
  date: string;
  /** 组合总资产 broker.getvalue() */
  value: number;
  /** 净值 = value / initialCash，起点为 1 */
  netValue: number;
}

/** 一笔成交（买、卖各算一笔） */
export interface TradeRecord {
  /** 成交日期 YYYY-MM-DD */
  date: string;
  symbol: string;
  side: "buy" | "sell";
  /** 成交股数，始终为正，方向看 side */
  size: number;
  price: number;
  /** 成交金额 = size * price */
  value: number;
  commission: number;
}

export interface RawSpec {
  name: string
  universe: string
  dataVersion: string
  signal: Signal
  execute: Execute
  portfolio: Portfolio
  rebalance: Rebalance
  timeRange: TimeRange
  riskManagement: RiskManagement
}

export interface Signal {
  lag: number
  type: number
  lookback: number
  inputs: SignalInput[]
}

export interface SignalInput {
  factor: string
  weight: number
  codeKey: string
}

export interface Execute {
  priceType: number
  allowShort: boolean
  slippageBps: number
  commissionBps: number
}

export interface Portfolio {
  selector: {
    k: number
    type: number
  }
  weighting: {
    type: number
  }
  initialCash: number
  targetCashWeight: number
}

export interface Rebalance {
  freq: number
  dayOfWeek: number | null
  dayOfMonth: number
  holidayPolicy: number
}

export interface TimeRange {
  startDate: string
  endDate: string
  calendar: string
}

export interface RiskManagement {
  volTarget: number
  maxDrawdown: number
  maxLeverage: number
  maxTurnover: number
  maxPositionWeight: number
}


// ---------- equityCurve 容错解析 ----------
const toNum = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};

/**
 * 从回测结果里取出净值曲线，并做一遍清洗，保证图表拿到的都是合法点：
 * - 兼容 equityCurve / equity_curve / EquityCurve 三种字段名
 * - 丢掉日期或数值不合法的点，按日期升序排列
 * - 缺 netValue 时用 value / 第一个点的 value 补算
 */
export const getEquityCurve = (result: unknown): EquityCurve[] => {
  if (!result || typeof result !== "object") return [];
  const r = result as Record<string, unknown>;
  const raw = r.equityCurve ?? r.equity_curve ?? r.EquityCurve;
  if (!Array.isArray(raw)) return [];

  const points = raw
    .map((p) => {
      if (!p || typeof p !== "object") return null;
      const o = p as Record<string, unknown>;
      const date = typeof o.date === "string" ? o.date.slice(0, 10) : "";
      const value = toNum(o.value);
      const netValue = toNum(o.netValue ?? o.net_value);
      if (!date || (value === undefined && netValue === undefined)) return null;
      return { date, value, netValue };
    })
    .filter((p): p is { date: string; value: number | undefined; netValue: number | undefined } => p !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const base = points.find((p) => p.value !== undefined && p.value !== 0)?.value;

  return points
    .map((p) => ({
      date: p.date,
      value: p.value ?? NaN,
      netValue: p.netValue ?? (p.value !== undefined && base ? p.value / base : NaN),
    }))
    .filter((p) => Number.isFinite(p.netValue));
};

/**
 * 从回测结果里取出成交明细并清洗：丢掉缺日期/代码/方向或数值不合法的记录，按日期升序排列
 */
export const getTradeList = (result: unknown): TradeRecord[] => {
  if (!result || typeof result !== "object") return [];
  const r = result as Record<string, unknown>;
  const raw = r.tradeList ?? r.trade_list ?? r.TradeList;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((t): TradeRecord | null => {
      if (!t || typeof t !== "object") return null;
      const o = t as Record<string, unknown>;
      const date = typeof o.date === "string" ? o.date.slice(0, 10) : "";
      const symbol = typeof o.symbol === "string" ? o.symbol : "";
      const side = o.side === "buy" || o.side === "sell" ? o.side : undefined;
      const size = toNum(o.size);
      const price = toNum(o.price);
      if (!date || !symbol || !side || size === undefined || price === undefined) return null;
      return {
        date,
        symbol,
        side,
        size: Math.abs(size),
        price,
        value: toNum(o.value) ?? Math.abs(size) * price,
        commission: toNum(o.commission) ?? 0,
      };
    })
    .filter((t): t is TradeRecord => t !== null)
    // 同一天内保持原顺序（先卖后买），只按日期排
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * [换手率限制 2026-09-30] 取出每次调仓的换手记录，丢掉日期或换手率不合法的
 */
export const getTurnoverList = (result: unknown): TurnoverRecord[] => {
  if (!result || typeof result !== "object") return [];
  const r = result as Record<string, unknown>;
  const raw = r.turnoverList ?? r.turnover_list;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((x): TurnoverRecord | null => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const date = typeof o.date === "string" ? o.date.slice(0, 10) : "";
      const turnover = toNum(o.turnover);
      if (!date || turnover === undefined) return null;
      return {
        date,
        turnover,
        swaps: toNum(o.swaps) ?? 0,
        fills: toNum(o.fills) ?? 0,
        limited: o.limited === true,
      };
    })
    .filter((x): x is TurnoverRecord => x !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
};
