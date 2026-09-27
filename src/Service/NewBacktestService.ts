import axios from 'axios';
import {handleError} from '../Helpers/ErrorHandler';
import type { StrategySpecV0 } from "../Models/strategySpecV0";
// import type { OutputMetric } from '../Models/strategySpecV0';
// import type { OutputSpec } from '../Models/strategySpecV0';


/** 后端若是 CreateBacktestRequest { strategySpec: StrategySpecV0 } */
export interface CreateBacktestRequest {
  strategySpec: StrategySpecV0;
}


const api = `${import.meta.env.VITE_API_BASE}/api/backtests`;

/**
 * 创建回测任务
 * @param spec StrategySpecV0（前端表单 state）
 */
export const createBacktest = async (spec: StrategySpecV0) => {
  try {
    // 常见：后端收 { strategySpec: spec }
    const payload: CreateBacktestRequest = { strategySpec: spec };
    console.log("payload 检查一下提交的是啥", JSON.stringify(payload, null, 2));
    const response = await axios.post(api, payload);

    return response.data as CreateBacktestResponse;
  } catch (error) {
    handleError(error);
  }
};

/** 创建任务成功返回的东西*/ 
export interface CreateBacktestResponse {
  taskId: string;
  status: string;
  resultUrl?: string;
  errorMessage?: string;
  isDuplicate: boolean;
}


export const getBacktestResult = async (taskId: string): Promise<BacktestResultResponse> => {
  try {
    const response = await axios.get(`${api}/${taskId}`);
    return response.data as BacktestResultResponse;
  } catch (error) {
    handleError(error);
    return {
      status: "FAILED",
      errorMessage: "获取回测结果失败",
    };
  }
}

export const deleteBacktest = async (taskId: string): Promise<void> => {
  try {
    await axios.delete(`${api}/${taskId}`);
  } catch (error) {
    handleError(error);
  }
};


export interface BacktestResultResponse {
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  errorMessage?: string;
  resultJson?: string;
}

/////parse 出来的真正结果，接口统一放在 Models/BacktestResult 里，这里转出一份保持原有 import 可用
export type {
  BacktestResult,
  Metrics,
  Sharpe,
  Returns,
  MaxDrawdown,
  EquityCurve,
  RawSpec,
  Signal,
  SignalInput,
  Execute,
  Portfolio,
  Rebalance,
  TimeRange,
  RiskManagement,
} from "../Models/BacktestResult";
