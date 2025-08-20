import type { SyntheticEvent } from "react";
import { getFactors } from "../../Service/FactorDisplayService";
import type { FactorGet } from "../../Models/Factor";
import Factor from "../Factor/Factor";
import { SlEqualizer } from "react-icons/sl";
import { useEffect, useState } from "react";
import "./FactorCategory.css"

export interface Props {
  category: string;
  ChoosingFactor: (e: SyntheticEvent) => void; // 就传进来，透传下去
}

export type { Props as FactorCategorySecondProps };

// type FactorDisplay = {
//     id: string;
//     name: string;
//     description: string;
//     category: string;
// }

const FactorCategorySecond = ({ category, ChoosingFactor}: Props) => {
    const [factors, setFactors] = useState<FactorGet[]>([]);
    
    useEffect(() => {
        getFactors("", category, "").then((res) => {
        if (res) setFactors(res);
        });
    }, [category]);
    

    return (
        <div className="factor-category">
            <div className="flex flex-col h-full space-y-2 w-[100px] bg-lightBlue text-white font-bold rounded-lg text-center">
                <SlEqualizer className="w-full text-2xl mt-12" />
                <span className="text-lg font-semibold mb-1 mt-1">{category}</span>
            </div>
            {factors.length > 0 ? (
                factors.map((factor) => {
                    return (
                        <div key={factor.id} className="min-w-[120px] w-fit p-3">
                            <Factor
                                {...factor}
                                code_key={factor.code_key}
                                code={factor.computeCode}
                                ChoosingFactor={ChoosingFactor}
                            />
                        </div>
                    )
                })
            ) : (
                <p className="mb-3 mt-3 text-xl font-semibold text-center md:text">
                    No results
                </p>
            )}
        </div>
    );
};

export default FactorCategorySecond;