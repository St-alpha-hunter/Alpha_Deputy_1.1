import axios from "axios";
import type { FactorGet } from "../Models/Factor";
import { handleError } from "../Helpers/ErrorHandler";

const api = "http://localhost:5213/api/factor";

export const getFactors = async (name: string, category: string, computeCode: string) => {
  try {
    const params: { [key: string]: string } = {};
    if (name) params.name = name;
    if (category) params.category = category;
    if (computeCode) params.computeCode = computeCode;

    const response = await axios.get<FactorGet[]>(api, { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}