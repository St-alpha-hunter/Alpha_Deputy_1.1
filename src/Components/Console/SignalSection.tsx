import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import type { RootState } from "../../redux/features/store";
import NewFactorAdjuster from "../FactorAdjuster/NewFactorAdjuster";
import { useDispatch, useSelector } from 'react-redux';     
import NumberField from "../../Helpers/NumberField";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

type Props = {
    spec: StrategySpecV0;
    setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
}



//因子缺session_id，没法和因子表联动，要改。
///已经放进了Redux，考虑从Redux里面把因子的Session取出来

/// 这个一会儿去调整移动因子权重那一部分
const SignalSection = ({ spec, setSpec }: Props) => {
        const { t } = useTranslation();


        const onWeightChange = (e:any) =>{
            
        }





        const handleLookBack = (value: number) => {
            
            const day = Math.round(value / 100) * 100;

            if (day < 1 || day > 252) return;

            setSpec((spec) => ({
                ...spec,
                signal: {
                    ...spec.signal,
                    lookback: value,
                },
            }));
        }
        


    return (
    <div>
           {/* <h2 className="text-gray-100 font-bold text-left pl-5">因子</h2> */}

        <div>
            <h3 className="text-gray-100 pl-5 font-bold">{t("console.signal.title")}</h3>
            <div className="w-full max-w-5xl  text-center">
                <NewFactorAdjuster spec={spec} setSpec={setSpec} onWeightChange={onWeightChange} />
            </div>
        </div>


        <div className = "ml-5 flex flex-wrap gap-x-10 gap-y-2">
             <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h3 className="text-gray-100 font-bold">{t("console.signal.model")}</h3>
                    <select
                        className="text-red-500 font-bold"
                        value={spec.signal.type}
                        onChange={(e) =>
                            setSpec((prev) => ({
                                ...prev,
                                signal: { ...prev.signal, type: e.target.value as any },
                            }))
                        }
                    > 
                        <option value="linear_weight">{t("console.signal.linearWeight")}</option>
                        <option value = "" >{t("console.signal.comingSoon")}</option>
                    </select>
            </div>


            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h3 className="text-gray-100 font-bold">{t("console.signal.lookback")}</h3>
                    <NumberField
                        className="text-red-500 font-bold"
                        value={spec.signal.lookback}
                        min={1}
                        max={252}
                        step={1}
                        validate={(v) => (v < 1 || v > 252 ? t("console.signal.lookbackError") : null)}
                        onInvalid={(msg) => toast.error(msg)}
                        onCommit={(lookback) =>
                            setSpec((prev) => ({
                                ...prev,
                                signal: { ...prev.signal, lookback },
                            }))
                        }
                    />
            </div>


            <div className= "mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h3 className="text-gray-100 font-bold">{t("console.signal.lag")}</h3>
                    <select
                        className="text-red-500 font-bold"
                        value = {spec.signal.lag}
                        onChange={(e) => setSpec((prev) => ({
                            ...prev,
                            signal: { ...prev.signal, lag: Number(e.target.value) },
                        }))}
                    >
                        <option value={0}>{t("console.signal.lag0")}</option>
                        <option value={1}>{t("console.signal.lag1")}</option>
                        <option value={2}>{t("console.signal.lag2")}</option>  
                    </select>
            </div>
        </div>
    </div>
    )
}

export default SignalSection;


//这个组件主要是调整Signal相关的参数设置，目前先放一个简单的线性加权模型，后续会增加更多模型选项
//看看选项标题的字段