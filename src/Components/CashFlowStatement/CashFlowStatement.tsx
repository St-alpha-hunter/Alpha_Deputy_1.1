import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { CompanyCashFlow } from "../../company";
import { getCashFlow } from "../../api";
import Table from "../Table/Table";
import Spinner from "../Spinners/Spinner";
import { formatLargeMonetaryNumber } from "../../Helpers/NumberFormatting";
import { useTranslation } from 'react-i18next';

type Props = {};



const CashflowStatement = (props: Props) => {
  const { t } = useTranslation();
  const config = [
  {
    label: t("date"),
    render: (company: CompanyCashFlow) => company.date,
  },
  {
    label: t("operatingCashflow"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.operatingCashFlow),
  },
  {
    label: t("investingCashflow"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.netCashProvidedByInvestingActivities),
  },
  {
    label: t("financingCashflow"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(
        company.netCashProvidedByFinancingActivities
      ),
  },
  {
    label: t("cashAtEndOfPeriod"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.cashAtEndOfPeriod),
  },
  {
    label: t("capex"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.capitalExpenditure),
  },
  {
    label: t("issuanceOfStock"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.commonStockIssuance),
  },
  {
    label: t("freeCashFlow"),
    render: (company: CompanyCashFlow) =>
      formatLargeMonetaryNumber(company.freeCashFlow),
  },
];

  const ticker = useOutletContext<string>();
  const [cashFlowData, setCashFlowData] = useState<CompanyCashFlow[]>();
  useEffect(() => {
    const getRatios = async () => {
      const result = await getCashFlow(ticker);
      setCashFlowData(result);
    };
    getRatios();
  }, []);
  return cashFlowData ? (
    <Table config={config} data={cashFlowData}></Table>
  ) : (
    <Spinner />
  );
};

export default CashflowStatement;