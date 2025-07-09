import { useEffect, useState } from "react";
import CompFinderItem from "./CompFinderitem/CompFinderitem";
import type { CompanyCompData } from "../../company";
import { getCompData } from "../../api";
import Spinner from "../Spinners/Spinner";
type Props = {
  ticker: string;
};

const CompFinder = ({ ticker }: Props) => {
  const [companyData, setCompanyData] = useState<CompanyCompData>();
  useEffect(() => {
    const getComps = async () => {
      const value = await getCompData(ticker);

      //console.log("API 响应：", value); 
      //console.log("提取的公司数据：", value?.[0]);

      setCompanyData(value?.[0]);
    };
    getComps();
  }, [ticker]);
  return (
    <div className="inline-flex rounded-md shadow-sm m-4" role="group">
      {companyData ? (
        [companyData]?.map((ticker) => {
          return <CompFinderItem key={ticker.symbol} ticker={ticker.symbol} />;
        })
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default CompFinder;