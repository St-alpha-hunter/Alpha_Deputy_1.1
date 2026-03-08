import { number } from "yup";
import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import { useEffect, useState } from "react"
import { toast } from "react-toastify";
import NumberField from "../../Helpers/NumberField";


type Props = {
    spec: StrategySpecV0;
    setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
}

const PortfolioSection = ({ spec, setSpec }: Props) => {


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
            toast.error("无风险资金比例应该设定在0-1之间");
            return;
        } 
        setSpec((prev) => ({
            ...prev,
            portfolio: { ...prev.portfolio, targetCashWeight: value },
        }));
    }

    const handleMaxPositionWeight = (value: number) => {
        if (value < 0 || value > 0.2) {
            toast.error("单只股票最大权重应该设定在0-0.2之间");
            return;
        }
            
        setSpec((prev) => ({
            ...prev,
            riskManagement: { ...prev.riskManagement, maxPositionWeight: value },
        }));
    }

    return (
        <div className = "mr-10  text-gray-100">
            <h2 className = "text-yellow-400 mb-5 font-bold text-left">投资组合属性设定 Portfolio</h2>

            <div className="grid grid-cols-[100px_1fr] gap-y-6 gap-x-2 max-w-xl">
                
                <h3>选股规则</h3>
                <select
                        className = "text-red-500 font-bold"
                        value={spec.portfolio.selector.type}
                        onChange={(e) =>
                            setSpec((prev) => ({
                                ...prev,
                                portfolio: { ...prev.portfolio, selector: { ...prev.portfolio.selector, type: e.target.value as any } },
                            }))
                        }
                    >
                        <option value="top_k">Top K</option>
                        <option value="">敬请期待其他选股模型上线</option>
                </select>
           

           
                <h3>选股数量</h3>
                <NumberField
                    className="text-red-500 font-bold"
                    value={spec.portfolio.selector.k}
                    min={30}
                    max={5000}
                    step={10}
                    normalize={(v) => Math.round(v / 100) * 100}
                    validate={(v) => (v < 30 || v > 5000 ? "选股数量至少30只,且不超过5000只" : null)}
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
            


            
                <h3>优化器</h3>
                <select className = "text-red-500 font-bold"
                        value={spec.portfolio.weighting.type}
                        onChange={(e) =>
                            handleMaxPositionWeight(Number(e.target.value))
                        }
                    >
                        <option value = {spec.portfolio.weighting.type}>Equal Weight</option>
                        <option value="">敬请期待其他权重模型上线</option>
                    </select>
            


            
                    <h3>初始资金 </h3>
                        <NumberField
                            className = "text-red-500 font-bold"
                            value={spec.portfolio.initialCash}
                            min={1000000}
                            max={100000000}
                            step = {100000}
                            validate = {(v) => (v < 1000000 || v > 100000000 ? "初始资金应该设定在100万-1亿之间" : null)}
                            onInvalid={(msg) => toast.error(msg)}
                            onCommit={(initialCash) =>
                                setSpec((prev) => ({
                                    ...prev,
                                    portfolio: { ...prev.portfolio, initialCash },
                                }))
                            }
                        />
            


            
                    <h3> 无风险资金%</h3>
                        <NumberField
                            className="text-red-500 font-bold"
                            value={spec.portfolio.targetCashWeight}
                            min={0}
                            max={1}
                            step={0.01}
                            validate={(v) => (v < 0 || v > 1 ? "无风险资金比例应该设定在0-1之间" : null)}
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