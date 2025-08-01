import type { SyntheticEvent } from "react";
import DeletePortfolio from "../DeletePortfolio/DeletePortfolio";
import { Link } from "react-router-dom";
import type { PortfolioGet } from "../../../Models/Portfolio";


interface Props {
    id: string,
    portfolioValue: PortfolioGet;
    onPortfolioDelete: (e: SyntheticEvent) => void;
}

function CardPortfolio({ id, portfolioValue,onPortfolioDelete }: Props) {
    return (
    <div className="w-full max-w-xs p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <div className="flex flex-col w-full p-8 space-y-4 text-center rounded-lg shadow-lg md:w-1/3">
         
        <Link 
            to={`/company/${portfolioValue.symbol}/company-profile`} 
            className="text-2xl font-bold text-darkBlue hover:text-blue-600 transition-colors">
                {portfolioValue.symbol}
        </Link>
            <DeletePortfolio 
                onPortfolioDelete={onPortfolioDelete} 
                portfolioValue={portfolioValue.symbol}/>
        </div>
    </div>
    );
}

export default CardPortfolio;