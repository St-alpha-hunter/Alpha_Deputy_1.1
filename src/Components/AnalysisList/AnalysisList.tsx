import react, { type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";

type Props = {
    id: string;
    title: string;
    author: string;
    onClick: () => void;
}



const AnalysisList = ({ id, title, author, onClick }: Props) => {

  return (
    <div onClick={onClick} className="flex flex-row p-4 border gap-10 border-lightGreen rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" >
      <div>
         <h2 className="block text-black" >{title}</h2>
      </div>
      <div>
        <h2 className="block text-black">By: {author}</h2>
      </div>
    </div>
  )
}

export default AnalysisList;