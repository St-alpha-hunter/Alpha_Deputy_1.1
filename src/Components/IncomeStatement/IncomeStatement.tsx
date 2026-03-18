import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Table from "../Table/Table";
import type { CompanyIncomeStatement } from "../../company";
import { getIncomeStatement } from "../../api";
import Spinner from "../Spinners/Spinner";
import {
  formatLargeMonetaryNumber,
  formatRatio,
} from "../../Helpers/NumberFormatting";
import { useTranslation } from 'react-i18next';

type Props = {};



const IncomeStatement = (props: Props) => {

  const { t } = useTranslation();
const configs = [

 
  {
    label: t("date"),
    render: (company: CompanyIncomeStatement) => company.date,
  },
  {
    label: t("revenue"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.revenue),
  },
  {
    label: t("costOfRevenue"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.costOfRevenue),
  },
  {
    label: t("depreciation"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.depreciationAndAmortization),
  },
  {
    label: t("operatingIncome"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.operatingIncome),
  },
  {
    label: t("incomebeforeTax"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.incomeBeforeTax),
  },
  {
    label: t("netIncome"),
    render: (company: CompanyIncomeStatement) =>
      formatLargeMonetaryNumber(company.netIncome),
  },
  {
    label: t("netIncomeRatio"),
    render: (company: CompanyIncomeStatement) =>
      formatRatio(company.netIncomeRatio),
  },
  {
    label: t("eps"),
    render: (company: CompanyIncomeStatement) => formatRatio(company.eps),
  },
  {
    label: t("epd"),
    render: (company: CompanyIncomeStatement) =>
      formatRatio(company.epsdiluted),
  },
  {
    label: t("grossProfitRatio"),
    render: (company: CompanyIncomeStatement) =>
      formatRatio(company.grossProfitRatio),
  },
  {
    label: t("operatingIncomeRatio"),
    render: (company: CompanyIncomeStatement) =>
      formatRatio(company.operatingIncomeRatio),
  },
  {
    label: t("IBTR"),
    render: (company: CompanyIncomeStatement) =>
      formatRatio(company.incomeBeforeTaxRatio),
  },
];





//useOutletContext 不是组件，而是 React Router 提供的一个 Hook，专门用来在嵌套路由中从父组件获取“共享数据”的
  const ticker = useOutletContext<string>();
  const [incomeStatement, setIncomeStatement] =useState<CompanyIncomeStatement[]>();
  useEffect(() => {
    const getRatios = async () => {
      console.log("开始请求 income statement...");
      const result = await getIncomeStatement(ticker!);
      console.log("API 返回结果：", result);
      setIncomeStatement(result);
    };
    getRatios();
  }, [ticker]);
  return (
    <>
      {incomeStatement ? (
        <Table config={configs} data={incomeStatement} />
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default IncomeStatement;