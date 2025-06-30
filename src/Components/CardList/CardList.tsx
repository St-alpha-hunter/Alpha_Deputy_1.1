import Card from "../Card/Card";


interface Props  {

};

const CardList = (props: Props) => {
  return (
    <div>
       <Card companyName = "Apple" ticker = 'APPL' price = {110}/>
       <Card companyName = "Micrsoft" ticker = 'MSFT' price = {200}/>
       <Card companyName = "Tesla" ticker = 'Tesla' price = {300}/>
    </div>
  );
}

export default CardList;