import axios from "axios";
import type { FactorGet } from "../Models/Factor";
import { handleError } from "../Helpers/ErrorHandler";
import { mapFactorFromApi } from "../Models/Factor";


//const apiBase = import.meta.env.VITE_API_BASE;
const baseApi = `${import.meta.env.VITE_API_BASE}/api/factor`;

export const getFactors = async (category?: string) => {
  try {
    let url = baseApi
    let params = {};
    if (category) {
      url = `${baseApi}/GetByCategory`;
      params = { category };
    }

    const response = await axios.get<FactorGet[]>(url, { params });
    return response.data.map(mapFactorFromApi);
  } catch (error) {
    handleError(error);
    return[]
  }
}