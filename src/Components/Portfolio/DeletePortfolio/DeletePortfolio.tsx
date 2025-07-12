import type { SyntheticEvent } from "react"

interface Props {
    onPortfolioDelete: (e: SyntheticEvent) => void;
    portfolioValue: string;
}

const DeletePortfolio = ({ onPortfolioDelete, portfolioValue }: Props) => {
  return ( 
    <div>
        <form onSubmit={ onPortfolioDelete }>
            <input 
                hidden={true} 
                value = {portfolioValue ?? ''}
                readOnly={true}/>
            <button className="block w-[40px] py-3 text-white duration-200 border-2 rounded-lg bg-red-500 hover:text-red-500 hover:bg-white border-red-500">
              X
            </button>
        </form>
    </div>
  )
}

export default DeletePortfolio
