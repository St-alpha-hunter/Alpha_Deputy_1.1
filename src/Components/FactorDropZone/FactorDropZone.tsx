import { useDrop } from "react-dnd";
import { type FC } from "react";
import type { FactorProps } from "../Factor/Factor"; 

type DropZoneProps = {
    //Partial就是把所有的属性都变成可选的
  onDropFactor?: (factor: Partial<FactorProps>) => void;
};

const FactorDropZone: FC<DropZoneProps> = ({ onDropFactor }) => {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "FACTOR",
    drop: (item: Partial<FactorProps>) => {
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
 <div className = "p-4 border-2 border-lightGreen rounded-lg shadow-md bg-white w-full h-[500px] max-w-xl mx-auto">
        <div
            ref={dropRef as unknown as React.Ref<HTMLDivElement>}
            className={`h-[300px] w-full border-2 border-dashed rounded-lg transition flex flex-col
                ${isOver && canDrop ? "bg-green-100 border-green-400" : "bg-white border-gray-300"}
            `}
            >
        <div className = "h-[250px]">
            <p className="text-center text-gray-600 mt-4">
                {isOver && canDrop ? "Release and Add factors" : "drag factors to here"}
            </p>
        </div>
        </div>
            <div className="mt-6 text-center h-auto">
                <button className="px-6 py-2 bg-lightGreen text-white font-semibold rounded hover:opacity-90 transition">
                    Confrim My Orders and Continue 
                </button>
            </div>
    </div>
  );
};

export default FactorDropZone;