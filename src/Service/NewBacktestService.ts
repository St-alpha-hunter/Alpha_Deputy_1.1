import axios from 'axios';
import {handleError} from '../Helpers/ErrorHandler';
import type { StrategySpecV0 } from "../Models/strategySpecV0";
import type { OutputMetric } from '../Models/strategySpecV0';
import type { OutputSpec } from '../Models/strategySpecV0';


/** 后端若是 CreateBacktestRequest { strategySpec: StrategySpecV0 } */
export interface CreateBacktestRequest {
  strategySpec: StrategySpecV0;
}

/** 你先宽松一点，等后端返回结构定了再收紧 */ 
export interface CreateBacktestResponse {
  taskId: string;
  errorMessage?: string;
  resultUrl?: string;
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