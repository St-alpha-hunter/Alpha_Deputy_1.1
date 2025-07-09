import { useEffect, useState } from "react";
import type { CompanyTenK } from "../../company";
import { getCompData, getTenk } from "../../api";
import TenKFindItem from "./TenkFindItem/TenkFindItem";
import Spinner from "../Spinners/Spinner";

type Props = {
  ticker: string;
};

const TenKFind = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<CompanyTenK[]>();

  useEffect(() => {
    
    const getTenKData = async () => {
      try {
        const companyInfo = await getCompData(ticker); // 假设这个返回了包含cik字段的公司信息
        console.log("获取的公司数据: ", companyInfo); 
        const cik = companyInfo?.[0]?.cik;
        if (!cik) {
          console.error("CIK not found for ticker", ticker);
          return;
        }


      const from = "2024-01-01";
      const to = "2024-07-01";

      console.log("请求参数:", {
        cik,
        from,
        to,
        page: 0,
        limit: 100,
      });

        const value = await getTenk({
          cik,
          from:"2024-01-01",
          to:"2024-07-01",
          page:0,
          limit:100
      });
      setCompanyData(value);
      } catch (error) {
         console.error("Error loading TenK data:", error);
      }
    };

    getTenKData();
  }, [ticker]);

  return (
    <div className="inline-flex rounded-md shadow-sm m-4" role="group">
      {companyData ? (
        companyData?.slice(0, 5).map((tenK) => {
          return <TenKFindItem tenk={tenK} />;
        })
      ) : (
        <Spinner />
      )}
    </div>
    
  );
};

export default TenKFind;