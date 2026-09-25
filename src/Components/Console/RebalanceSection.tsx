import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <h2 className = " text-yellow-400 mb-5 font-bold text-left">{t("console.rebalance.title")}</h2>

      <div className = "grid grid-cols-1 gap-x-2 gap-y-4 max-w-xl">

      <div>
          <h3 className="text-sm leading-snug">{t("console.rebalance.freq")}</h3>
          <div className = "grid grid-cols-2 gap-x-2">
            
            <select
              className="text-red-500 w-full min-w-0"
              value={spec.rebalance.freq}
              onChange={(e) => onFreqChange(e.target.value as "Weekly" | "Monthly")}
            >
              <option value="Weekly">{t("console.rebalance.weekly")}</option>
              <option value="Monthly">{t("console.rebalance.monthly")}</option>
            </select>

            {/* day：根据 freq 切换 */}
            {spec.rebalance.freq === "Weekly" ? (
              <select
                className="text-red-500 w-full min-w-0"
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
                    {t(`console.rebalance.weekdays.${d}`)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="text-red-500 w-full min-w-0"
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
                    {t("console.rebalance.dayOfMonth", { day: d })}
                  </option>
                ))}
              </select>
            )}
          </div>
      </div>


      <div>
        <h3 className="text-sm leading-snug">{t("console.rebalance.holidayPolicy")}</h3>
          <select
            className="text-red-500 w-full min-w-0"
            value={spec.rebalance.holidayPolicy}
            onChange={(e) =>
              setSpec((prev) => ({
                ...prev,
                rebalance: { ...prev.rebalance, holidayPolicy: e.target.value as any },
              }))
            }
          >
          <option value="skip">{t("console.rebalance.skip")}</option>
          <option value="next_trading_day">{t("console.rebalance.nextTradingDay")}</option>
          <option value="prev_trading_day">{t("console.rebalance.prevTradingDay")}</option>
        </select>
      </div>


      </div>
    </div>
  );
};

export default RebalanceSection;