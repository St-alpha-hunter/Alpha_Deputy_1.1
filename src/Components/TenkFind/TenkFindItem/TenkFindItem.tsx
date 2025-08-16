import { Link } from "react-router-dom";
import type { CompanyTenK } from "../../../company";

type Props = {
    tenk: CompanyTenK;
};

const TenkFindItem = ({ tenk }: Props) => {
    const fillingData = new Date(tenk.fillingDate).getFullYear();

  return (
    <Link 
        reloadDocument
        to={tenk.finalLink}
        type="button"
        className = "inline-flex items-center p-4 m-2 text-md text-gray-600 bg-lightGreen rounded-md"
        > 10k - {tenk.symbol} - {fillingData} </Link>
  );
};

export default TenkFindItem;