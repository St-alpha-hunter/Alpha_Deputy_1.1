import type { SyntheticEvent } from "react";
import DeletePortfolio from "../DeletePortfolio/DeletePortfolio";
import { Link } from "react-router-dom";


interface Props {
    id: string,
    portfolioValue: string;
    onPortfolioDelete: (e: SyntheticEvent) => void;
}

function CardPortfolio({ id, portfolioValue, onPortfolioDelete }: Props) {
    return (
    <div className="w-full max-w-xs p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
        <div className="flex flex-col w-full p-8 space-y-4 text-center rounded-lg shadow-lg md:w-1/3">
         
        <Link 
            to={`/company/${portfolioValue}/company-profile`} 
            className="text-2xl font-bold text-darkBlue hover:text-blue-600 transition-colors">
                {portfolioValue}
        </Link>
            <DeletePortfolio 
                onPortfolioDelete={onPortfolioDelete} 
                portfolioValue={portfolioValue}/>
        </div>
    </div>
    );
}

export default CardPortfolio;