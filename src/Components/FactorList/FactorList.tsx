import type { JSX, SyntheticEvent } from "react";
import Card from "../Card/Card";
import type { FactorProps } from "../Factor/Factor";
import Factor from "../Factor/Factor";


interface Props  {
  searchResults: FactorProps[];
  //onPortfolioCreate:(e: SyntheticEvent) => void;
};

const FactorList: React.FC<Props> = ({ searchResults }: Props): JSX.Element => {
  return <div className = "text-black flex flex-row flex-wrap gap-2 max-h-[200px] overflow-y-auto">
    {searchResults.length > 0 ? (
      searchResults.map((result) => {
        return (
        <Factor 
          id={result.id} 
          name ={result.name}
          key = {result.id}
          category={result.category}
          code = {result.code}
          description= {result.description}
          />
        )
      })
    ) : (
      <p className = "mb-3 mt-3 text-xl font-semibold text-center md:text">
        No results!
        </p>
    )
  } 
    </div>;
};


export default FactorList;