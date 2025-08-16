import axios from "axios";
import type { AxiosError } from "axios";
import type {
  CompanyBalanceSheet, 
  CompanyIncomeStatement, 
  CompanyKeyMetrics, 
  CompanyProfile, 
  CompanySearch, 
  CompanyCashFlow, 
  CompanyCompData, 
  CompanyTenK
} from "./company";

interface SearchResponse {
    data: CompanySearch[];
}


//搜索公司
//确认无误
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
      "https://financialmodelingprep.com/stable/key-metrics",
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


//获得公司的损益表
export const getIncomeStatement = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyIncomeStatement[]>(
      `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?apikey=${import.meta.env.VITE_API_KEY}`
    );
    return data;
  } catch (err: any) {
    console.error("error message:", err.message);
    throw err;
  }
};


//获得公司的资产负债表
export const getBalanceSheet = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyBalanceSheet[]>(
      "https://financialmodelingprep.com/stable/balance-sheet-statement",
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

//获得公司的现金流量表
export const getCashFlow = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyCashFlow[]>(
      "https://financialmodelingprep.com/stable/cash-flow-statement",
      {
        params: {
          symbol,
          apikey: import.meta.env.VITE_API_KEY,
        },
      }
    );
    return data;
  } catch (error:any) {
    console.error("error message:", error.message);
    throw error;  
  }
};

//查询公司基本资料
export const getCompData = async (symbol: string) => {
  try {
    const { data } = await axios.get<CompanyCompData[]>(
      "https://financialmodelingprep.com/stable/profile",
      {
        params: {
          symbol,
          apikey: import.meta.env.VITE_API_KEY,
        },
      }
    );
    return data;
  } catch (error:any) {
    console.error("error message:", error.message);
    throw error;  
  }
};


 interface TenKParams {
  cik?: string;
  symbol?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}


//查年报（10-K）的 API
export const getTenk = async ({
  cik,
  from,
  to,
  page,
  limit
}: TenKParams) => {
  try {
    const { data } = await axios.get<CompanyTenK[]>(
      "https://financialmodelingprep.com/stable/sec-filings-search/cik",
      {
        params: {
          cik,
          from,
          to,
          page,
          limit,
          apikey: import.meta.env.VITE_API_KEY
        },
      }
    );
    return data;
  } catch (error:any) {
    if (error.response?.status === 404) {
      console.warn("该公司在指定时间段内没有任何 SEC 报告");
      return []; // 返回空数组表示无数据
  }
      console.error("error message:", error.message);
      throw error;
  }
};


