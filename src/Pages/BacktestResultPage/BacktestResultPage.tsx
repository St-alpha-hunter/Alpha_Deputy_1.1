import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";;
import { BacktestResponse, PortfolioConstraintModel } from "../../Service/Constraint";
import { useEffect, useState } from "react";




const BacktestResultPage = () => {
    const { session_id } = useParams();
    const location = useLocation();
    const results = location.state?.results;

  return (
    <div>
      <h2>回测报告(Session: {session_id})</h2>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
};

export default BacktestResultPage;