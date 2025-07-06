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
    <div className="border border-red-500">
        <div className="flex flex-col w-full p-8 space-y-4 text-center rounded-lg shadow-lg md:w-1/3">
         
        <Link to={`/company/${portfolioValue}`} className="pt-6 text-xl font-bold">{portfolioValue}</Link>
            <DeletePortfolio 
                onPortfolioDelete={onPortfolioDelete} 
                portfolioValue={portfolioValue}/>
        </div>
    </div>
    );
}

export default CardPortfolio;