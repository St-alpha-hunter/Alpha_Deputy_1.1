import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import CompanyPage from "../Pages/CompanyPage/CompanyPage";
import HomePage from "../Pages/HomePage/HomePage";
import SearchPage from "../Pages/SearchPage/SearchPage";
import CompanyProfile from "../Components/CompanyProfile/CompanyProfile";
import DesignGuide from "../Pages/DesignGuide/DesignGuide";
import BalanceSheet from "../Components/BalanceSheet/BalanceSheet";
import IncomeStatement from "../Components/IncomeStatement/IncomeStatement";
import CashFlowStatement from "../Components/CashFlowStatement/CashFlowStatement";
import SessionPage from "../Pages/SessionPage/SessionPage";
import AnalysisPage from "../Pages/AnalysisPage/AnalysisPage";
import FactorDeckPage from "../Pages/FactorDeckPage/FactorDeckPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            { path: "", element: <HomePage/>},
            { path: "search", element: <SearchPage/>},
            { path: "company/:ticker", element: <CompanyPage/>},
            { path: "design-guide", element:<DesignGuide/>},
            { path: "deck", element:<FactorDeckPage/>},
            { path: "session", element:<SessionPage/>},
            { path: "report", element:<AnalysisPage/>},

            {            
              path: "company/:ticker",
              element: <CompanyPage/>,
              children: [
                {path: "company-profile", element: <CompanyProfile/>},
                {path: "income-statement", element: <IncomeStatement/>},
                {path: "balance-sheet", element: <BalanceSheet/>},
                {path: "cashflow-statement", element: <CashFlowStatement/>} 
              ]
            }
        ],
    },
]);