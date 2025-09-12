import react, { type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/features/store";

type Props = {
    id: string;
    title: string;
    author: string;
}



const AnalysisList = ({ id, title, author}: Props) => {
    const navigate = useNavigate();
    const session_id = useSelector((state: RootState) => state.session.session_id);
    const handleClick = (e: SyntheticEvent) => {
        e.preventDefault();
        navigate(`report/${session_id}`);
    }

  return (
    <div className="flex flex-row p-4 border border-lightGreen rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" onClick={handleClick}>
      <h2 className="block" >{title}</h2>
      <h2 className="block">By: {author}</h2>
    </div>
  )
}

export default AnalysisList;