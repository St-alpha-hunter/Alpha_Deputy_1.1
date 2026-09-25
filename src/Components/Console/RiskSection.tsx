import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import { toast } from "react-toastify";
import NumberField from "../../Helpers/NumberField";
import { useTranslation } from "react-i18next";


type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
};






const RiskSection = ({ spec, setSpec }: Props) => {
        const { t } = useTranslation();

        const handleMaxDrawdown = (value: number) => {
                if (value < 0 || value > 0.5) return;


                
                setSpec((prev) => ({
                    ...prev,
                    riskManagement: {
                    ...prev.riskManagement,
                    maxDrawdown: value,
                    },
                }));
                };


        const handleMaxPositionPerStock = (value: number) => {
                if (value > 0.1 || value < 0) return;

                setSpec((prev) => ({
                    ...prev,
                    riskManagement: {
                    ...prev.riskManagement,
                    maxPositionWeight: value,
                    },
                }));
                };


        const handleMaxTurnoverRate = (value: number) => {
                if (value < 0 || value > 1) return;
                setSpec((prev) => ({
                    ...prev,
                    riskManagement: {
                    ...prev.riskManagement,
                    maxTurnoverRate: value,
                    },
                }));
                };


        const handleMaxLeverage = (value: number) => {
                if (value < 1 || value > 3) return;
                setSpec((prev) => ({
                    ...prev,
                    riskManagement: {
                    ...prev.riskManagement,
                    maxLeverage: value,
                    },
                }));
            }
        

        const handleTargetVolatility = (value: number) => {
                if (value < 0 || value > 1) return;
                setSpec((prev) => ({
                    ...prev,
                    riskManagement: {
                    ...prev.riskManagement,
                    targetVolatility: value,
                    },
                }));
        };

    return (
                <div className = "mr-10  text-gray-100 ml-5">
                    <h2 className = " text-yellow-400 mb-5 font-bold text-left">{t("console.risk.title")}</h2>

                         <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-y-5 gap-x-3 max-w-xl">

                            <h3 className="text-sm leading-snug">{t("console.risk.maxDrawdown")}</h3>
                            <NumberField
                                    className="text-red-500 font-bold w-full min-w-0"
                                    value={spec.riskManagement.maxDrawdown}
                                    min={0}
                                    max={0.5}
                                    step={0.01}
                                    validate={(v) => (v < 0 || v > 0.5 ? t("console.risk.maxDrawdownError") : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxDrawdown) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxDrawdown },
                                        }))
                                    }
                            />
                        
                        
                            <h3 className="text-sm leading-snug">{t("console.risk.maxPositionWeight")}</h3>
                            <NumberField
                                    className="text-red-500 font-bold w-full min-w-0"
                                    value={spec.riskManagement.maxPositionWeight}
                                    min={0}
                                    max={0.2}
                                    step={0.001}
                                    validate={(v) => (v < 0 || v > 0.2 ? t("console.risk.maxPositionWeightError") : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxPositionWeight) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxPositionWeight },
                                        }))
                                    }
                                    />
                       

                       
                            <h3 className="text-sm leading-snug">{t("console.risk.maxTurnover")}</h3>
                            <NumberField
                                    className="text-red-500 font-bold w-full min-w-0"
                                    value={spec.riskManagement.maxTurnover}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                    validate={(v) => (v < 0 || v > 10 ? t("console.risk.maxTurnoverError") : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxTurnover) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxTurnover },
                                        }))
                                    }
                            />
                        
                        
                            <h3 className="text-sm leading-snug">{t("console.risk.maxLeverage")}</h3>
                            <NumberField
                                    className="text-red-500 font-bold w-full min-w-0"
                                    value={spec.riskManagement.maxLeverage}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    validate={(v) => (v < 0 || v > 5 ? t("console.risk.maxLeverageError") : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxLeverage) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxLeverage },
                                        }))
                                    }
                            />
                        
                        
                            <h3 className="text-sm leading-snug">{t("console.risk.volTarget")}</h3>
                                <NumberField
                                        className="text-red-500 font-bold w-full min-w-0"
                                        value={spec.riskManagement.volTarget}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        validate={(v) => (v < 0 || v > 1 ? t("console.risk.volTargetError") : null)}
                                        onInvalid={(msg) => toast.error(msg)}
                                        onCommit={(volTarget) =>
                                            setSpec((prev) => ({
                                                ...prev,
                                                riskManagement: { ...prev.riskManagement, volTarget },
                                            }))
                                        }
                                />
                        
                    </div>

                </div>
  )
};

export default RiskSection;