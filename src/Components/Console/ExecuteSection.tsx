import { toast } from "react-toastify";
import type { StrategySpecV0 } from "../../Models/strategySpecV0";
import NumberField from "../../Helpers/NumberField";
import { useTranslation } from "react-i18next";


type Props = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
};


const ExecuteSection = ({ spec, setSpec }: Props) => {
    const { t } = useTranslation();

    const handleCommissionBps = (value: number) => {
        if (value < 0 || value > 0.05) {
            toast.error(t("console.execute.commissionHandlerError"));
            return;
        } 
        setSpec((prev) => ({
            ...prev,
            execute: { ...prev.execute, commissionBps: value },
        }));
    }

    const handleSlippageBps = (value: number) => {
        if (value < 0 || value > 0.05) {
            toast.error(t("console.execute.slippageHandlerError"));
            return;
        }
        setSpec((prev) => ({
            ...prev,
            execute: { ...prev.execute, slippageBps: value },
        }));
    }

  return (
    <div className = "mr-10  text-gray-100">
       <h2 className = "text-yellow-400 mb-5 font-bold text-left">{t("console.execute.title")}</h2>

       
       <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-y-5 gap-x-3 max-w-xl">
            <h3 className="text-sm leading-snug">{t("console.execute.priceType")}</h3>
                <select
                    className="text-red-500 font-bold w-full min-w-0"
                    value={spec.execute.priceType}
                    onChange={(e) =>
                        setSpec((prev) => ({
                            ...prev,
                            execute: { ...prev.execute, priceType: e.target.value as any },
                        }))
                    }
                >
                    <option value = "next_open">{t("console.execute.priceTypeNextOpen")}</option>
                    <option value = "close">{t("console.execute.priceTypeClose")}</option>
                </select>
        

        
            <h3 className="text-sm leading-snug">{t("console.execute.commission")}</h3>
                <NumberField
                        className="text-red-500 font-bold w-full min-w-0"
                        value={spec.execute.commissionBps}
                        min={0}
                        max={0.003}
                        step={0.0001}
                        validate={(v) => (v < 0 || v > 0.003 ? t("console.execute.commissionError") : null)}
                        onInvalid={(msg) => toast.error(msg)}
                        onCommit={(commissionBps) =>
                            setSpec((prev) => ({
                                ...prev,
                                execute: { ...prev.execute, commissionBps },
                            }))
                        }/>
        

      
            <h3 className="text-sm leading-snug">{t("console.execute.slippage")}</h3>
                <NumberField
                        className="text-red-500 font-bold w-full min-w-0"
                        value={spec.execute.slippageBps}
                        min={0}
                        max={0.003}
                        step={0.0001}
                        validate={(v) => (v < 0 || v > 0.003 ? t("console.execute.slippageError") : null)}
                        onInvalid={(msg) => toast.error(msg)}
                        onCommit={(slippageBps) =>
                            setSpec((prev) => ({
                                ...prev,
                                execute: { ...prev.execute, slippageBps },
                            }))
                        }/>     

    
            <h3 className="text-sm leading-snug">{t("console.execute.allowShort")}</h3>
            <select
                className="text-red-500 font-bold w-full min-w-0"
                value ={spec.execute.allowShort ? "true" : "false"}
                onChange={(e) =>
                    setSpec((prev) => ({
                        ...prev,
                        execute: { ...prev.execute, allowShort: e.target.value === "true" },
                    }))
                }
            >
                <option value="true">{t("console.execute.allow")}</option>
                <option value="false">{t("console.execute.disallow")}</option>
            </select>
       
        </div>
     </div>
  )
};

export default ExecuteSection;