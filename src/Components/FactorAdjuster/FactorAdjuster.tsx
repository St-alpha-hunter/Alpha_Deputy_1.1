import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/features/store';
import type { FactorProps } from '../Factor/Factor';
import { setFactorWeight } from '../../redux/features/Factors/factorSlice';


interface Props {
    onWeightChange: (e:FactorProps[]) => void
}


const FactorAdjuster = ( onWeightChange : Props ) => {
      const dispatch = useDispatch();
      const selectedFactors = useSelector(
        (state: RootState) => state.factor.selectedFactors
      );
      // 初始化平均权重
      const [weight ,setWeight] = useState<FactorProps[]>([]);
      // 初始化或重新计算平均权重
      useEffect(() => {
        if (selectedFactors.length > 0) {
          const avgWeight = 1 / selectedFactors.length;
          selectedFactors.forEach( f => {
            dispatch(setFactorWeight({ id: f.id, weight: avgWeight}));
          });
        }
      }, [selectedFactors]);


      const handleWeightChange = (id: string, newWeight: number) => {
        dispatch(setFactorWeight({ id, weight: newWeight }));
      };

 //     const total = selectedFactors
 //     .map(f => f.weight)
//    .reduce((sum, weight) => sum + weight, 0);

    const total = selectedFactors.reduce((sum, f) => sum + (f?.weight ?? 0), 0);
//??空值合并运算符（Nullish Coalescing),只有左侧结果为 null 或 
// undefined 时，才返回右侧的默认值；否则返回左侧值


      return (
          <div>
            <h3>Modify Factors' Weight</h3>
            {selectedFactors.map(f => (
              <div key={f.id} style={{ marginBottom: '1rem' }}>
                <div>{f.name}</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={f.weight}
                  onChange={e => handleWeightChange(f.id, parseFloat(e.target.value))}
                />
                <span>{( (f?.weight ?? 0) * 100).toFixed(1)}%</span>
              </div>
            ))}
            <div>
              <strong>Total Weights: {(total * 100).toFixed(1)}%</strong>
                    {Math.abs(total - 1) > 0.01 && (
                <span style={{ color: 'red', marginLeft: 10 }}>⚠ Total Occpuy is not equal to 100%</span>
              )}
            </div>
          </div>
      );

    }


export default FactorAdjuster; 






/*
interface FactorWeight {
  id: string;
  name: string;
  weight: number;
}

interface FactorAdjusterProps {
  onWeightChange?: (weights: FactorWeight[]) => void;
}

const Factor01Adjuster: React.FC<FactorAdjusterProps> = ({ onWeightChange }) => {
  const selectedFactors = useSelector((state: RootState) => state.factor.selectedFactors);

  // 初始化平均权重
  const [weights, setWeights] = useState<FactorWeight[]>([]);

  // 初始化或重新计算平均权重
  useEffect(() => {
    if (selectedFactors.length > 0) {
      const avgWeight = 1 / selectedFactors.length;
      const initialWeights = selectedFactors.map(f => ({
        id: f.id,
        name: f.name,
        weight: parseFloat(avgWeight.toFixed(4)),
      }));
      setWeights(initialWeights);
      onWeightChange?.(initialWeights);
    }
  }, [selectedFactors]);

  const handleWeightChange = (id: string, newWeight: number) => {
    const updated = weights.map(w =>
      w.id === id ? { ...w, weight: newWeight } : w
    );
    setWeights(updated);
    onWeightChange?.(updated);
  };

  const total = weights.reduce((sum, w) => sum + w.weight, 0);

  return (
    <div>
      <h3>因子权重调整</h3>
      {weights.map(w => (
        <div key={w.id} style={{ marginBottom: '1rem' }}>
          <div>{w.name} ({w.id})</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={w.weight}
            onChange={e => handleWeightChange(w.id, parseFloat(e.target.value))}
          />
          <span>{(w.weight * 100).toFixed(1)}%</span>
        </div>
      ))}
      <div>
        <strong>总权重: {(total * 100).toFixed(1)}%</strong>
        {Math.abs(total - 1) > 0.01 && (
          <span style={{ color: 'red', marginLeft: 10 }}>⚠ 权重总和不为100%</span>
        )}
      </div>
    </div>
  );
};

export default Factor01Adjuster; */
