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



// type Props = {
//     id:string,
//     category: string,
//     code:string,
//     code_key:string,
//     name: string;            // 中文名称（如“12月动量”）
//     weight?: number;
//     description?: string;     // 简介
//     tags?: string[];          // 标签（如 ["动量", "技术"]）
//     ChoosingFactor?: (e: SyntheticEvent) => void;
//     CheckingFactor?: (factor: MinimalFactor) => void;
// }

const FactorCategorySecond = ({ category, ChoosingFactor}: Props) => {

    
    const [factors, setFactors] = useState<FactorGet[]>([]);
    
    useEffect(() => {
        console.log("请求类别:", category);
        getFactors(category).then((res) => {
            if (res) 
                // 映射字段名
                setFactors(res);
                console.log("拿到的因子Fetched Factors:", res);
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
                                category={factor.category}
                                code_key={factor.code_key}
                                computeCode={factor.computeCode}
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