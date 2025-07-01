import CardPortfolio from "../CardPortfolio/CardPortfolio";


interface Props {
    portfolioValues: string[];
    
}

const ListPortfolio = ( {portfolioValues}: Props) => {
  return (
    <>
        <h3>My Portfolio</h3>
        <div>ListPortfolio</div>
        <ul>
            {portfolioValues &&
                portfolioValues.map((portfolioValue) => {
                    return <CardPortfolio key={portfolioValue} symbol={portfolioValue} portfolioValue={portfolioValue}/>
                })
            }
        </ul>
    </>
  )
}

export default ListPortfolio