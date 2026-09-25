import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { makeDefaultStrategySpecV0, type StrategySpecV0, type BacktestDataRange } from '../../Models/strategySpecV0';
import { getBacktestDataRange } from '../../Service/BacktestDataService';


import TimeRangeSection from '../../Components/Console/TimeRangeSection';
import PortfolioSection from '../../Components/Console/PortfolioSection';
import SignalSection from '../../Components/Console/SignalSection';
import ExecuteSection from '../../Components/Console/ExecuteSection';
import RiskSection from '../../Components/Console/RiskSection';
import { useNavigate } from 'react-router-dom'; 

import { createBacktest, type BacktestResult } from '../../Service/NewBacktestService';

import RebalanceSection from '../../Components/Console/RebalanceSection';

import taskReducer, { setCurrentTaskId } from '../../redux/features/Task/taskSlice';
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";
import { useTranslation } from 'react-i18next';

import { clearFactors } from '../../redux/features/Factors/factorSlice';

//接口


type Props = {};


const BacktestForm = (props: Props) => {

    // spec 依赖 parquet 数据的日期范围，拿到范围之前为 null
    const [spec, setSpec] = useState<StrategySpecV0 | null>(null);
    const [dataRange, setDataRange] = useState<BacktestDataRange | null>(null);
    const [dataRangeError, setDataRangeError] = useState<string | null>(null);
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
    const {t} = useTranslation()

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const selectedFactors = useSelector((s: RootState) => s.factor.selectedFactors);
    const [localFactors, setlocalFactors] = useState(selectedFactors);

    // 进入页面先读取回测数据的可用日期范围，再用它生成默认 spec
    useEffect(() => {
        let active = true;

        getBacktestDataRange()
            .then((range) => {
                if (!active) return;
                setDataRange(range);
                setSpec(makeDefaultStrategySpecV0(range));
            })
            .catch((error: unknown) => {
                if (!active) return;
                setDataRangeError(
                    error instanceof Error ? error.message : t("console.timeRange.loadFailedUnknown")
                );
            });

        return () => {
            active = false;
        };
    }, []);

    // 子组件拿到的 setSpec 仍然是非空类型；spec 还没初始化时忽略更新
    const updateSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>> = (update) => {
        setSpec((previous) => {
            if (!previous) return previous;
            return typeof update === "function" ? update(previous) : update;
        });
    };
    
    const buildSpecForSubmit = (spec: StrategySpecV0): StrategySpecV0 => {
                console.log("selectedFactors from redux 来自Redux=", JSON.stringify(localFactors, null, 2));
                const inputs = localFactors.map(f => ({
                    codeKey: f.code_key ?? "", 
                    factor:f.name ?? "",         // 或者你用 code_key / id，当后端需要唯一key时更稳
                    weight: f.weight ?? 0,
                })).filter(x => x.codeKey.length > 0);

                return {
                    ...spec,
                    signal: {
                    ...spec.signal,
                    inputs,
                    },
                };
                };

        // useEffect(() => {
        // if (selectedFactors.length > 0) {
        //     setlocalFactors([...selectedFactors]); // 复制一份到本地
        //     dispatch(clearFactors());             // 然后清空 redux
        // }
        // }, [selectedFactors, dispatch]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spec) return;
        setIsBacktesting(true);
        //先确保提交成功 //提交滑动因子
        const finalSpec = buildSpecForSubmit(spec);
        console.log("finalSpec 检查一下提交的是啥", JSON.stringify(finalSpec, null, 2));
        

    try { const res = await createBacktest(finalSpec)
              e.preventDefault
                //setIsBacktesting(false);
                if (res.taskId) {
                    dispatch(setCurrentTaskId(res.taskId)); // 把 taskId 存到 Redux 里
                    toast.success(t("console.toast.submitted"));
                    console.log("返回的东西是啥createBacktest response", JSON.stringify(res, null, 2));
                    navigate(`/backtests/${res.taskId}`);
                  //  navigate(`/report/${res.taskId}`);
                 }
                else 
            {
            toast.error(res.errorMessage || t("console.toast.createFailed"));
             }
         }catch(error:any) {
                toast.error(t("console.toast.createFailedWithReason", { reason: error.message }));
            } finally {
                setIsBacktesting(false);
            };
        };

    if (dataRangeError) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {t("console.timeRange.loadFailed", { reason: dataRangeError })}
            </div>
        );
    }

    if (!spec || !dataRange) {
        return (
            <div className="max-w-3xl mx-auto mt-10 p-6 flex items-center justify-center gap-3 text-gray-600">
                <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                {t("console.timeRange.loading")}
            </div>
        );
    }

    return (
            <div className="max-w-6xl mx-auto p-1 rounded-2xl bg-gradient-to-br from-gray-600 via-slate-700 to-blue-800">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-300 pt-5">
                    {t("Backtest_Console")}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1) 顶部：SignalSection 居中 */}
                <div className="flex justify-center">
                    <div className="w-full">
                    <SignalSection spec={spec} setSpec={updateSpec} />
                    </div>
                </div>

                {/* 2) 下方：四块“田字”布局 */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="w-full">
                    <RiskSection spec={spec} setSpec={updateSpec} />                    
                    </div>
                    <div className="w-full">
                    <PortfolioSection spec={spec} setSpec={updateSpec} />
                    </div>
                    <div className="w-full">
                    <ExecuteSection spec={spec} setSpec={updateSpec} />
                    </div>
                    <div className="w-full">
                    <TimeRangeSection spec={spec} setSpec={updateSpec} dataRange={dataRange} />
                    </div>
                    <div className="w-full">
                    <RebalanceSection spec={spec} setSpec={updateSpec} />
                    </div>
                </div>

                {/* 3) 按钮：单独一行居中 */}
                <div className="flex justify-center border-t border-white/10 pt-8 pb-10">
                    <button
                        type="submit"
                        disabled={isBacktesting}
                        className="inline-flex items-center justify-center gap-2 min-w-[14rem] px-8 py-3 rounded-xl bg-amber-400 text-slate-900 text-lg font-semibold shadow-lg shadow-black/20 transition hover:bg-amber-300 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-amber-400"
                    >
                        {isBacktesting ? (
                            <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
                            </svg>
                        )}
                        {isBacktesting ? t("console.submitting") : t("Start_Backtest")}
                    </button>
                </div>
                </form>
            </div>
    )

};

