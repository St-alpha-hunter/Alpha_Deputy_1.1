// [股价走势 2026-10-16] 公司页的股价走势图：折线 / K 线切换、成交量、区间按钮、拖动缩放、区间指标
// 数据：GET /api/company/price-history/{symbol}（本地 backtest_data 的复权日线，和回测是同一份）
import { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import { getPriceHistory } from "../../api";
import { computeRangeStats, parsePriceHistory, type PriceBar, type PriceHistory } from "../../Models/PriceHistory";
import { Card } from "../BacktestReportView/BacktestReportView";

type Mode = "line" | "kline";
type RangeKey = "1M" | "3M" | "1Y" | "ALL";
const RANGES: RangeKey[] = ["1M", "3M", "1Y", "ALL"];
const RANGE_DAYS: Record<RangeKey, number | null> = { "1M": 31, "3M": 92, "1Y": 366, ALL: null };

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; history: PriceHistory }
  | { kind: "notFound" }
  | { kind: "error" };

const CHART_STYLE = { width: "100%", height: "440px" };   // 放在组件外：每次渲染都是同一个对象，避免图表无谓重绘

/** 区间按钮对应的起始下标：从最后一天往前推 N 个自然日 */
const rangeStartIndex = (bars: PriceBar[], range: RangeKey): number => {
  const days = RANGE_DAYS[range];
  if (!days || bars.length === 0) return 0;
  const last = new Date(`${bars[bars.length - 1].date}T00:00:00Z`);
  const cutoff = new Date(last.getTime() - days * 86_400_000).toISOString().slice(0, 10);
  const idx = bars.findIndex((b) => b.date >= cutoff);
  return idx < 0 ? 0 : idx;
};

