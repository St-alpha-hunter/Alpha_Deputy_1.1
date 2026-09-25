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
            {/* 左：分类表头，固定宽度，随右侧行数自动拉满高度 */}
            <div className="shrink-0 w-[100px] flex flex-col items-center justify-center gap-2 bg-lightBlue text-white font-bold rounded-lg text-center px-2 py-4">
                <SlEqualizer className="text-2xl" />
                <span className="text-lg font-semibold break-words">{category}</span>
            </div>

            {/* 右：因子区，只在这一栏里换行 */}
            <div className="flex-1 min-w-0 flex flex-wrap content-start items-start gap-3 p-3">
                {factors.length > 0 ? (
                    factors.map((factor) => {
                        return (
                            <div key={factor.id} className="min-w-[120px] w-fit">
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
                    <p className="w-full self-center text-center text-gray-400 font-semibold">
                        No results
                    </p>
                )}
            </div>
        </div>
    );
};

export default FactorCategorySecond;