import { useDrop } from "react-dnd";
import { useState, type FC } from "react";
import type { FactorProps } from "../Factor/Factor"; 
import Factor from "../Factor/Factor";
import { toast } from "react-toastify";

type DropZoneProps = {
    //Partial就是把所有的属性都变成可选的
  onDropFactor?: (factor:  { id: string; name?: string }) => void;
};



const FactorDropZone: FC<DropZoneProps> = ({ onDropFactor }) => {

  
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "FACTOR",
    drop: (item: { id: string; name?: string }) => {
      if (onDropFactor) {
        onDropFactor(item);
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

            <div className="flex-grow-[1] text-center">
                <button className="px-6 py-2 bg-lightGreen text-white max-w-xs font-semibold rounded hover:opacity-90 transition">
                    Confrim My Orders and Continue 
                </button>
          
            </div>
      </div>
  );
};

export default FactorDropZone;