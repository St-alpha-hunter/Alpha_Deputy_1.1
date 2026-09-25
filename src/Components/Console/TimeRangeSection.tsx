import type { StrategySpecV0, BacktestDataRange } from "../../Models/strategySpecV0";
import { useTranslation } from "react-i18next";

type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
  dataRange: BacktestDataRange;
};



//前端 <input type="date"> 给的是 YYYY-MM-DD，后端 DateTimeOffset 需要能解析的时间戳（ISO 8601 最稳）

// ✅ 前端 UI 仍然用 date picker（用户选日期）
// ✅ 但你存进 spec.timeRange.startDate/endDate 的必须是 ISO 字符串（例如 2026-01-01T00:00:00.000Z）
// ✅ 提交给后端时，ISO 字符串会被 DateTimeOffset 正确反序列化


const TimeRangeSection = ({ spec, setSpec, dataRange }: Props) => {
        const { t } = useTranslation();

        // ISO -> "YYYY-MM-DD"（给 <input type="date"> 用）
        const isoToDateInputValue = (iso: string) => {
            if (!iso) return "";
            return iso.slice(0, 10);
            }

        // "YYYY-MM-DD" -> ISO（给后端 DateTimeOffset 用）
        // 统一用 UTC 0 点，避免时区歧义
        const dateInputValueToIso = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
            }


  return (
    <div className = "mr-10  text-gray-100 ml-5">
       <h2 className = "text-yellow-400 mb-5 font-bold text-left">{t("console.timeRange.title")}</h2>

            <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-y-5 gap-x-3 max-w-xl">
                
                <h3 className="text-sm leading-snug">{t("console.timeRange.startDate")}</h3>
                <input
                            className="text-red-500 font-bold w-full min-w-0"
                            type="date"
                            min={dataRange.minDate}
                            max={isoToDateInputValue(spec.timeRange.endDate) || dataRange.maxDate}
                            value={isoToDateInputValue(spec.timeRange.startDate)}
                            onChange={(e) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    timeRange: { ...prev.timeRange, startDate: dateInputValueToIso(e.target.value) },
                                }))
                            }
                        />  
                

           
                <h3 className="text-sm leading-snug">{t("console.timeRange.endDate")}</h3>
                        <input
                            className="text-red-500 font-bold w-full min-w-0"
                            type="date"
                            min={isoToDateInputValue(spec.timeRange.startDate) || dataRange.minDate}
                            max={dataRange.maxDate}
                            value={isoToDateInputValue(spec.timeRange.endDate)}
                            onChange={(e) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    timeRange: { ...prev.timeRange, endDate: dateInputValueToIso(e.target.value) },
                                }))
                            }
                        />  
          

                <h3 className="text-sm leading-snug">{t("console.timeRange.calendar")}</h3>
                    <select className="text-red-500 font-bold w-full min-w-0"
                            value = {spec.timeRange.calendar}
                            onChange={(e) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    timeRange: { ...prev.timeRange, calendar: e.target.value },
                                }))
                            }
                        >
                            <option value="XNYS" className="text-red-500 font-bold w-full min-w-0">{t("console.timeRange.calendarXNYS")}</option>
                            <option value="" className="text-red-500 font-bold w-full min-w-0">{t("console.timeRange.calendarComingSoon")}</option>
                    </select>                        
            
        </div>
        <p className="mt-4 text-xs text-gray-300">
          {t("console.timeRange.availableRange", { min: dataRange.minDate, max: dataRange.maxDate })}
        </p>
    </div>  
  )
};

export default TimeRangeSection;