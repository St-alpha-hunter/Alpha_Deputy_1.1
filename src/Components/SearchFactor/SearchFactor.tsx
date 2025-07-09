import type { ChangeEvent, SyntheticEvent } from "react"
import "./SearchFactor.css"

interface Props {
    onSearchSubmit: (e: SyntheticEvent) => void;
    search: string | undefined
    handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchFactor = ({
    onSearchSubmit, 
    search, 
    handleSearchChange
    }: Props) => {
    return (
        <div className = "flex flex-col p-2 w-full space-y-1 border-8 border-lightGreen rounded-lg shadow-md bg-white w-full h-[256px] max-w-xl mx-auto">
            
            <div className="flex-grow-[3]">
                <input 
                    className="h-full px-2 py-2 
                    border-2 border-blue-500 styled-input 
                    rounded-lg shadow-sm text-base 
                    focus:outline-none rounded-lg
                    focus:border-green-500 transition"
                    value = {search} 
                    onChange = {(e) => handleSearchChange(e)}> 
                    </input>
            </div>

            <div className="flex-grow-[1] ">
                <button className = "block h-full w-full text-white flex-grow-[1] bg-lightGreen font-semibold  rounded hover:bg-yellow-100"
                        onClick= {(e) => {
                        console.log(e);
                        onSearchSubmit(e);
                    }}> Search 
                </button>
            </div>

            <div className = "search-result bg-gray-100 flex-grow-[2] text-center justify-center">
                    Search Results
            </div>
            
        </div>
    );
};

export default SearchFactor