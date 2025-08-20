import { useState, type SyntheticEvent } from "react";
import FactorAdjuster from "../../Components/FactorAdjuster/FactorAdjuster";
import PortfolioConstraintForm from "../../Components/PortfolioConstraintForm/PortfolioConstraintForm";
import DisplayStock from "../../Components/DisplayStock/DisplayStock";
import StockSelection from "../../Components/StockSelection/StockSelection";
import type { RootState } from "../../redux/features/store";
import { useSelector } from "react-redux";

const SessionPage = () => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  // 可选状态
  const [canDisplay, setCanDisplay] = useState(false);
  // const [autoSelectedStocks, setAutoSelectedStocks] = useState<[]>([]);
  // const [finalPortfolio, setFinalPortfolio] = useState<[]>([]);
  const session_id = useSelector((state: RootState) => state.session.session_id);
  const start = "2020-08-10";
  const end = "2024-06-30";

  const onWeightChange = (e:any) =>{
    
  }

  const handleSelectStocks = async () => {
    type SelectedStocksResponse = { selected_stocks: string[] };
    const response = await axios.post<SelectedStocksResponse>('/api/compute_factors_select_stocks', { session_id, start, end });
    setSelectedStocks(response.data.selected_stocks);
    setCanDisplay(true);
  };

  return (
    <div className="flex flex-col space-y-20">
      <FactorAdjuster
         onWeightChange ={onWeightChange}
      />
        <div className = "flex flex-row p-2 space-x-1">
          <StockSelection/>
          <PortfolioConstraintForm/>

        </div>
          <div>
            <button onClick={handleSelectStocks}>The Results Of Choosing Stocks</button>
            {canDisplay && <DisplayStock selected_stocks={selectedStocks} />}
        </div>
      </div>
  )
}

export default SessionPage