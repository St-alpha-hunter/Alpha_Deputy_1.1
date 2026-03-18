import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { makeDefaultStrategySpecV0, type StrategySpecV0 } from '../../Models/strategySpecV0';


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

import { clearFactors } from '../../redux/features/Factors/factorSlice';

//接口


type Props = {};


const BacktestForm = (props: Props) => {

    const [spec, setSpec] = useState<StrategySpecV0>(makeDefaultStrategySpecV0());
    const [isBacktesting, setIsBacktesting] = useState(false);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
    

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const selectedFactors = useSelector((s: RootState) => s.factor.selectedFactors);
    const [localFactors, setlocalFactors] = useState(selectedFactors);
    
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

        useEffect(() => {
        if (selectedFactors.length > 0) {
            setlocalFactors([...selectedFactors]); // 复制一份到本地
            dispatch(clearFactors());             // 然后清空 redux
        }
        }, [selectedFactors, dispatch]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBacktesting(true);
        //先确保提交成功 //提交滑动因子
        const finalSpec = buildSpecForSubmit(spec);
        console.log("finalSpec 检查一下提交的是啥", JSON.stringify(finalSpec, null, 2));
        

    try { const res = await createBacktest(finalSpec)
              e.preventDefault
                //setIsBacktesting(false);
                if (res.taskId) {
                    dispatch(setCurrentTaskId(res.taskId)); // 把 taskId 存到 Redux 里
                    toast.success("回测请求提交成功，正在回测中...");
                    console.log("返回的东西是啥createBacktest response", JSON.stringify(res, null, 2));
                    navigate(`/backtests/${res.taskId}`);
                  //  navigate(`/report/${res.taskId}`);
                 }
                else 
            {
            toast.error(res.errorMessage || "回测任务创建失败，请检查参数");
             }
         }catch(error:any) {
                toast.error("回测任务创建失败: " + error.message);
            } finally {
                setIsBacktesting(false);
            };
        };

    return (
            <div className="max-w-6xl mx-auto p-1 rounded-2xl bg-gradient-to-br from-gray-600 via-slate-700 to-blue-800">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-300 pt-5">
                    回测参数设定 Backtest Console
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1) 顶部：SignalSection 居中 */}
                <div className="flex justify-center">
                    <div className="w-full">
                    <SignalSection spec={spec} setSpec={setSpec} />
                    </div>
                </div>

                {/* 2) 下方：四块“田字”布局 */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="w-full">
                    <RiskSection spec={spec} setSpec={setSpec} />                    
                    </div>
                    <div className="w-full">
                    <PortfolioSection spec={spec} setSpec={setSpec} />
                    </div>
                    <div className="w-full">
                    <ExecuteSection spec={spec} setSpec={setSpec} />
                    </div>
                    <div className="w-full">
                    <TimeRangeSection spec={spec} setSpec={setSpec} />
                    </div>
                    <div className="w-full mb-10">
                    <RebalanceSection spec={spec} setSpec={setSpec} />
                    </div>
                                    {/* 3) 按钮 */}
                    <div className="flex justify-center pt-10">
                        <button
                            type="submit"
                            className="bg-red-500 text-white font-bold rounded-lg w-80 h-20 border-b border-white pb-4 mb-8 "
                        >
                            开始回测 Start Backtest
                        </button>
                    </div>
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