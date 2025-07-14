import type { SyntheticEvent } from "react";
import Factor from "../Factor/Factor";
import { exampleFactors } from "../Factor/examplefactors";
import { SlEqualizer } from "react-icons/sl";
import { exampleCategory } from "../../Pages/FactorDeckPage/exampleCategory";
import "./FactorCategory.css"

export interface Props {
  category:string
  ChoosingFactor: (e: SyntheticEvent) => void; // 就传进来，透传下去

  // Reserved for future category-level operations
  CreateFactorList?:(e: SyntheticEvent) => void;
}

export type { Props as FactorCategoryProps };

const FactorCategory = ( {category, ChoosingFactor, CreateFactorList}: Props) => {
        const factorsInThisCategory = exampleFactors.filter(
          (f) => f.category === category
        );

  return ( 
  
  <div className="factor-category">
      <div className="flex flex-col h-full space-y-2 w-[100px] bg-lightBlue text-white font-bold rounded-lg text-center"
        >

        <SlEqualizer className = "w-full text-2xl mt-12"/>
          <span className="text-lg font-semibold mb-1 mt-1">{category}</span>

        </div>
      { factorsInThisCategory.length > 0 ? (
          factorsInThisCategory.map((factor) => {
            return (
              <div key={`${factor.id}`} className="min-w-[120px] w-fit p-3">
                <Factor
                    {...factor}
                    ChoosingFactor={ ChoosingFactor }
                />
            </div>
            )          
          })
        ):(
    <p className="mb-3 mt-3 text-xl font-semibold text-center md:text">
      No results
    </p>
          )
    }
    </div>
  );
};
export default FactorCategory;