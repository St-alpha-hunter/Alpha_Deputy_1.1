//原生状态函数导入
import { useState, useEffect } from "react";

//接口导入
import type { FactorProps } from "../../Components/Factor/Factor";
import Factor from "../../Components/Factor/Factor";


//鼠标管理
import type { ChangeEvent, MouseEvent, SyntheticEvent } from "react";
import type { MinimalFactor } from "../../Components/Factor/Factor";

//用例调用
import { exampleCategory } from "./exampleCategory";
import { exampleFactors } from "../../Components/Factor/examplefactors"

//区域管理
import FactorDropZone from "../../Components/FactorDropZone/FactorDropZone"
import FactorCategorySecond from "../../Components/FactorCategory/FactorCategorySecond";
import FactorSidebar from "../../Components/FactorSidebar/FactorSidebar";
import SearchFactor from "../../Components/SearchFactor/SearchFactor";
import Display from "../../Components/Display/Display";
import { toast } from "react-toastify";
import CardList from "../../Components/CardList/CardList";
import FactorList from "../../Components/FactorList/FactorList";

//Redux
import { addFactor, removeFactor} from "../../redux/features/Factors/factorSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";

type Props = {}

const FactorDeckPage = (props: Props) => {
    const dispatch = useDispatch();

    const [search, setSearch] = useState<string>("");
    const [factor, setfactor] = useState< FactorProps | null>(null);
    const selectedFactors = useSelector((state: RootState) => state.factor.selectedFactors)
    //const [selectedFactors, setSelectedFactors] = useState<FactorProps[]>([]);
    const [searchResult, setSearchResult] = useState<FactorProps[]>([]);
    
    
    const ClickFactor = (e: SyntheticEvent) => {
        setfactor;
    }
   
    // const onSearchSubmit = async (e : SyntheticEvent) => {
    //     e.preventDefault();
    //         // 本地搜索 exampleFactors
    //     const filtered = exampleFactors.filter((factor) =>
    //     factor.name.toLowerCase().includes(search.toLowerCase()) 
    // );

    // // 类型转换，因为 searchResult 用的是 CompanySearch[]
    // // 暂时你可以把 searchResult 类型改成 FactorProps[]（或单独搞一个 searchFactorResult）
    //     setSearchResult(filtered); 
    // };
   

    const onSearchSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/factor?query=${search}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();
        setSearchResult(data); // data 是 factorDto 数组
    } catch (err) {
        toast.error("Search failed!");
    }
    };


    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                  console.log(e);
              };
    
    const onPortfolioCreate = (e: SyntheticEvent) =>{

    };

    // const FactorDelete = (deletefactor : MinimalFactor) =>{
    //     setSelectedFactors((prev) => prev.filter((f) => f.id !== deletefactor.id) )
    //     dispatch(removeFactor(deletefactor.id));
    //     };


    // const handleDropFactor = (factor: MinimalFactor ) => {
    //     setSelectedFactors((prev) => {
    //     if (prev.some((f) => f.id === factor.id)) {
    //     toast.error(`${factor.name} is already in your list 📋`);
    //     dispatch(addFactor(factor as FactorProps));
    //     return prev;               // 不变
    //     }
    //     return [...prev, factor as FactorProps];
    // });
    // };

    const handleDropFactor = (factor: MinimalFactor) => {
    dispatch(addFactor(factor as FactorProps));
    };

    
     const FactorDelete = (deletefactor : MinimalFactor) =>{

        dispatch(removeFactor(deletefactor.id));
   };


    return (
    <div className = "ml-[260px] grid grid-cols-12 h-screen relative">

        <div className="fixed top-24 left-0 w-[260px] h-[calc(100vh-4rem)] overflow-auto p-4 rounded-lg z-40">
            <FactorSidebar/>
        </div>

        <div className="col-span-8 bg-lightGreen p-4 flex flex-col space-y-6 border-4 border-gray-300">
            { exampleCategory.map((item) => {
                return(           
                <FactorCategorySecond
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

           
            <div className = "flex-grow-[6] ">
                <FactorDropZone  
                    selectedFactors={selectedFactors}
                    onDropFactor={handleDropFactor} 
                    FactorDelete={FactorDelete}
                    />
            </div>
        
        </div>
    </div>
  )
}

export default FactorDeckPage



