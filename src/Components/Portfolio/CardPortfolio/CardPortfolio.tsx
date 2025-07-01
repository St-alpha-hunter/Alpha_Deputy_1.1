

interface Props {
    portfolioValue: string;
    symbol: string
}

function CardPortfolio({ portfolioValue, symbol }: Props) {
    return (
        <>

            <h4>{symbol} - {portfolioValue}</h4>
           
        </>
    );
}

export default CardPortfolio