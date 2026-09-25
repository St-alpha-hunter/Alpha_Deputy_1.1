import { number } from "yup";
import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import NumberField from "../../Helpers/NumberField";
import { useTranslation } from "react-i18next";


type Props = {
    spec: StrategySpecV0;
    setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
}

const PortfolioSection = ({ spec, setSpec }: Props) => {
    const { t } = useTranslation();


    //暂时不用
    // const handleNumerOfStocks = (value: number) => {
    //    const  numberOfStocks = Math.round( value/100 ) * 100; 
    //      if (numberOfStocks < 30 || numberOfStocks > 5000) {
    //         toast.error("选股数量至少30只");
    //         return;
    //      };

    //      setSpec((prev) => ({
    //          ...prev,
    //          portfolio: { ...prev.portfolio, selector: { ...prev.portfolio.selector, k: numberOfStocks } },
    //      }));
    // }

    const handleIntialCash = (value: number) => {
        if (value < 10000 || value > 100000000) return;
        setSpec((prev) => ({
            ...prev,
            portfolio: { ...prev.portfolio, initialCash: value },
        }));
    }


    const handleTargetCashWeight = (value: number) => {
        if (value < 0 || value > 1) {
            toast.error(t("console.portfolio.targetCashWeightError"));
            return;
        } 
        setSpec((prev) => ({
            ...prev,
            portfolio: { ...prev.portfolio, targetCashWeight: value },
        }));
    }

    const handleMaxPositionWeight = (value: number) => {
        if (value < 0 || value > 0.4) {
            toast.error(t("console.portfolio.maxPositionWeightError"));
            return;
        }
            
        setSpec((prev) => ({
            ...prev,
            riskManagement: { ...prev.riskManagement, maxPositionWeight: value },
        }));
    }

    return (
        <div className = "mr-10  text-gray-100">
            <h2 className = "text-yellow-400 mb-5 font-bold text-left">{t("console.portfolio.title")}</h2>

            <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-y-5 gap-x-3 max-w-xl">
                
                <h3 className="text-sm leading-snug">{t("console.portfolio.selector")}</h3>
                <select
                        className="text-red-500 font-bold w-full min-w-0"
                        value={spec.portfolio.selector.type}
                        onChange={(e) =>
                            setSpec((prev) => ({
                                ...prev,
                                portfolio: { ...prev.portfolio, selector: { ...prev.portfolio.selector, type: e.target.value as any } },
                            }))
                        }
                    >
                        <option value="top_k">{t("console.portfolio.selectorTopK")}</option>
                        <option value="">{t("console.portfolio.selectorComingSoon")}</option>
                </select>
           

           
                <h3 className="text-sm leading-snug">{t("console.portfolio.numberOfStocks")}</h3>
                <NumberField
                    className="text-red-500 font-bold w-full min-w-0"
                    value={spec.portfolio.selector.k}
                    min={10}
                    max={50}
                    step={1}
                    normalize={(v) => Math.round(v)}
                    validate={(v) => (v < 10 || v > 50 ? t("console.portfolio.numberOfStocksError") : null)}
                    onInvalid={(msg) => toast.error(msg)}
                    onCommit={(k) =>
                        setSpec((prev) => ({
                        ...prev,
                        portfolio: {
                            ...prev.portfolio,
                            selector: { ...prev.portfolio.selector, k },
                        },
                        }))
                    }
/>
            


            
                <h3 className="text-sm leading-snug">{t("console.portfolio.weighting")}</h3>
                <select className="text-red-500 font-bold w-full min-w-0"
                        value={spec.portfolio.weighting.type}
                        onChange={(e) =>
                            handleMaxPositionWeight(Number(e.target.value))
                        }
                    >
                        <option value = {spec.portfolio.weighting.type}>{t("console.portfolio.weightingEqual")}</option>
                        <option value="">{t("console.portfolio.weightingComingSoon")}</option>
                    </select>
            


            
                    <h3 className="text-sm leading-snug">{t("console.portfolio.initialCash")}</h3>
                        <NumberField
                            className="text-red-500 font-bold w-full min-w-0"
                            value={spec.portfolio.initialCash}
                            min={1000000}
                            max={100000000}
                            step = {100000}
                            validate = {(v) => (v < 1000000 || v > 100000000 ? t("console.portfolio.initialCashError") : null)}
                            onInvalid={(msg) => toast.error(msg)}
                            onCommit={(initialCash) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    portfolio: { ...prev.portfolio, initialCash },
                                }))
                            }
                        />
            


            
                    <h3 className="text-sm leading-snug">{t("console.portfolio.targetCashWeight")}</h3>
                        <NumberField
                            className="text-red-500 font-bold w-full min-w-0"
                            value={spec.portfolio.targetCashWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            validate={(v) => (v < 0 || v > 1 ? t("console.portfolio.targetCashWeightError") : null)}
                            onInvalid={(msg) => toast.error(msg)}
                            onCommit={(targetCashWeight) =>
                                setSpec((prev) => ({
                                ...prev,
                                portfolio: { ...prev.portfolio, targetCashWeight },
                                }))
                        }
                        />
            
            </div>
    </div>
    )
};

export default PortfolioSection;