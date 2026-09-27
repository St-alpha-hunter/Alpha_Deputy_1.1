// 回测结果（execute/python_runner/runner.py 写出的 output.json）解析后的结构
// 后端把 output.json 原样存进 resultJson，前端 JSON.parse 后就是这里的 BacktestResult

export interface BacktestResult {
  message: string
  success: boolean
  tradeList: any[]
  metrics: Metrics
  rawSpec: RawSpec
  /** 每个交易日一条，见 strategy.py 的 _record_portfolio_value；旧报告里可能没有 */
  equityCurve?: EquityCurve[]
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
