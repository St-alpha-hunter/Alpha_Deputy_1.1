import { useDrop } from "react-dnd";
import { useState, type FC } from "react";
import type { FactorProps } from "../Factor/Factor"; 
import { addFactor, removeFactor} from "../../redux/features/Factors/factorSlice";
import Factor from "../Factor/Factor";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import type { MinimalFactor } from "../Factor/Factor";
import { useNavigate } from 'react-router-dom'; 

type DropZoneProps = {
    //Partial就是把所有的属性都变成可选的
  selectedFactors: FactorProps[];
  onDropFactor?: (factor:  FactorProps) => void;
  FactorDelete?: (factor:  MinimalFactor) => void;
};




const FactorDropZone: FC<DropZoneProps> = ({ selectedFactors, onDropFactor, FactorDelete }:DropZoneProps) => {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/session');
  };


  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "FACTOR",
    drop: (factor: FactorProps) => {
    if(onDropFactor){
         onDropFactor(factor);
    }
  },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));


  return (
      <div className = "flex flex-col h-full p-1 space-y-3 border-8 border-lightGreen rounded-lg shadow-md bg-white w-full max-w-xl mx-auto">
            
            <div
                ref={dropRef as unknown as React.Ref<HTMLDivElement>}
                className={`flex-grow-[2] w-full border-2 border-dashed rounded-lg transition flex flex-col
                    ${isOver && canDrop ? "bg-green-100 border-green-400" : "bg-white border-gray-300"}
                `}
                >
                  
                <p className="mx-auto block text-gray-600 ">
                      {isOver && canDrop ? "Release and Add factors" : "drag factors to here"}
                </p>

            </div>
            
          <div className = "flex-grow-[6] text-center">
              <div className="flex flex-row flex-wrap gap-2 overflow-y-auto max-h-[200px] border-t pt-2">
                  {selectedFactors.map((factor) => (
                    <div key={factor.id} className="relative">
                          <button
                            onClick={() => FactorDelete?.(factor)} // ✅ 这里绑定
                            className="absolute -top-1 right-1 text-bold text-red-500 hover:text-red-700 z-10"
                          >
                              X
                          </button>
                      <Factor {...factor} />
                    </div>
        ))}

              </div>
          </div>

          <div className="flex-grow-[1] text-center">
                <button onClick={handleClick} className="px-6 py-2 bg-lightGreen text-white max-w-xs font-semibold rounded hover:opacity-90 transition">
                    Confrim My Orders and Continue 
                </button>         
          </div>
      </div>
  );
};

export default FactorDropZone;