const fmtPrice = (v: number) => v.toFixed(2);
const fmtPct = (v: number) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`;
const fmtVolume = (v: number) => new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(v);

const StockPriceChart = ({ symbol }: { symbol: string }) => {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [mode, setMode] = useState<Mode>("line");
  const [range, setRange] = useState<RangeKey>("1Y");
  // 当前看到的区间 [起始下标, 结束下标]：区间按钮和底部拖动缩放都会改它，顶部指标按它来算
  const [view, setView] = useState<[number, number]>([0, 0]);
  const chartRef = useRef<ReactECharts>(null);

  // 涨跌配色跟随语言习惯：中文“红涨绿跌”，英文“绿涨红跌”
  const isZh = i18n.language?.startsWith("zh");
  const upColor = isZh ? "#dc2626" : "#16a34a";
  const downColor = isZh ? "#16a34a" : "#dc2626";

  // 换股票时重新加载（symbol 变了就重新请求；cancelled 防止旧请求晚回来覆盖新数据）
  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    getPriceHistory(symbol).then((res) => {
      if (cancelled) return;
      if (res.status === "notFound") return setState({ kind: "notFound" });
      if (res.status === "error") return setState({ kind: "error" });
      const history = parsePriceHistory(res.data);
      setState(history && history.bars.length > 0 ? { kind: "ok", history } : { kind: "notFound" });
    });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const bars = state.kind === "ok" ? state.history.bars : [];

  // 数据加载完、切换区间或切换图表类型时，可见区间回到所选区间（切换类型会整体重绘，缩放位置也会复位）
  useEffect(() => {
    if (bars.length > 0) setView([rangeStartIndex(bars, range), bars.length - 1]);
  }, [bars, range, mode]);

  const stats = useMemo(() => computeRangeStats(bars.slice(view[0], view[1] + 1)), [bars, view]);

  // echarts 配置。注意依赖里没有 view：拖动缩放时只更新顶部指标，不重新生成配置，否则缩放位置会被重置
  const option = useMemo(() => {
    if (bars.length === 0) return null;
    const dates = bars.map((b) => b.date);
    const start = rangeStartIndex(bars, range);
    const end = bars.length - 1;
    const isKline = mode === "kline";

    const priceSeries = isKline
      ? {
          name: t("company.priceChart.kline"),
          type: "candlestick",
          // echarts K 线的数据顺序是 [开, 收, 低, 高]，不是常见的“开高低收”
          data: bars.map((b) => [b.open, b.close, b.low, b.high]),
          itemStyle: { color: upColor, color0: downColor, borderColor: upColor, borderColor0: downColor },
        }
      : {
          name: t("company.priceChart.close"),
          type: "line",
          data: bars.map((b) => b.close),
          showSymbol: false,
          lineStyle: { width: 1.6, color: "#2563eb" },
          itemStyle: { color: "#2563eb" },
          areaStyle: { color: "rgba(37, 99, 235, 0.08)" },
        };

    return {
      animation: false,
      // 上下两块：上面价格（折线或 K 线），下面成交量；共用横轴，缩放和十字线联动
      grid: [
        { left: 60, right: 20, top: 16, height: "62%" },
        { left: 60, right: 20, top: "76%", height: "12%" },
      ],
      xAxis: [
        { type: "category", data: dates, boundaryGap: isKline, axisLabel: { hideOverlap: true }, axisLine: { lineStyle: { color: "#d1d5db" } } },
        { type: "category", gridIndex: 1, data: dates, boundaryGap: isKline, axisLabel: { show: false }, axisTick: { show: false }, axisLine: { lineStyle: { color: "#d1d5db" } } },
      ],
      yAxis: [
        { scale: true, splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } }, axisLabel: { formatter: (v: number) => fmtPrice(v) } },
        { gridIndex: 1, scale: true, splitNumber: 2, splitLine: { show: false }, axisLabel: { formatter: (v: number) => fmtVolume(v) } },
      ],
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      dataZoom: [
        { type: "inside", xAxisIndex: [0, 1], startValue: start, endValue: end },
        { type: "slider", xAxisIndex: [0, 1], startValue: start, endValue: end, bottom: 6, height: 18 },
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        formatter: (params: unknown) => {
          const first = (Array.isArray(params) ? params[0] : params) as { dataIndex?: number } | undefined;
          const i = first?.dataIndex;
          if (i === undefined || !bars[i]) return "";
          const b = bars[i];
          const prev = bars[i - 1];
          const change = prev ? b.close / prev.close - 1 : null;
          const changeColor = change === null ? "#6b7280" : change >= 0 ? upColor : downColor;
          const row = (label: string, value: string, color = "#111827") =>
            `<div style="display:flex;justify-content:space-between;gap:16px"><span style="color:#6b7280">${label}</span><span style="color:${color};font-variant-numeric:tabular-nums">${value}</span></div>`;
          return `<div style="min-width:160px">
              <div style="font-weight:600;margin-bottom:4px">${b.date}</div>
              ${row(t("company.priceChart.open"), fmtPrice(b.open))}
              ${row(t("company.priceChart.high"), fmtPrice(b.high))}
              ${row(t("company.priceChart.low"), fmtPrice(b.low))}
              ${row(t("company.priceChart.close"), fmtPrice(b.close))}
              ${row(t("company.priceChart.change"), change === null ? "—" : fmtPct(change), changeColor)}
              ${row(t("company.priceChart.volume"), fmtVolume(b.volume))}
            </div>`;
        },
      },
      series: [
        priceSeries,
        {
          name: t("company.priceChart.volume"),
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          // 成交量柱子按当天涨跌着色（收盘 >= 开盘算涨）
          data: bars.map((b) => ({ value: b.volume, itemStyle: { color: b.close >= b.open ? upColor : downColor, opacity: 0.5 } })),
        },
      ],
    };
  }, [bars, mode, range, upColor, downColor, t]);

  // 拖动缩放后，从图表实例里读出当前可见的起止下标，更新顶部指标
  const onEvents = useMemo(
    () => ({
      datazoom: () => {
        const inst = chartRef.current?.getEchartsInstance();
        const dz = (inst?.getOption() as { dataZoom?: { startValue?: number; endValue?: number }[] } | undefined)?.dataZoom?.[0];
        if (dz && typeof dz.startValue === "number" && typeof dz.endValue === "number") {
          setView([dz.startValue, dz.endValue]);
        }
      },
    }),
    []
  );

  const title = `${t("company.priceChart.title")} · ${symbol}`;

  if (state.kind !== "ok") {
    const message =
      state.kind === "loading" ? t("company.priceChart.loading")
      : state.kind === "notFound" ? t("company.priceChart.noData")
      : t("company.priceChart.loadFailed");
    return (
      <Card title={title}>
        <div className={`flex h-40 items-center justify-center text-sm ${state.kind === "error" ? "text-red-600" : "text-gray-400"}`}>
          {message}
        </div>
      </Card>
    );
  }

  const changeColor = stats && stats.change >= 0 ? upColor : downColor;
  const btn = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-md transition-colors ${active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`;

  return (
    <Card title={title}>
      {/* 顶部：区间指标 + 切换按钮 */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-xs text-gray-500">{t("company.priceChart.lastClose")}</div>
            <div className="text-2xl font-semibold text-gray-900 tabular-nums">{stats ? fmtPrice(stats.lastClose) : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("company.priceChart.rangeChange")}</div>
            <div className="text-2xl font-semibold tabular-nums" style={{ color: changeColor }}>{stats ? fmtPct(stats.change) : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("company.priceChart.maxDrawdown")}</div>
            <div className="text-2xl font-semibold text-gray-900 tabular-nums">{stats ? fmtPct(stats.maxDrawdown) : "—"}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {(["line", "kline"] as Mode[]).map((m) => (
              <button key={m} type="button" className={btn(mode === m)} onClick={() => setMode(m)}>
                {t(m === "line" ? "company.priceChart.line" : "company.priceChart.kline")}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {RANGES.map((r) => (
              <button key={r} type="button" className={btn(range === r)} onClick={() => setRange(r)}>
                {t(`company.priceChart.range.${r}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {option && (
        <ReactECharts ref={chartRef} option={option} style={CHART_STYLE} notMerge lazyUpdate onEvents={onEvents} />
      )}

      <div className="mt-2 text-xs text-gray-400">
        {state.history.adjusted ? t("company.priceChart.adjustedNote") : ""}
        {stats ? ` · ${t("company.priceChart.dataThrough", { date: bars[bars.length - 1].date })}` : ""}
      </div>
    </Card>
  );
};

export default StockPriceChart;
