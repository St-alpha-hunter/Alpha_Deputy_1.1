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
            <button>X</button>
        </form>
    </div>
  )
}

export default DeletePortfolio
