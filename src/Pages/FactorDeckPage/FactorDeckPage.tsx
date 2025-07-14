//原生状态函数导入
import { useState, useEffect } from "react";

//接口导入
import type { FactorProps } from "../../Components/Factor/Factor";
import Factor from "../../Components/Factor/Factor";
import type {FactorCategoryProps} from "../../Components/FactorCategory/FactorCategory"

//鼠标管理
import type { ChangeEvent, MouseEvent, SyntheticEvent } from "react";
import type { MinimalFactor } from "../../Components/Factor/Factor";

//用例调用
import { exampleCategory } from "./exampleCategory";
import { exampleFactors } from "../../Components/Factor/examplefactors"

//区域管理
import FactorDropZone from "../../Components/FactorDropZone/FactorDropZone"
import FactorCategory from "../../Components/FactorCategory/FactorCategory";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import SearchFactor from "../../Components/SearchFactor/SearchFactor";
import Display from "../../Components/Display/Display";
import { toast } from "react-toastify";
import CardList from "../../Components/CardList/CardList";
import FactorList from "../../Components/FactorList/FactorList";


type Props = {}

const FactorDeckPage = (props: Props) => {

    const [search, setSearch] = useState<string>("");
    const [factor, setfactor] = useState< FactorProps | null>(null);
    const [selectedFactors, setSelectedFactors] = useState<FactorProps[]>([]);
     const [searchResult, setSearchResult] = useState<FactorProps[]>([]);
    
    
    const ClickFactor = (e: SyntheticEvent) => {
        setfactor;
    }

    
   
    const onSearchSubmit = async (e : SyntheticEvent) => {
        e.preventDefault();
            // 本地搜索 exampleFactors
        const filtered = exampleFactors.filter((factor) =>
        factor.name.toLowerCase().includes(search.toLowerCase()) 
    );

    // 类型转换，因为 searchResult 用的是 CompanySearch[]
    // 暂时你可以把 searchResult 类型改成 FactorProps[]（或单独搞一个 searchFactorResult）
    setSearchResult(filtered); 
    };
   

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  console.log(e);
              };
    
    const onPortfolioCreate = (e: SyntheticEvent) =>{

    };

    const onPortfolioDelete = (e: SyntheticEvent) =>{

    };


    const handleDropFactor = (factor: MinimalFactor ) => {
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

        <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg z-40">
            <FactorSidebar/>
        </div>

        <div className="col-span-8 bg-lightGreen p-4 flex flex-col space-y-6 border-4 border-gray-300">
            { exampleCategory.map((item) => {
                return(           
                <FactorCategory
                    key={`${item.id}`}
                    category = {item.category}
                    ChoosingFactor = {ClickFactor}
                />
                );
            })
            }
        </div>

        <div className="flex flex-col fixed top-24 space-y-2 right-0 w-[470px] h-[700px] bg-white p-4 overflow-auto border-8 rounded-lg border-lightGreen">
          
           <div className = "flex-grow-[2] ">     
                <SearchFactor 
                    onSearchSubmit={onSearchSubmit} 
                    search={search}
                    handleSearchChange={handleSearchChange}/>        
            </div>

           <div className = "flex-grow-[2] ">
                <FactorList
                    searchResults={searchResult} 
                    />
            </div>

           
            <div className = "flex-grow-[2] ">
                <FactorDropZone  
                    onDropFactor={handleDropFactor} 
                    />
            </div>
            
            <div className = "flex-grow-[4] flex flex-row flex-wrap gap-2 border-8 rounded-lg p-1 border-lightGreen overflow-y-auto">
                <Display
                    selectedFactors={selectedFactors}
                    displayfactors={handleDropFactor}
                />
            </div>
        
        </div>
    </div>
  )
}

export default FactorDeckPage
