import { useEffect, useState } from "react";
import type { CompanyBalanceSheet } from "../../company";
import { useOutletContext } from "react-router-dom";
import RatioList from "../RatioList/RatioList";
import { getBalanceSheet } from "../../api";
import Table from "../Table/Table"
import Spinner from "../Spinners/Spinner";
import {
  formatLargeMonetaryNumber,
  formatLargeNonMonetaryNumber,
} from "../../Helpers/NumberFormatting";
import mockBalanceSheetData from "./balanceSheetMock";


type Props = {};

const config = [
  {
    Label: "Total Assets",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalAssets),
  },
  {
    Label: "Current Assets",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalCurrentAssets),
  },
  {
    Label: "Total Cash",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.cashAndCashEquivalents),
  },
  {
    Label: "Property & equipment",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.propertyPlantEquipmentNet),
  },
  {
    Label: "Intangible Assets",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.intangibleAssets),
  },
  {
    Label: "Long Term Debt",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.longTermDebt),
  },
  {
    Label: "Total Debt",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.otherCurrentLiabilities),
  },
  {
    Label: "Total Liabilites",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalLiabilities),
  },
  {
    Label: "Current Liabilities",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalCurrentLiabilities),
  },
  {
    Label: "Long-Term Income Taxes",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.otherLiabilities),
  },
  {
    Label: "Stakeholder's Equity",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.commonStock),
  },
  {
    Label: "Retained Earnings",
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.retainedEarnings),
  },
];

const BalanceSheet = (props: Props) => {
  const ticker = useOutletContext<string>();
  const [companyData, setCompanyData] = useState<CompanyBalanceSheet|null>();
  useEffect(() => {
    const getCompanyData = async () => {
    const value = await getBalanceSheet(ticker!);
    console.log("companyData是对象吗", companyData)
    console.log("Balance Sheet 返回的数据:", value);
    setCompanyData(value.length > 0 ? value[0]:null);
    };
   getCompanyData();
  }, []);
  return (
    <>
      {companyData ? (
        <RatioList config={config} data={companyData} />
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default BalanceSheet;