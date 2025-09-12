import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from "react";
import type { CompanySearch } from "../../company";
import { searchCompanies } from "../../api";
import Navbar from "../../Components/Navbar/Navbar";
import Hero from "../../Components/Hero/Hero";
import Search from "../../Components/Search/Search";
import ListPortfolio from "../../Components/Portfolio/ListPortfolio/ListPortfolio";
import CardList from "../../Components/CardList/CardList";
import type { PortfolioGet } from "../../Models/Portfolio";
import { portfolioAddAPI, portfolioDeleteAPI, portfolioGetAPI } from "../../Service/PortfolioService";
import { toast } from "react-toastify";

type Props = {}

const SearchPage = (props: Props) => {

          const [search, setSearch] = useState<string>("");
          const [portfolioValues, setPortfolioValues] = useState<PortfolioGet[]>([]);
          const [searchResult, setSearchResult] = useState<CompanySearch[]>([]);
          const [serverError, setServerError] = useState<string>("");
    
    
          const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              console.log(e);
          };

          useEffect(() => {
            getPortfolio();
          }, []);

          const getPortfolio = () =>{
            portfolioGetAPI()
            .then((res) =>{
              if(res?.data){
                setPortfolioValues(res?.data);
              }
            }).catch((e) => {
              toast.warning("Could not get portfolio values!");
            });
          };

          //异步编程记得使用async
          const onSearchSubmit = async (e: SyntheticEvent) => { 
              const result = await searchCompanies(search);
              if (typeof result === "string") {
                setServerError(result);
              } else if (Array.isArray(result.data)) {
                setSearchResult(result.data);
              }
                else if (result && Array.isArray(result.data)) {
                setSearchResult(result.data);
              }
              console.log(searchResult);
          };
    


          const onPortfolioCreate = (e: any) => {
            e.preventDefault();
            portfolioAddAPI(e.target[0].value)
            .then((res) => {
              if(res?.status === 204){
                toast.success("Stock added to portfolio!")
                getPortfolio();
              }
            }).catch((e) =>{
                toast.warning("Could not create portfolio item!");
            })
          };
//           const form = e.target as HTMLFormElement;
//           const formData = new FormData(form);
//           const value = formData.get("symbol") as string;
    
//            if (portfolioValues.includes(value)) return;
//            const updatedPortfolio = [...portfolioValues, value];
    
//            setPortfolioValues(updatedPortfolio);
//            console.log(e)
          

          const onPortfolioDelete = (e: any) => {
            e.preventDefault();
            portfolioDeleteAPI(e.target[0].value)
            .then((res) =>{
              if(res?.status == 200){
                  toast.success("Stock deleted from portfolio");
                  getPortfolio();
              }
            })
          };


  return (
    <div className = "App">
      <Search  
          onSearchSubmit = { onSearchSubmit } 
          search={search} 
          handleSearchChange={handleSearchChange} />
          {serverError && <h1>{serverError}</h1> }
      <ListPortfolio  
        portfolioValues={portfolioValues!}
        onPortfolioDelete={onPortfolioDelete}
        />
      <CardList 
        searchResults ={searchResult} 
        onPortfolioCreate={onPortfolioCreate}
        />
    </div>
  )
  
}

export default SearchPage