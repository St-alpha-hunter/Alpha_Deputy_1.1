// src/Models/strategySpecV0.ts
// 目标：100% 对齐后端 StrategySpecV0 的 JSON 结构与字段名（JsonPropertyName）

/** ---------- string-literal enums (用于下拉菜单) ---------- */
export type RebalanceFreq = "Weekly" | "Monthly";

export type HolidayPolicy = "next_trading_day" | "prev_trading_day" | "skip";

export type SignalType = "linear_weight";

export type SelectorType = "topk";

export type WeightingType = "equal";

export type PriceType = "next_open" | "close";

export type BenchmarkType = "none" | "symbol";

export type OutputMetric =
  | "equity_curve"
  | "trade_list"
  | "sharpe"
  | "sortino"
  | "max_drawdown";

/** ---------- Spec Interfaces (mirror C# JSON) ---------- */
export interface StrategySpecV0 {
  name: string;
  universe: string;
  dataVersion: string;

  rebalance: RebalanceSpec;
  signal: SignalSpec;
  portfolio: PortfolioSpec;
  timeRange: BacktestTimeRange;
  execute: ExecuteSpec;
  riskManagement: RiskManagementSpec;
  benchMark: BenchmarkSpec;
  // 你 C# 里有 BenchmarkSpec / OutputSpec，但当前 StrategySpecV0 没挂上
  // 如果你后端后续加到 StrategySpecV0，再在这里加：
  // benchmark?: BenchmarkSpec;
  // outputs?: OutputSpec;
}

//调仓策略  --已经完成
export interface RebalanceSpec {
  freq:  "Weekly" | "Monthly";
  /** 1=Mon ... 7=Sun */ //每周几调仓
  dayOfWeek?: number;
  dayOfMonth?: number;
  holidayPolicy: HolidayPolicy;
}

//因子权重
export interface SignalInputSpec {
  codeKey: string;
  factor:string;
  weight: number;
}

//信号生成
export interface SignalSpec {
  type: SignalType;
  inputs: SignalInputSpec[];
  lookback: number;
  lag: number;
}

//参数选择 排序方式，和选几个
export interface SelectorSpec {
  type: SelectorType;
  k: number;
}

//加权类型
export interface WeightingSpec {
  type: WeightingType;
 }


//投资组合参数
export interface PortfolioSpec {
  selector: SelectorSpec;
  weighting: WeightingSpec;

  /** JsonPropertyName("initialCash") */
  initialCash: number;

  //无风险资金比例
  targetCashWeight: number;
}


//回测时间与日历设置
export interface BacktestTimeRange {
  /** ISO string e.g. 2026-01-01T00:00:00.000Z */
  startDate: string;
  endDate: string;
  /** default "XNYS" */
  calendar: string;
}

//执行参数
export interface ExecuteSpec {
  priceType: PriceType;
  commissionBps: number;
  slippageBps: number;
  allowShort: boolean;
}

//风险管理
export interface RiskManagementSpec {
  maxDrawdown: number;
  maxPositionWeight: number;
  maxTurnover: number;
  maxLeverage: number;
  volTarget: number;
}

/** ---------- Optional: Benchmark/Output (你以后挂进 StrategySpecV0 就能直接用) ---------- */
//比较基准
export interface BenchmarkSpec {
  type: BenchmarkType;
  symbol?: string;
}

//产出指标
export interface OutputSpec {
  metrics: OutputMetric[];
}

/** ---------- Dropdown Options (直接给 UI 用) ---------- */
export const RebalanceFreqOptions: Array<{ value: RebalanceFreq; label: string }> =
  [
    { value: "Weekly", label: "Weekly" },
    { value: "Monthly", label: "Monthly" },
  ];

export const HolidayPolicyOptions: Array<{ value: HolidayPolicy; label: string }> =
  [
    { value: "next_trading_day", label: "Next trading day" },
    { value: "prev_trading_day", label: "Prev trading day" },
    { value: "skip", label: "Skip" },
  ];

export const PriceTypeOptions: Array<{ value: PriceType; label: string }> = [
  { value: "next_open", label: "Next Open" },
  { value: "close", label: "Close" },
];

/** 只有一个值也写成 options，方便 UI 统一 */
export const SignalTypeOptions: Array<{ value: SignalType; label: string }> = [
  { value: "linear_weight", label: "Linear Weight" },
];

export const SelectorTypeOptions: Array<{ value: SelectorType; label: string }> =
  [{ value: "topk", label: "Top K" }];

export const WeightingTypeOptions: Array<{ value: WeightingType; label: string }> =
  [{ value: "equal", label: "Equal Weight" }];

/** ---------- Default factory (用于初始化表单 state) ---------- */
export function makeDefaultStrategySpecV0(
  overrides: Partial<StrategySpecV0> = {}
): StrategySpecV0 {
  const nowIso = new Date().toISOString();

  const base: StrategySpecV0 = {
    name: "mq_smoke_test",
    universe: "SP500_20",
    dataVersion: "data_v1",

    rebalance: {
      freq: "Weekly",
      dayOfWeek: 1,
      holidayPolicy: "next_trading_day",
    },

    signal: {
      type: "linear_weight",
      inputs: [
        { codeKey: "mom_5", factor: "5日动量因子", weight: 0.5 },
        { codeKey: "mom_12", factor: "12月动量因子", weight: 0.5 }
      ],
      lookback: 20,
      lag: 1,
    },

    portfolio: {
      selector: { type: "topk", k: 0 },
      weighting: {type: "equal"},
      initialCash: 10000000,
      targetCashWeight: 0,
    },

    timeRange: {
      startDate: nowIso,
      endDate: nowIso,
      calendar: "XNYS",
    },

    execute: {
      priceType: "next_open",
      commissionBps: 0.0001,
      slippageBps: 0.0001,
      allowShort: false,
    },

    riskManagement: {
      maxDrawdown: 0.2,
      maxPositionWeight: 0.1,
      maxTurnover: 0.5,
      maxLeverage: 1.0,
      volTarget: 0.15,
    },

    benchMark: {
      type: "symbol",
      symbol: "SPY",
    },
  };

  // shallow merge + nested merge（够用；你也可换成 lodash merge）
  return {
    ...base,
    ...overrides,
    rebalance: { ...base.rebalance, ...(overrides.rebalance ?? {}) },
    signal: { ...base.signal, ...(overrides.signal ?? {}) },
    portfolio: { ...base.portfolio, ...(overrides.portfolio ?? {}) },
    timeRange: { ...base.timeRange, ...(overrides.timeRange ?? {}) },
    execute: { ...base.execute, ...(overrides.execute ?? {}) },
    riskManagement: { ...base.riskManagement, ...(overrides.riskManagement ?? {}) },
  };
}