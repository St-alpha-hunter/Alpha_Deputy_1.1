import { type JSX } from "react";
import React, { type ChangeEvent, useState, type SyntheticEvent} from "react";
import "./Search.css";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    return (
        <div className="w-[1000px] h-[200px] bg-lightGreen 
            rounded-lg mx-auto flex items-center 
            justify-center flex-wrap space-x-1"> 
            <input className="w-[600px] h-[80px] border-4 ml-6 mr-6 border-blue-500 
                styled-input rounded-lg shadow-sm text-base focus:outline-none
                focus:border-green-500 transition" 
                value = {search} onChange = {(e) => handleSearchChange(e)}>
            </input> 
            <button className = "bg-white ml-8 text-blue-500 font-semibold px-4 py-2 rounded hover:bg-yellow-100"
                    onClick= {(e) => {
                    console.log(e);
                    onSearchSubmit(e);
                }}> {t("searchStockID")} 
            </button>
        </div>
    );
};

export default Search;