import { type JSX } from "react";
import React, { type ChangeEvent, useState, type SyntheticEvent} from "react";

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
        <div> 
            <input value = {search} onChange = {(e) => handleSearchChange(e)}></input> 
            <button 
                onClick= {(e) => {
                console.log(e);
                onSearchSubmit(e);
            }}> Search </button>
        </div>
    );
};

export default Search;