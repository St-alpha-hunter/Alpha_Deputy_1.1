import axios from 'axios';
import {handleError} from '../Helpers/ErrorHandler';
import type { StrategySpecV0 } from "../Models/strategySpecV0";
import type { OutputMetric } from '../Models/strategySpecV0';
import type { OutputSpec } from '../Models/strategySpecV0';


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

/////再往下的都是parse出来的真正结果了
export interface BacktestResult {
  message: string
  success: boolean
  tradeList: any[]
  metrics: Metrics
  rawSpec: RawSpec
}

export interface Metrics {
  "sharpe 夏普比率": Sharpe
  "returns 累计收益率": Returns
  "maxDrawdown 最大回撤": MaxDrawdown
}

export interface Sharpe {
  sharperatio: number
}

export interface Returns {
  ravg: number
  rtot: number
  rnorm: number
  rnorm100: number
}

export interface MaxDrawdown {
  len: number
  drawdown: number
  moneydown: number
  max: {
    len: number
    drawdown: number
    moneydown: number
  }
}

export interface RawSpec {
  name: string
  universe: string
  dataVersion: string
  signal: Signal
  execute: Execute
  portfolio: Portfolio
  rebalance: Rebalance
  timeRange: TimeRange
  riskManagement: RiskManagement
}

export interface Signal {
  lag: number
  type: number
  lookback: number
  inputs: SignalInput[]
}

export interface SignalInput {
  factor: string
  weight: number
  codeKey: string
}

export interface Execute {
  priceType: number
  allowShort: boolean
  slippageBps: number
  commissionBps: number
}


export interface Portfolio {
  selector: {
    k: number
    type: number
  }
  weighting: {
    type: number
  }
  initialCash: number
  targetCashWeight: number
}

export interface Rebalance {
  freq: number
  dayOfWeek: number | null
  dayOfMonth: number
  holidayPolicy: number
}

export interface TimeRange {
  startDate: string
  endDate: string
  calendar: string
}

export interface RiskManagement {
  volTarget: number
  maxDrawdown: number
  maxLeverage: number
  maxTurnover: number
  maxPositionWeight: number
}


