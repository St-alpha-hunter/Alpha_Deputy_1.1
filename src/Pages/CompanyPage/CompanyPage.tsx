import { useParams } from "react-router-dom";
import type { CompanyProfile } from "../../company";
import { useEffect, useState } from "react";
import { getCompanyProfile } from "../../api";

//import RatioList from "../../Components/RatioList/RatioList";
{/*
import {
  formatLargeNonMonetaryNumber,
  formatRatio,
} from "../../Helpers/NumberFormatting";

import StockComment from "../../Components/StockComment/StockComment";
*/}

import Spinner from "../../Components/Spinners/Spinner"
import CompanyDashboard from "../../Components/CompanyDashboard/CompanyDashboard";
import Tile from "../../Components/Tile/Tile"
import CompanyFind from "../../Components/CompanyFind/CompanyFind";
import TenkFind from "../../Components/TenkFind/TenkFind";
import Sidebar from "../../Components/Sidebar/Sidebar";

interface Props {}

const CompanyPage = (props: Props) => {
 
  let { ticker } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    const getProfileInit = async() => {
      const result = await getCompanyProfile(ticker!);
      console.log("✅ result from API", result);
      setCompany(result?.data[0] ?? null);
    }
    getProfileInit();
  }, [])

return (
  company ? (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden">
      <Sidebar />
      <CompanyDashboard ticker={ticker!}>
        <Tile title="Company Name" subTitle={company.companyName || "N/A"} />
        <Tile
          title="Price"
          subTitle={company.price != null ? `$${company.price.toFixed(2)}` : "N/A"}
        />
        <Tile
          title="DCF"
          subTitle={company.dcf != null ? `$${company.dcf.toFixed(2)}` : "N/A"}
        />
        <Tile title="Sector" subTitle={company.sector || "N/A"} />
        <CompanyFind ticker={company.symbol} />
        <TenkFind ticker={company.symbol} />
        <p className="bg-white shadow rounded text-medium font-medium text-gray-900 p-3 mt-1 m-4">
          {company.description || "No description available."}
        </p>
      </CompanyDashboard>
    </div>
  ) : (
    <Spinner />
  )
);
 
  };

export default CompanyPage;
