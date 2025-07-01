import './App.css';
import "../src/Components/Card/Card.css";
import CardList from './Components/CardList/CardList';
import Search from './Components/Search/Search';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { searchCompanies } from './api';
import type { CompanySearch } from './company';
import ListPortfolio from './Components/Portfolio/ListPortfolio/ListPortfolio';

function App() {
  
      const [search, setSearch] = useState<string>("");
      const [portfolioValues, setPortfolioValues] = useState<string[]>([]);
      const [searchResult, setSearchResult] = useState<CompanySearch[]>([]);
      const [serverError, setServerError] = useState<string>("");


      const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
          console.log(e);
      };
      //异步编程记得使用async
      const onSearchSubmit = async (e: SyntheticEvent) => { 
          const result = await searchCompanies(search);
          if (typeof result === "string") {
            setServerError(result);
          } else if (Array.isArray(result.data)) {
            setSearchResult(result.data);
          }
          console.log(searchResult);
      };

      const onPortfolioCreate = (e: SyntheticEvent) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const value = formData.get("symbol") as string;

        if (portfolioValues.includes(value)) return;
        const updatedPortfolio = [...portfolioValues, value];

        setPortfolioValues(updatedPortfolio);
        console.log(e)
      }
  
  return (
    <div className = "App">
      <Search  
          onSearchSubmit = { onSearchSubmit } 
          search={search} 
          handleSearchChange={handleSearchChange} />
          {serverError && <h1>{serverError}</h1> }
      <ListPortfolio  portfolioValues={portfolioValues}/>
      <CardList searchResults ={searchResult} onPortfolioCreate={onPortfolioCreate}/>
    </div>
      );
    }
export default App;
