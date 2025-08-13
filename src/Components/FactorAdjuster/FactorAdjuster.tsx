import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/features/store';
import type { FactorProps } from '../Factor/Factor';
import { setFactorWeight } from '../../redux/features/Factors/factorSlice';
import Factor from '../Factor/Factor';
import { FactorSelectionForm } from '../../Service/FactorService';
import type { FactorSelectionModel } from '../../Service/FactorService';
import { toast } from 'react-toastify';



interface Props {
    onWeightChange: (e:FactorProps[]) => void
}


const FactorAdjuster = ( onWeightChange : Props ) => {
      const dispatch = useDispatch();
      const selectedFactors = useSelector(
        (state: RootState) => state.factor.selectedFactors
      );
      // 初始化平均权重
      //const [weight ,setWeight] = useState<FactorProps[]>([]);
      
      const sum = selectedFactors.reduce((acc, f) => acc + (f.weight ?? 0), 0);

      useEffect(() => {
      if (selectedFactors.length === 0) return;

      const needInit = selectedFactors.some(f => f.weight == null);
      if (!needInit) return;

      const avg = 1 / selectedFactors.length;
      selectedFactors.forEach(f => {
        const w = f.weight == null ? avg : f.weight;
        dispatch(setFactorWeight({ id: f.id, weight: w }));
      });
      // 这里不加依赖；如果依赖 selectedFactors，会重复平均。根据你的业务改成合适的依赖。
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

      //const factorIdsKey = selectedFactors.map(f => f.weight);
      // 初始化或重新计算平均权重
      // useEffect(() => {
      //   if (selectedFactors.length > 0) {
      //     const avgWeight = 1 / selectedFactors.length;
      //     selectedFactors.forEach( f => {
      //       dispatch(setFactorWeight({ id: f.id, weight: avgWeight}));
      //     });
      //   }
      // }, []);

      // const handleWeightChange = (id: string, newWeight: number) => {
      //   dispatch(setFactorWeight({ id, weight: newWeight }));
      // };

      // 按比例重分配的权重调整
      const handleWeightChange = (id: string, newWeight: number) => {
        const clamped = Math.max(0, Math.min(1, newWeight)); // 防守式约束
        const others = selectedFactors.filter(f => f.id !== id);

        const remain = Math.max(0, 1 - clamped);
        const othersSum = others.reduce((s, f) => s + (f.weight ?? 0), 0);

        const updated = selectedFactors.map(f => {
          if (f.id === id) return { ...f, weight: clamped };

          // 如果其余因子原本总和为0，就均分；否则按原比例缩放
          const base = othersSum > 0 ? ((f.weight ?? 0) / othersSum) : (1 / (others.length || 1));
          return { ...f, weight: remain * base };
        });

        // 批量更新Redux仓库
        updated.forEach(f => {
          dispatch(setFactorWeight({ id: f.id, weight: f.weight! }));
        });

        // 需要的话把 updated 回传给父组件
        // onWeightChange?.(updated);
      };


 //     const total = selectedFactors
 //     .map(f => f.weight)
//    .reduce((sum, weight) => sum + weight, 0);

    const total = selectedFactors.reduce((sum, f) => sum + (f?.weight ?? 0), 0);
//??空值合并运算符（Nullish Coalescing),只有左侧结果为 null 或 
// undefined 时，才返回右侧的默认值；否则返回左侧值


      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data: FactorSelectionModel[] = selectedFactors.map(f => ({
          name: f.name ?? "",
          weight: f.weight ?? 0,
          code: f.code as string,
        }));

        FactorSelectionForm(data)
          .then(response => {
            toast.success("Factors submitted successfully!");
          })
          .catch(error => {
            toast.error("Failed to submit factors.");
          });
      };

      return (
        <div>
           <h3>Modify Factors' Weight</h3>
           <form onSubmit={handleSubmit}>
            <div className='bg-gray-100 p-4 rounded flex flex-wrap m-10'>
              {selectedFactors.map(f => (
                <div key={f.id} style={{ marginBottom: '1rem' }} className='flex flex-row justify-around p-2'>
                  <div className='flex flex-row'>

                    <div className=' flex flex-col p-3'>
                        <Factor  key={f.id} {...f} />
                          <div className='text-black'>{f.name}</div>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={f.weight ?? 0}
                                    onChange={e => handleWeightChange(f.id, parseFloat(e.target.value))}
                                />
                    </div>

                    <div>
                        <span>{( (f?.weight ?? 0) * 100).toFixed(1)}%</span>
                    </div>

                      </div>
                </div>
              ))}
              <button type="submit" className='bg-red-500 text-white rounded-lg p-2'>Confirm My Factors</button>
            </div>
          </form>


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
