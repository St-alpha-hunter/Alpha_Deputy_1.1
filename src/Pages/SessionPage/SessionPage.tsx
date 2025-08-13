import { useState, type SyntheticEvent } from "react";
import FactorAdjuster from "../../Components/FactorAdjuster/FactorAdjuster";
import PortfolioConstraintForm from "../../Components/PortfolioConstraintForm/PortfolioConstraintForm";
import ManualStockAdjuster from "../../Components/DisplayStock/DisplayStock";
import StockSelection from "../../Components/StockSelection/StockSelection";

const SessionPage = () => {

  // 可选状态
  
  const [autoSelectedStocks, setAutoSelectedStocks] = useState<[]>([]);
  const [finalPortfolio, setFinalPortfolio] = useState<[]>([]);

  const onWeightChange = (e:any) =>{
    
  }

  return (
    <div className="flex flex-col space-y-20">
      <FactorAdjuster
         onWeightChange ={onWeightChange}
      />
        <div className = "flex flex-row p-2 space-x-1">
          <StockSelection/>
          <PortfolioConstraintForm/>

        </div>
          <ManualStockAdjuster/>
      </div>
  )
}

export default SessionPage