import { useDragLayer } from "react-dnd";
import type { FactorProps } from "./Factor";

const FactorDragLayer = () => {
  const { isDragging, item, sourceOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging() && monitor.getItemType() === "FACTOR",
    item: monitor.getItem<FactorProps>(),
    sourceOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !item || !sourceOffset) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[10000]"
      style={{ transform: `translate(${sourceOffset.x}px, ${sourceOffset.y}px)` }}
    >
      <div className="w-fit rounded-xl border bg-lightGreen p-3 shadow-md">
        <div className="text-base font-medium text-gray-800">
          {item.name || item.id}
        </div>
      </div>
    </div>
  );
};

export default FactorDragLayer;
