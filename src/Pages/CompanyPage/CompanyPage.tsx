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
import StockPriceChart from "../../Components/StockPriceChart/StockPriceChart";   // [股价走势 2026-10-16]
import { useTranslation } from 'react-i18next';

interface Props {}

const CompanyPage = (props: Props) => {
 
  let { ticker } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const getProfileInit = async() => {
      const result = await getCompanyProfile(ticker!);
      console.log("✅ result from API", result);
      setCompany(result?.data[0] ?? null);
    }
    getProfileInit();
    // [股价走势 2026-10-16] 原来依赖数组是 []：在公司页里直接换到另一只股票（URL 的 ticker 变了）时不会重新加载。
    // 加上 ticker，换股票就会重新请求公司资料
  }, [ticker])

return (
  company ? (
    <div className="w-full relative flex ct-docs-disable-sidebar-content overflow-x-hidden">
      <Sidebar />
      <CompanyDashboard ticker={ticker!}>
        <Tile title={t('company.companyName')} subTitle={company.companyName || t('common.na')} />
        <Tile
          title={t('company.price')}
          subTitle={company.price != null ? `$${company.price.toFixed(2)}` : t('common.na')}
        />
        <Tile
          title={t('company.dcf')}
          subTitle={company.dcf != null ? `$${company.dcf.toFixed(2)}` : t('common.na')}
        />
        <Tile title={t('company.sector')} subTitle={company.sector || t('common.na')} />
        {/* [股价走势 2026-10-16] 信息卡片下面、10-K 上面；w-full 占满一行，px-4 和上面的卡片对齐 */}
        <div className="w-full px-4 mt-6">
          <StockPriceChart symbol={company.symbol} />
        </div>
        <CompanyFind ticker={company.symbol} />
        <TenkFind ticker={company.symbol} />
        <p className="bg-white shadow rounded text-medium font-medium text-gray-900 p-3 mt-1 m-4">
          {company.description || t('company.noDescription')}
        </p>
      </CompanyDashboard>
    </div>
  ) : (
    <Spinner />
  )
);
 
  };

export default CompanyPage;
