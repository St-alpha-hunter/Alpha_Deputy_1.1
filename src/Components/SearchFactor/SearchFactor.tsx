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
        <div className = "flex flex-col p-1 h-full w-full space-y-1 border-8 border-lightGreen rounded-lg shadow-md bg-white max-w-xl mx-auto">
            
            <div className="flex-grow-[2]">
                <input 
                    className="block h-full
                    border-2 border-blue-500 styled-input 
                    rounded-lg shadow-sm text-base 
                    focus:outline-none 
                    focus:border-green-500 transition"
                    value = {search} 
                    onChange = {(e) => handleSearchChange(e)}> 
                    </input>
            </div>

            
            <button className = "block flex-grow-[1]  w-full text-white  bg-lightGreen font-semibold rounded-lg hover:bg-yellow-100"
                        onClick= {(e) => {
                        console.log(e);
                        onSearchSubmit(e);
                    }}> Search 
            </button>

{/*
            <div className = "block flex-grow-[3] search-result bg-gray-100 text-center">
                    Search Results
            </div>
            */}
        </div>
    );
};

export default SearchFactor