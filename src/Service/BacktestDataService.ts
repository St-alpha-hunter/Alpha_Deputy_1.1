import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";

const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export interface BacktestDataRange {
  minDate: string;
  maxDate: string;
  rawMaxDate: string;
  fileCount: number;
}

export const getBacktestDataRange = async (): Promise<BacktestDataRange> => {
  try {
    const response = await axios.get<BacktestDataRange>(
      `${apiBase}/api/backtests/data-range`
    );
    const range = response.data;

    if (!range?.minDate || !range?.maxDate) {
      throw new Error("服务器返回的回测数据范围为空");
    }

    return range;
  } catch (error) {
    handleError(error);
    throw error;
  }
};
