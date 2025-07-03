

interface Props  {
    ticker:string;
}

const CompanyFind = ( {ticker} : Props) => {
  return (
    <>
    <div>CompanyFind</div>
    <div> {ticker} </div>
    </>
    
  )
}

export default CompanyFind;