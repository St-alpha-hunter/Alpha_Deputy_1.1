import React from 'react';
import ReactECharts from "echarts-for-react";
import type { EquityCurve } from "../../Service/NewBacktestService";

interface EquityCurveChartProps {
  data: EquityCurve[];
}

const EquityCurveChart = ({ data }: EquityCurveChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-500">
        暂无净值曲线数据
      </div>
    );
  }

  const option = {
    title: {
      text: "Portfolio Equity Curve",
      left: "center",
    },

    tooltip: {
      trigger: "axis",
      formatter: (
        params: Array<{
          axisValue: string;
          value: number;
        }>
      ) => {
        const point = params[0];

        if (!point) {
          return "";
        }

        const netValue = Number(point.value);

        return `
          <div>
            <div>${point.axisValue}</div>
            <div>净值：${netValue.toFixed(4)}</div>
            <div>累计收益：${((netValue - 1) * 100).toFixed(2)}%</div>
          </div>
        `;
      },
    },

    grid: {left: "8%", right: "4%", top: "15%", bottom: "15%", containLabel: true,},

    xAxis: {
        type: "category", boundaryGap: false, data: data.map((item) => item.date), axisLabel: {hideOverlap: true,},
    },

    yAxis: {
        type: "value", scale: true, name: "净值", axisLabel: {formatter: (value: number) => value.toFixed(2),},
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