import { toast } from "react-toastify";
import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import NumberField from "../../Helpers/NumberField";


type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
};


const ExecuteSection = ({ spec, setSpec }: Props) => {

    const handleCommissionBps = (value: number) => {
        if (value < 0 || value > 0.05) {
            toast.error("交易费率应该设定在0-0.05之间");
            return;
        } 
        setSpec((prev) => ({
            ...prev,
            execute: { ...prev.execute, commissionBps: value },
        }));
    }

    const handleSlippageBps = (value: number) => {
        if (value < 0 || value > 0.05) {
            toast.error("滑点应该设定在0-0.05之间");
            return;
        }
        setSpec((prev) => ({
            ...prev,
            execute: { ...prev.execute, slippageBps: value },
        }));
    }

  return (
    <div className = "mr-10  text-gray-100">
       <h2 className = "text-yellow-400 mb-5 font-bold text-left">下单参数  Execute</h2>

       
       <div className="grid grid-cols-[100px_1fr] gap-y-6 gap-x-2 max-w-xl">
            <h3>成交时间</h3>
                <select
                    className = "text-red-500 font-bold"
                    value={spec.execute.priceType}
                    onChange={(e) =>
                        setSpec((prev) => ({
                            ...prev,
                            execute: { ...prev.execute, priceType: e.target.value as any },
                        }))
                    }
                >
                    <option value = "next_open">次日开盘成交</option>
                    <option value = "close">当日收盘成交</option>
                </select>
        

        
            <h3>交易费率</h3>
                <NumberField
                        className = "text-red-500 font-bold"
                        value={spec.execute.commissionBps}
                        min={0}
                        max={0.05}
                        step={0.001}
                        validate={(v) => (v < 0 || v > 0.05 ? "交易费率应该设定在0-0.05之间" : null)}
                        onInvalid={(msg) => toast.error(msg)}
                        onCommit={(commissionBps) =>
                            setSpec((prev) => ({
                                ...prev,
                                execute: { ...prev.execute, commissionBps },
                            }))
                        }/>
        

      
            <h3 >模拟滑点</h3>
                <NumberField
                        className = "text-red-500 font-bold"
                        value={spec.execute.slippageBps}
                        min={0}
                        max={0.05}
                        step={0.001}
                        validate={(v) => (v < 0 || v > 0.05 ? "滑点应该设定在0-0.05之间" : null)}
                        onInvalid={(msg) => toast.error(msg)}
                        onCommit={(slippageBps) =>
                            setSpec((prev) => ({
                                ...prev,
                                execute: { ...prev.execute, slippageBps },
                            }))
                        }/>     

    
            <h3>是否允许卖空</h3>
            <select
                className = "text-red-500 font-bold"
                value ={spec.execute.allowShort ? "true" : "false"}
                onChange={(e) =>
                    setSpec((prev) => ({
                        ...prev,
                        execute: { ...prev.execute, allowShort: e.target.value === "true" },
                    }))
                }
            >
                <option value="true">允许</option>
                <option value="false">不允许</option>
            </select>
       
        </div>
     </div>
  )
};

export default ExecuteSection;