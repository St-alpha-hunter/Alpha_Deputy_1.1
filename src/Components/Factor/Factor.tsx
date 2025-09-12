import { useDrag } from 'react-dnd';
import { useRef, useEffect, useState, type SyntheticEvent } from "react";

type MinimalFactor = {
  id: string;
  name?: string;
};

export type {MinimalFactor};

type Props = {
    id:string,
    category: string,
    computeCode:string,
    code_key:string,
    name: string;            // 中文名称（如“12月动量”）
    weight?: number;
    description?: string;     // 简介
    tags?: string[];          // 标签（如 ["动量", "技术"]）
    ChoosingFactor?: (e: SyntheticEvent) => void;
    CheckingFactor?: (factor: MinimalFactor) => void;
}

export type { Props as FactorProps };


const Factor = (props: Props) => {
    const [isHovered, setIsHovered] = useState(false);

    //创建一个 ref 引用，以后可以用它来拿到 DOM 节点，传给 dragRef
    //泛型是 HTMLDivElement，确保类型安全
    const ref = useRef<HTMLDivElement | null>(null);


    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "FACTOR", // 拖动项的类型，可以统一定义成常量
        item: { ...props }, // 拖动时携带的数据
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            }),
        }), [props]);

    // 🧷 把 dragRef 应用到你自己定义的 ref 上
    // 拖动的“代理钩子”，必须绑定在 DOM 节点上才能启用拖动
    useEffect(() => {
        if (ref.current) {
            dragRef(ref.current);
        }
    }, [ref, dragRef]);


    return (
    <div
      ref={ref}
      className={`relative w-fit h-fit p-3 border rounded-xl shadow-sm transition cursor-pointer bg-lightGreen
                ${isDragging ? "opacity-50" : "hover:shadow-md"}`}
      onClick={props.ChoosingFactor}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        
      {isHovered && (
        <div className="absolute top-full mt-2 w-48 bg-white shadow-md border p-2 text-sm z-10">
          {props.description}
        </div>
      )}

      <div className="text-base font-medium text-gray-800 bg-lightGreen">
        {props.name || props.id}
      </div>
    </div>
  );
};

export default Factor