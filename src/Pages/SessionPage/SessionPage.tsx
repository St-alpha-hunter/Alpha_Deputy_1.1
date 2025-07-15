import { useState, type SyntheticEvent } from "react";
import FactorAdjuster from "../../Components/FactorAdjuster/FactorAdjuster";
import PortfolioConstraintForm from "../../Components/PortfolioConstraintForm/PortfolioConstraintForm";
import ManualStockAdjuster from "../../Components/ManualStockAdjuster/ManualStockAdjuster";
import StockSelection from "../../Components/StockSelection/StockSelection";

const SessionPage = () => {

  // 可选状态
  
  const [autoSelectedStocks, setAutoSelectedStocks] = useState<[]>([]);
  const [finalPortfolio, setFinalPortfolio] = useState<[]>([]);

  const onWeightChange = (e:any) =>{
    
  }

  return (
    <div className="flex flex-col">
      <FactorAdjuster
         onWeightChange ={onWeightChange}
      />
      <StockSelection/>
      <ManualStockAdjuster
      />
      <PortfolioConstraintForm
      />
    </div>
  )
}

export default SessionPage