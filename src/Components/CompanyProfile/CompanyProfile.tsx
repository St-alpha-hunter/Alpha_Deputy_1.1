import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { CompanyKeyMetrics } from "../../company";
import { getCompanyKeyMetrics } from "../../api";
import RatioList from "../RatioList/RatioList";
import Spinner from "../Spinners/Spinner";
import {
  formatLargeNonMonetaryNumber,
  formatRatio,
} from "../../Helpers/NumberFormatting";
import StockComment from "../StockComment/StockComment";

type Props = {};

const tableConfig = [
  {
    Label: "Market Cap",
    render: (company: CompanyKeyMetrics) =>
      formatLargeNonMonetaryNumber(company.marketCap),
    subTitle: "Total value of all a company's shares of stock",
  },
  {
    Label: "Current Ratio",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.currentRatio),
    subTitle:
      "Measures the companies ability to pay short term debt obligations",
  },
  {
    Label: "Return On Equity",
    render: (company: CompanyKeyMetrics) => formatRatio(company.returnOnEquity),
    subTitle:
      "Return on equity is the measure of a company's net income divided by its shareholder's equity",
  },
  {
    Label: "Return On Assets",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.returnOnTangibleAssets),
    subTitle:
      "Return on assets is the measure of how effective a company is using its assets",
  },
  {
    Label: "Free Cashflow Per Share",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.freeCashFlowToEquity),
    subTitle:
      "Return on assets is the measure of how effective a company is using its assets",
  },
  {
    Label: "Capex Per Share TTM",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.capexPerShare),
    subTitle:
      "Capex is used by a company to aquire, upgrade, and maintain physical assets",
  },
  {
    Label: "Graham Number",
    render: (company: CompanyKeyMetrics) =>
      formatRatio(company.grahamNumber),
    subTitle:
      "This is the upperbouind of the price range that a defensive investor should pay for a stock",
  }
];

const CompanyProfile = (props: Props) => {
  const ticker = useOutletContext<string>();
  const [companyData, setCompanyData] = useState<CompanyKeyMetrics|null >();
  
  useEffect(() => {
  console.log("📊 companyData 更新了：", companyData);
}, [companyData]);
  
  useEffect(() => {
    console.log("🐛 ticker 是：", ticker);
  }, [ticker]);
  
  useEffect(() => {
    const getCompanyKeyRatios = async () => {
      const value = await getCompanyKeyMetrics(ticker);
      setCompanyData(value.length > 0 ? value[0]:null);
    };
    getCompanyKeyRatios();
  }, [ticker]);
  
  return (
    <>
      {companyData ? (
        <>
          <RatioList config={tableConfig} data={companyData} />
          <StockComment stockSymbol={ticker} />
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default CompanyProfile;