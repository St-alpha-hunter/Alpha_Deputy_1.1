//原生状态函数导入
import { useState, useEffect } from "react";

//接口导入
import type { FactorProps } from "../../Components/Factor/Factor";
import Factor from "../../Components/Factor/Factor";
import type {FactorCategoryProps} from "../../Components/FactorCategory/FactorCategory"

//鼠标管理
import type { MouseEvent, SyntheticEvent } from "react";

//用例调用
import { exampleCategory } from "./exampleCategory";
import { exampleFactors } from "../../Components/Factor/examplefactors"

//区域管理
import FactorDropZone from "../../Components/FactorDropZone/FactorDropZone"
import FactorCategory from "../../Components/FactorCategory/FactorCategory";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import { toast } from "react-toastify";


type Props = {}

const FactorDeckPage = (props: Props) => {

    const [factor, setfactor] = useState< FactorProps | null>(null);
    const [factorgory, setfactorgory] = useState < FactorCategoryProps | null>(null);
    const [categories, setcategories] = useState <string[]>([]);

    const ClickFactor = (e: SyntheticEvent) => {
        setfactor;

    }

    const [selectedFactors, setSelectedFactors] = useState<FactorProps[]>([]);

        const handleDropFactor = (factor: Partial<FactorProps>) => {
        console.log("Dropped", factor);
        const exists = selectedFactors.some(f =>f.id === factor.id);
        if (exists) {
            toast.error(`${factor.name} has been added`);
            return;
        }
        setSelectedFactors(prev => [...prev, factor as FactorProps]);
        };

  
    return (
    <div className = "ml-[260px] grid grid-cols-12 h-screen relative">
        <div className="fixed top-24 left-0 w-[250px] h-[calc(100vh-4rem)] overflow-auto p-4 border-4 border-lightGreen rounded-lg bg-white z-40">
            <FactorSidebar/>
        </div>
        <div className="col-span-8 bg-gray-100 p-4">
            { exampleCategory.map((item) => {
                return(           
         
                <FactorCategory
                    key = {item.id}
                    category={item.category}
                    ChoosingFactor={ClickFactor}
                />
        
                );
            })
            }
        </div>

        <div className="fixed top-24 right-0 w-[470px] bg-white p-4 overflow-auto border-4 rounded-lg border-lightGreen">
            <FactorDropZone  onDropFactor={handleDropFactor} />
                <div className="mt-4 flex flex-wrap gap-2">
        {selectedFactors.map((factor) => (
            <Factor key={factor.id} {...factor} />
        ))}
    </div>

        </div>

    </div>
  )
}

export default FactorDeckPage