// [股价走势 2026-10-16] 公司页股价走势的数据模型
// 数据来自后端 GET /api/company/price-history/{symbol}（后端调用 execute/python_runner/price_history.py 读 backtest_data），
// 和回测用的是同一份复权日线

/** 后端返回的原始结构：按列组织，每个数组按日期一一对应 */
export interface PriceHistoryResponse {
  symbol: string;
  adjusted: boolean;
  dates: string[];
  open: (number | null)[];
  high: (number | null)[];
  low: (number | null)[];
  close: (number | null)[];
  volume: (number | null)[];
}

/** 清洗后的一根日线（前端画图、算指标用） */
export interface PriceBar {
  date: string;      // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceHistory {
  symbol: string;
  adjusted: boolean;
  bars: PriceBar[];  // 从旧到新
}

const toNum = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

/**
 * 把后端按列返回的数据转成按行的 bars，并做容错清洗（写法和 getEquityCurve 一样）：
 * - 没有收盘价的那天直接丢掉（画不出来）
 * - 开/高/低缺失时用收盘价顶上，保证 K 线能画；高低价再和开收盘比一下，保证 high >= max(开,收)、low <= min(开,收)
 * - 成交量缺失记为 0
 * - 按日期升序排列
 */
export const parsePriceHistory = (raw: unknown): PriceHistory | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<PriceHistoryResponse>;
  if (!Array.isArray(r.dates) || !Array.isArray(r.close)) return null;

  const bars: PriceBar[] = [];
  r.dates.forEach((d, i) => {
    const close = toNum(r.close?.[i]);
    if (typeof d !== "string" || !d || close === undefined) return;
    const open = toNum(r.open?.[i]) ?? close;
    const high = Math.max(toNum(r.high?.[i]) ?? close, open, close);
    const low = Math.min(toNum(r.low?.[i]) ?? close, open, close);
    bars.push({ date: d.slice(0, 10), open, high, low, close, volume: toNum(r.volume?.[i]) ?? 0 });
  });
  bars.sort((a, b) => a.date.localeCompare(b.date));

  return {
    symbol: typeof r.symbol === "string" ? r.symbol : "",
    adjusted: r.adjusted !== false,
    bars,
  };
};

/** 一段区间的统计：最新收盘价、区间涨跌幅、区间最大回撤（都按收盘价算） */
export interface RangeStats {
  lastClose: number;
  lastDate: string;
  change: number;        // 区间涨跌幅：最后收盘 / 第一天收盘 - 1
  maxDrawdown: number;   // 区间最大回撤（负数或 0）：从区间内最高点回落的最大幅度
}

export const computeRangeStats = (bars: PriceBar[]): RangeStats | null => {
  if (bars.length === 0) return null;
  const first = bars[0].close;
  const last = bars[bars.length - 1];

  let peak = first;
  let maxDrawdown = 0;
  for (const b of bars) {
    peak = Math.max(peak, b.close);
    maxDrawdown = Math.min(maxDrawdown, b.close / peak - 1);
  }

  return {
    lastClose: last.close,
    lastDate: last.date,
    change: first > 0 ? last.close / first - 1 : 0,
    maxDrawdown,
  };
};
