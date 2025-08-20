import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";

class StockSelectionModel {
  numberOfStocks: number;
  selectedIndustries: string[];
  maxIndustryExposure: number;

  constructor(
    numberOfStocks: number,
    selectedIndustries: string[],
    maxIndustryExposure: number
  ) {
    this.numberOfStocks = numberOfStocks;
    this.selectedIndustries = selectedIndustries;
    this.maxIndustryExposure = maxIndustryExposure;
  }
}

const api = "http://localhost:8000/stock_selection";
const computeApi = "http://localhost:8000/compute_factors_select_stocks";

export const StockSelectionForm = async (data: StockSelectionModel, session_id: string, start: string, end: string) => {
  try {
    await axios.post(api, data, { params: { session_id } });
    const computeReq = { session_id, start, end };
    const response = await axios.post(computeApi, computeReq);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export { StockSelectionModel };