export default BacktestForm;















///旧的界面
// const Console = (props: Props) => {

//     const [name, setname] = useState<string>('');
//     const [universe,setuniverse] = useState<string>('');
//     const [dataVersion,setdataVersion] = useState<string>('');

//     //调仓协议
//     const [rebalanceFreq, setRebalanceFreq] = useState<string>('M'); //选周还是月
//     const [holidayPolicy, setHolidayPolicy] = useState<string>('skip'); //三选一


//     //因子权重
//     //参考之前的因子权重设定FactorAdjuster组件，或者直接在这里设定几个输入框让用户输入权重


//     //信号类型 //选线性模型，还是别的模型
//     const [signalType,setSignalType] = useState<string>('linear_weight'); //选多空，还是多头，还是空头
//     const [inputs,setInputs] = useState<string>(''); //输入因子列表，逗号分隔
//     const [lookback,setLookback] = useState<number>(60); //选回看期
//     const [lag,setlag] = useState<number>(1); //选滞后期


//     //模型选择
//     const [topk,setTopk] = useState<number>(10); //选前多少只股票
//     const [weightSpec,setWeightSpec] = useState<string>('equal'); //线性模型的权重
//     const [initalCash,setInitialCash] = useState<number>(1000000); //选初始资金
//     const [targetCashWeight,setTargetCashWeight] = useState<number>(0.1); //选目标现金权重
//     //注意现金的比例

//     //模型权重
//     const [weight,setWeight] = useState<number>(0.5); //线性模型的权重

//     //回测时间与日历设置
//     const [start,setStart] = useState<string>('2020-08-10'); //看看怎么选择日期，直接输入还是选日期组件
//     const [end,setEnd] = useState<string>('2024-06-30');
//     const [calendar,setCalendar] = useState<string>('XNYS'); //选交易日历

//     //执行
//     const [PriceType,setPriceType] = useState<string>('close'); //选价格类型
//     const [commission,setCommission] = useState<number>(0.1); //选佣金
//     const [slippageBps,setSlippageBps] = useState<number>(0.05); //选滑点
//     const [allowShort,setAllowShort] = useState<boolean>(true); //选是否允许做空


//     //风险管理
//     const [maxDrawdown,setMaxDrawdown] = useState<number>(0.2); //选最大回撤
//     const [maxPositionPerStock,setMaxPositionPerStock] = useState<number>(0.1); //选单只股票最大仓位
//     const [maxTurnover,setMaxTurnover] = useState<number>(0.3); //选最大换手率
//     const [maxLeverage,setMaxLeverage] = useState<number>(2); //选最大杠杆
//     const [volTarget,setVolTarget] = useState<number>(0.1); //选波动率目标

//     //参考标准
//     const [benchmark,setBenchmark] = useState<string>('SPY'); //选基准


//     //是否开始回测
//     const [isBacktesting, setIsBacktesting] = useState(false);

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsBacktesting(true);

// };



// }