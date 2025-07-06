import type { SyntheticEvent } from "react";
import CardPortfolio from "../CardPortfolio/CardPortfolio";
import {v4 as uuidv4} from "uuid";

interface Props {
    portfolioValues: string[];
    onPortfolioDelete: (e: SyntheticEvent) => void;
}

const ListPortfolio = ( {portfolioValues, onPortfolioDelete}: Props) => {
  return (
    <section id="portfolio" className="py-12 px-6 md:px-20">
        <h2 className="mb-3 mt-3 text-3xl text-gray-800 font-semibold text-center md:text-4xl">
            My Portfolio
        </h2>
      <div className="relative flex flex-col items-center max-w-5xl mx-auto space-y-10 px-10 mb-5 md:px-6 md:space-y-0 md:space-x-7 md:flex-row">
        <>
          {portfolioValues.length > 0 ? (
            portfolioValues.map((portfolioValue) => {
              return (
                <CardPortfolio
                  key={portfolioValue} // ✅ 用作 React 渲染识别
                  id={portfolioValue}  // ✅ 如果 CardPortfolio 组件内部也需要用到
                  portfolioValue={portfolioValue}
                  onPortfolioDelete={onPortfolioDelete}
                />
              );
            })
          ) : (
            <h3 className="mb-3 mt-3 text-xl font-semibold text-center md:text-xl">
              Your portfolio is empty.
            </h3>
          )}
        </>
      </div>
    </section>
  );
};

export default ListPortfolio