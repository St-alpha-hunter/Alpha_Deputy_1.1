import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";

class StockSelectionModel {
  numberOfStocks: number;
  selectedIndustries: string[];
  maxIndustryExposure: number;
  session_id: string;

  constructor(
    numberOfStocks: number,
    selectedIndustries: string[],
    maxIndustryExposure: number,
    session_id: string
  ) {
    this.numberOfStocks = numberOfStocks;
    this.selectedIndustries = selectedIndustries;
    this.maxIndustryExposure = maxIndustryExposure;
    this.session_id = session_id;
  }
}

class FixParams {
  session_id: string;
  start: string;
  end: string;


  constructor(session_id: string, start: string, end: string) {
    this.session_id = session_id;
    this.start = start;
    this.end = end;
  }
}

export interface StockSelectionResponse {
  selected_stocks: string[];
}



//const ziplineBase = import.meta.env.VITE_ZIPLINE_BASE; // 例如 "http://localhost:8000"

const api = `${import.meta.env.VITE_ZIPLINE_BASE}/stock_selection`;
const computeApi = `${import.meta.env.VITE_ZIPLINE_BASE}/compute_factors_select_stocks`;

export const StockSelectionForm = async (data: StockSelectionModel, fixParams: FixParams): Promise<StockSelectionResponse | undefined> => {
  try {
    await axios.post(api,data, { params: { 'session_id': data.session_id } });
    const computeReq = {...fixParams};
    const response = await axios.post(computeApi, computeReq, { params: { 'session_id': fixParams.session_id } });
    return response.data as StockSelectionResponse;
  } catch (error) {
    handleError(error);
  }
};

export { StockSelectionModel, FixParams };

///干脆两个直接整成一个好了

//     await axios.post(api, data, { params: { session_id: fixParams.session_id } });
//     const computeReq = { ...fixParams };
//     const response = await axios.post(computeApi, computeReq);
//     return response.data;

// handleError(error);