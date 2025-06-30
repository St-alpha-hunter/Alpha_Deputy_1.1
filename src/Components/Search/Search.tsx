import { type JSX } from "react";
import React, { type ChangeEvent, useState, type SyntheticEvent} from "react";

interface Props {
    onSearchClick: (e: SyntheticEvent) => void;
    search: string | undefined;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Search : React.FC<Props> = ({onSearchClick, search, handleChange}:Props): JSX.Element => {

    return (
        <div> 
            <input value = {search} onChange = {(e) => handleChange(e)}></input> 
            <button 
                onClick= {(e) => {
                console.log(e);
                onSearchClick(e);
            }}> Search </button>
        </div>
    );
};

export default Search;