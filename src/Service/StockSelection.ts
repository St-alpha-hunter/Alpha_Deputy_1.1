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

export const StockSelectionForm = async (data: StockSelectionModel) => {
  try {
    const response = await axios.post(api, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export { StockSelectionModel };