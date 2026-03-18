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
import { useTranslation } from 'react-i18next';

type Props = {};



const BalanceSheet = (props: Props) => {
  const { t } = useTranslation();
  const config = [
  {
    Label: t("totalAssets"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalAssets),
  },
  {
    Label: t("currentAssets"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalCurrentAssets),
  },
  {
    Label: t("totalCash"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.cashAndCashEquivalents),
  },
  {
    Label: t("property&Equipment"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.propertyPlantEquipmentNet),
  },
  {
    Label: t("intangibleAssets"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.intangibleAssets),
  },
  {
    Label: t("longtermdebt"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.longTermDebt),
  },
  {
    Label: t("totalDebt"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.otherCurrentLiabilities),
  },
  {
    Label: t("totalLiabilities"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalLiabilities),
  },
  {
    Label: t("currentLiabilities"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.totalCurrentLiabilities),
  },
  {
    Label: t("longtermIncomeTaxes"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.otherLiabilities),
  },
  {
    Label: t("stakeholdersEquity"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.commonStock),
  },
  {
    Label: t("retainedEarnings"),
    render: (company: CompanyBalanceSheet) =>
      formatLargeMonetaryNumber(company.retainedEarnings),
  },
];

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