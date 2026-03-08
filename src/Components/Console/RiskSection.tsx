import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import { toast } from "react-toastify";
import NumberField from "../../Helpers/NumberField";


type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
};






const RiskSection = ({ spec, setSpec }: Props) => {

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
                    <h2 className = " text-yellow-400 mb-5 font-bold text-left">风险控制 Risk Management</h2>

                         <div className="grid grid-cols-[100px_1fr] gap-y-6 gap-x-2 max-w-xl">

                            <h3>允许最大回撤</h3>
                            <NumberField
                                    className = "text-red-500 font-bold"
                                    value={spec.riskManagement.maxDrawdown}
                                    min={0}
                                    max={0.5}
                                    step={0.01}
                                    validate={(v) => (v < 0 || v > 0.5 ? "允许最大回撤应该设定在0-0.5之间" : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxDrawdown) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxDrawdown },
                                        }))
                                    }
                            />
                        
                        
                            <h3>单票最大持仓 </h3>
                            <NumberField
                                    className = "text-red-500 font-bold"
                                    value={spec.riskManagement.maxPositionWeight}
                                    min={0}
                                    max={0.2}
                                    step={0.001}
                                    validate={(v) => (v < 0 || v > 0.2 ? "单票最大持仓应该设定在0-0.2之间" : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxPositionWeight) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxPositionWeight },
                                        }))
                                    }
                                    />
                       

                       
                            <h3>最大换手率</h3>
                            <NumberField
                                    className = "text-red-500 font-bold"
                                    value={spec.riskManagement.maxTurnover}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                    validate={(v) => (v < 0 || v > 10 ? "最大换手率应该设定在0-10之间" : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxTurnover) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxTurnover },
                                        }))
                                    }
                            />
                        
                        
                            <h3>杠杆</h3>
                            <NumberField
                                    className = "text-red-500 font-bold"
                                    value={spec.riskManagement.maxLeverage}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    validate={(v) => (v < 0 || v > 5 ? "杠杆倍数应该设定在0-5之间" : null)}
                                    onInvalid={(msg) => toast.error(msg)}
                                    onCommit={(maxLeverage) =>
                                        setSpec((prev) => ({
                                            ...prev,
                                            riskManagement: { ...prev.riskManagement, maxLeverage },
                                        }))
                                    }
                            />
                        
                        
                            <h3>目标波动率 </h3>
                                <NumberField
                                        className = "text-red-500 font-bold"
                                        value={spec.riskManagement.volTarget}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        validate={(v) => (v < 0 || v > 1 ? "目标波动率应该设定在0-1之间" : null)}
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