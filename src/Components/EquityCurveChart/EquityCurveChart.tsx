import React from 'react';
import ReactECharts from "echarts-for-react";
import type { EquityCurve } from "../../Models/BacktestResult";
import { useTranslation } from "react-i18next";

interface EquityCurveChartProps {
  data: EquityCurve[];
  showTitle?: boolean;
}

const EquityCurveChart = ({ data, showTitle = true }: EquityCurveChartProps) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-500">
        {t("report.chart.noData")}
      </div>
    );
  }

  const option = {
    title: {
      show: showTitle,
      text: "Portfolio Equity Curve",
      left: "center",
    },

    tooltip: {
      trigger: "axis",
      // echarts 传进来的可能是单个对象也可能是数组，用 dataIndex 回查原始点，这样能同时拿到 value 和 netValue
      formatter: (params: unknown) => {
        const first = (Array.isArray(params) ? params[0] : params) as { dataIndex?: number } | undefined;
        const point = first?.dataIndex !== undefined ? data[first.dataIndex] : undefined;

        if (!point) {
          return "";
        }

        const assetLine = Number.isFinite(point.value)
          ? `<div>${t("report.chart.value")}：${point.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>`
          : "";

        return `
          <div>
            <div>${point.date}</div>
            <div>${t("report.chart.netValue")}：${point.netValue.toFixed(4)}</div>
            <div>${t("report.chart.cumReturn")}：${((point.netValue - 1) * 100).toFixed(2)}%</div>
            ${assetLine}
          </div>
        `;
      },
    },

    grid: {left: "8%", right: "4%", top: showTitle ? "15%" : "8%", bottom: "15%", containLabel: true,},

    xAxis: {
        type: "category", boundaryGap: false, data: data.map((item) => item.date), axisLabel: {hideOverlap: true,},
    },

    yAxis: {
        type: "value", scale: true, name: t("report.chart.netValue"), axisLabel: {formatter: (value: number) => value.toFixed(2),},
    },

    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        start: 0,
        end: 100,
      },
    ],

    series: [
      {
        name: "Portfolio Net Value",
        type: "line",
        data: data.map((item) => item.netValue),
        showSymbol: false,
        smooth: false,
        connectNulls: false,
        lineStyle: {
          width: 2,
        },
        areaStyle: {
          opacity: 0.08,
        },
      },
    ],
  };

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: "420px",
        }}
        notMerge
        lazyUpdate
      />
    </div>
  );
};

export default EquityCurveChart;


// const option = {
//   title: {
//     text: "Portfolio Equity Curve",
//   },
//   tooltip: {
//     trigger: "axis",
//   },
//   xAxis: {
//     type: "category",
//     data: data.map((item) => item.date),
//   },
//   yAxis: {
//     type: "value",
//     scale: true,
//   },
//   series: [
//     {
//       name: "Net Value",
//       type: "line",
//       data: data.map((item) => item.netValue),
//       showSymbol: false,
//       smooth: false,
//     },
//   ],
// };