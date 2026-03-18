import type { SyntheticEvent } from "react";
import CardPortfolio from "../CardPortfolio/CardPortfolio";
import {v4 as uuidv4} from "uuid";
import type { PortfolioGet } from "../../../Models/Portfolio";
import i18n from "../../../i18n";

interface Props {
    portfolioValues: PortfolioGet[];
    onPortfolioDelete: (e: SyntheticEvent) => void;
}

const ListPortfolio = ( {portfolioValues, onPortfolioDelete}: Props) => {
  const isZh = i18n.language === "zh";

  return (
    <section id="portfolio" className="py-12 px-6 md:px-20">
        <h2 className="mb-3 mt-3 text-3xl text-gray-800 font-semibold text-center md:text-4xl">
            {isZh ? "我关注的股票" : "My Portfolio"}
        </h2>
      <div className="relative flex flex-col items-center max-w-5xl mx-auto space-y-10 px-10 mb-5 md:px-6 md:space-y-0 md:space-x-7 md:flex-row">
        <>
          {portfolioValues.length > 0 ? (
            portfolioValues.map((portfolioValue) => {
              return (
                <CardPortfolio
                  
                  key={portfolioValue.id} // ✅ 用作 React 渲染识别
                  id={uuidv4()}
                  // ✅ 如果 CardPortfolio 组件内部也需要用到
                  portfolioValue={portfolioValue}
                  onPortfolioDelete={onPortfolioDelete}                />
              );
            })
          ) : (
            <h3 className="mb-3 mt-3 text-xl font-semibold text-center md:text-xl">
              {isZh ? "您的关注列表为空。" : "Your portfolio is empty."}
            </h3>
          )}
        </>
      </div>
    </section>
  );
};

export default ListPortfolio