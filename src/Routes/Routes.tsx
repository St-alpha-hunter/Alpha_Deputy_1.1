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
import StrategyWarehouse from "../Pages/StrategyWarehouse/StrategyWarehouse";
import CodeFactor from "../Pages/CodeFactor/CodeFactor";
import LoginPage from "../Pages/LoginPage/LoginPage";
import RegisterPage from "../Pages/RegisterPage/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            { path: "", element: <HomePage/>},
            { path: "search", element: <SearchPage/>},
            { path: "login", element: <LoginPage/>},
            { path: "register", element: <RegisterPage /> },
            { path: "company/:ticker", element:<ProtectedRoute><CompanyPage/></ProtectedRoute>},
            { path: "design-guide", element:<DesignGuide/>},
            { path: "session", element:<ProtectedRoute><SessionPage/></ProtectedRoute>},
            { path: "report", element:<ProtectedRoute><AnalysisPage/></ProtectedRoute>},
            { path: "deck", element:<ProtectedRoute><FactorDeckPage/></ProtectedRoute>},
            { path: "strategy-warehouse", element: <StrategyWarehouse/>},
            { path: "coding", element: <CodeFactor/>},

            {            
              path: "company/:ticker",
              element: (
              <ProtectedRoute>
                <CompanyPage/>
              </ProtectedRoute>
              ),
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