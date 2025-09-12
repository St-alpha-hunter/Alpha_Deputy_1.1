import { useState, type SyntheticEvent } from "react";
import FactorAdjuster from "../../Components/FactorAdjuster/FactorAdjuster";
import PortfolioConstraintForm from "../../Components/PortfolioConstraintForm/PortfolioConstraintForm";
import DisplayStock from "../../Components/DisplayStock/DisplayStock";
import StockSelection from "../../Components/StockSelection/StockSelection";
import type { RootState } from "../../redux/features/store";
import { useSelector } from "react-redux";
import { FixParams, StockSelectionForm, StockSelectionModel } from "../../Service/StockSelection";
import type { StockSelectionResponse } from "../../Service/StockSelection";
import { toast } from "react-hot-toast";


const SessionPage = () => {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // 可选状态
  //const [canDisplay, setCanDisplay] = useState(false);
  // const [autoSelectedStocks, setAutoSelectedStocks] = useState<[]>([]);
  // const [finalPortfolio, setFinalPortfolio] = useState<[]>([]);
  // const session_id = useSelector((state: RootState) => state.session.session_id);
  // const start = "2020-08-10";
  // const end = "2024-06-30";

  const onWeightChange = (e:any) =>{
    
  }

  const handleSelectStocks = async (
    data: StockSelectionModel,
    fixParams: FixParams
  ): Promise<StockSelectionResponse | void> => {
    setLoading(true);
    try {
      const response = await StockSelectionForm(data, fixParams);
      toast.success("Stock selection submitted successfully!");
      if(response){
        setSelectedStocks(response.selected_stocks);
        setLoading(false);
        //setCanDisplay(true);
        return response;
      }
    } catch (error) {
      console.error("Error selecting stocks:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-20">
      <FactorAdjuster
         onWeightChange ={onWeightChange}
      />
        <div className = "flex flex-row p-2 space-x-1">
          <StockSelection OnSubmit={handleSelectStocks}/>
          <PortfolioConstraintForm/>

        </div>
          <div>
           {loading && <p>Loading...</p>} <DisplayStock selected_stocks={selectedStocks} />
        </div>
      </div>
  )
}

export default SessionPage