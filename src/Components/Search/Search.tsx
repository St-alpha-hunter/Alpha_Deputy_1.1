import { type JSX } from "react";
import React, { type ChangeEvent, useState, type SyntheticEvent} from "react";
import "./Search.css";

interface Props {
    onSearchSubmit: (e: SyntheticEvent) => void;
    search: string | undefined;
    handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Search : React.FC<Props> = ({
    onSearchSubmit, 
    search, 
    handleSearchChange
    }:Props): JSX.Element => {
    return (
        <div className="input-wrapper"> 
            <input className="w-[1024px] h-12  px-5 py-3 border-4 border-blue-500 styled-input rounded-lg shadow-sm text-base focus:outline-none focus:border-green-500 transition" value = {search} onChange = {(e) => handleSearchChange(e)}></input> 
            <button className = "bg-white ml-8 text-blue-500 font-semibold px-4 py-2 rounded hover:bg-yellow-100"
                onClick= {(e) => {
                console.log(e);
                onSearchSubmit(e);
            }}> Search </button>
        </div>
    );
};

export default Search;