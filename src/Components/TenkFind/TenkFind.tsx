import { useEffect, useState } from "react";
import type { CompanyTenK } from "../../company";
import { getTenk } from "../../api";
import TenKFindItem from "./TenkFindItem/TenkFindItem";
import Spinner from "../Spinners/Spinner";

type Props = {
  ticker: string;
};

const TenKFind = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<CompanyTenK[]>();

  useEffect(() => {
    const getTenKData = async () => {
      const value = await getTenk({
        cik:ticker,
        from:"2025-01-01",
        to:new Date().toISOString().slice(0, 10),
        page:0,
        limit:100
      });
      setCompanyData(value);
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