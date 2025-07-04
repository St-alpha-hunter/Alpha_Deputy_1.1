import axios from "axios";
import type { AxiosError } from "axios";
import type {CompanyBalanceSheet, CompanyIncomeStatement, CompanyKeyMetrics, CompanyProfile, CompanySearch } from "./company";

interface SearchResponse {
    data: CompanySearch[];
}

export const searchCompanies = async (query: string) => {
  try {
    const data = await axios.get<SearchResponse>(
     `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&exchange=NASDAQ&apikey=${import.meta.env.VITE_API_KEY}`
    );
    return data;
  } catch (error) {
    if ((axios as AxiosError).isAxiosError(error)) {
        const err = error as any
        //增加断言进行保护
      console.log("error message: ", err.message);
      return err.message;
    } else {
      console.log("unexpected error: ", error);
      return "An expected error has occured.";
    }
  }
};

export const getCompanyProfile = async (query: string) => {
  try {
    const data = await axios.get<CompanyProfile[]>(
      `https://financialmodelingprep.com/api/v3/profile/${query}?apikey=${import.meta.env.VITE_API_KEY}`
    );
    return data;
  } catch (error: any) {
    console.log("error message: ", error.message);
  }
};


export const getCompanyKeyMetrics = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyKeyMetrics[]>(
      "https://financialmodelingprep.com/api/v3/profile",
      {
        params: {
          symbol,                                    // 等价于 symbol: symbol
          apikey: import.meta.env.VITE_API_KEY,
        },
      }
    );
    return data;
  } catch (err: any) {
    console.error("error message:", err.message);
    throw err;                                     // 往上抛，方便页面统一处理
  }
};


export const getIncomeStatement = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyIncomeStatement[]>(
      "https://financialmodelingprep.com/stable/income-statement",
      {
        params: {
          symbol,                                    // 等价于 symbol: symbol
          apikey: import.meta.env.VITE_API_KEY,
        },
      }
    );
    return data;
  } catch (err: any) {
    console.error("error message:", err.message);
    throw err;                                     // 往上抛，方便页面统一处理
  }
};


export const getBalanceSheet = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyBalanceSheet[]>(
      "https://financialmodelingprep.com/stable/balance-sheet-statement?",
      {
        params: {
          symbol,                                    // 等价于 symbol: symbol
          apikey: import.meta.env.VITE_API_KEY,
        },
      }
    );
    return data;
  } catch (err: any) {
    console.error("error message:", err.message);
    throw err;                                     // 往上抛，方便页面统一处理
  }
};