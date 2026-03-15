import type { StrategySpecV0 } from "../../Models/strategySpecV0";

type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
};


const clampInt = (n: number, min: number, max: number) => {
  const x = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, x));
};


//调仓如果选了月频率，dayofWeek应该咋办


const RebalanceSection = ({ spec, setSpec }: Props) => {

  const onFreqChange = (v: "Weekly" | "Monthly") => {
    setSpec((prev) => {
      const next = {
        ...prev,
        rebalance: {
          ...prev.rebalance,
          freq: v,
        },
      };

      if (v === "Weekly") {
        const dow = clampInt(prev.rebalance.dayOfWeek ?? 1, 1, 5);
        return {
          ...next,
          rebalance: {
            ...next.rebalance,
            dayOfWeek: dow,
            dayOfMonth: undefined,
          },
        };
      }

      // v === "M"
      const dom = clampInt(prev.rebalance.dayOfMonth ?? 1, 1, 28);
      return {
        ...next,
        rebalance: {
          ...next.rebalance,
          dayOfMonth: dom,
          dayOfWeek: undefined,
        },
      };
    });
  };

  const weekOptions = [1, 2, 3, 4, 5];
  const monthOptions = Array.from({ length: 28 }, (_, i) => i + 1)



  return (
    <div className = "mr-10  text-gray-100 ml-5">
      <h2 className = " text-yellow-400 mb-5 font-bold text-left">调仓频率 Rebalance</h2>

      <div className = "grid grid-cols-1 gap-x-2 gap-y-4 max-w-xl">

      <div>
          <h3>调仓频率</h3>
          <div className = "grid grid-cols-2 gap-x-2">
            
            <select
              className="text-red-500"
              value={spec.rebalance.freq}
              onChange={(e) => onFreqChange(e.target.value as "Weekly" | "Monthly")}
            >
              <option value="Weekly">每周 Weekly</option>
              <option value="Monthly">每月 Monthly</option>
            </select>

            {/* day：根据 freq 切换 */}
            {spec.rebalance.freq === "Weekly" ? (
              <select
                className="text-red-500"
                value={spec.rebalance.dayOfWeek ?? 1}
                onChange={(e) =>
                  setSpec((prev) => ({
                    ...prev,
                    rebalance: {
                      ...prev.rebalance,
                      dayOfWeek: clampInt(Number(e.target.value), 1, 5),
                      dayOfMonth: undefined,
                    },
                  }))
                }
              >
                {weekOptions.map((d) => (
                  <option key={d} value={d}>
                    周{d}({["", "一", "二", "三", "四", "五"][d]})
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="text-red-500"
                value={spec.rebalance.dayOfMonth ?? 1}
                onChange={(e) =>
                  setSpec((prev) => ({
                    ...prev,
                    rebalance: {
                      ...prev.rebalance,
                      dayOfMonth: clampInt(Number(e.target.value), 1, 28),
                      dayOfWeek: undefined,
                    },
                  }))
                }
              >
                {monthOptions.map((d) => (
                  <option key={d} value={d}>
                    {d} 号
                  </option>
                ))}
              </select>
            )}
          </div>
      </div>


      <div>
        <h3>假期策略</h3>
          <select
            className = "text-red-500"
            value={spec.rebalance.holidayPolicy}
            onChange={(e) =>
              setSpec((prev) => ({
                ...prev,
                rebalance: { ...prev.rebalance, holidayPolicy: e.target.value as any },
              }))
            }
          >
          <option value="skip">跳过 Skip</option>
          <option value="next_trading_day">下一个交易日 Next Trading Day</option>
          <option value="prev_trading_day">前一个交易日 Prev Trading Day</option>
        </select>
      </div>


      </div>
    </div>
  );
};

export default RebalanceSection;