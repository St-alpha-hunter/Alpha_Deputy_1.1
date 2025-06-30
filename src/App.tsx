import './App.css';
import "../src/Components/Card/Card.css";
import CardList from './Components/CardList/CardList';
import Search from './Components/Search/Search';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { searchCompanies } from './api';
import type { CompanySearch } from './company';

function App() {
  
      const [search, setSearch] = useState<string>("");
      const [searchResult, setSearchResult] = useState<CompanySearch[]>([])
      const [serverError, setServerError] = useState<string>("");


      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
          console.log(e);
      };
      //异步编程记得使用async
      const onClick = async (e: SyntheticEvent) => { 
          const result = await searchCompanies(search);
          if (typeof result === "string") {
            setServerError(result);
          } else if (Array.isArray(result.data)) {
            setSearchResult(result.data);
          }
          console.log(searchResult);
      };
  
  return (
    <div className = "App">
      <Search  
          onSearchClick = { onClick } 
          search={search} 
          handleChange={handleChange} />
          {serverError && <h1>{serverError}</h1> }
      <CardList/>
    </div>
      );
    }
export default App;
