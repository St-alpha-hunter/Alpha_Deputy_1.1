import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/features/store';
import type { FactorProps } from '../Factor/Factor';
import { setFactorWeight } from '../../redux/features/Factors/factorSlice';
import Factor from '../Factor/Factor';
import { FactorSelectionForm } from '../../Service/FactorService';
import type { FactorSelectionModel } from '../../Service/FactorService';
import { toast } from 'react-toastify';
import { setSessionId } from "../../redux/features/auth/authSlice";


import type { StrategySpecV0 } from "../../Models/strategySpecV0";


// interface Props {
//     onWeightChange: (e:FactorProps[]) => void
// }

// type Props = {
//     spec: StrategySpecV0;
//     setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
// }
//发生冲突，开始重构


type FactorRow = FactorProps[]; // 你原来的 FactorProps[]，看你实际名字

type NewFactorAdjusterProps = {
  spec: StrategySpecV0;
  setSpec: React.Dispatch<React.SetStateAction<StrategySpecV0>>;
  onWeightChange: (rows: FactorRow) => void; 
};


const NewFactorAdjuster = ( { spec, setSpec, onWeightChange }: NewFactorAdjusterProps ) => {
      const dispatch = useDispatch();
      const selectedFactors = useSelector(
        (state: RootState) => state.factor.selectedFactors
      );

      const sum = selectedFactors.reduce((acc, f) => acc + (f.weight ?? 0), 0);

      useEffect(() => {
      if (selectedFactors.length === 0) return;

      const needInit = selectedFactors.some(f => f.weight == null);
      if (!needInit) return;

      const avg = 1 / selectedFactors.length;
      selectedFactors.forEach(f => {
        const w = f.weight == null ? avg : f.weight;
        dispatch(setFactorWeight({ code_key: f.code_key, weight: w }));
      });

    }, []);


      const handleWeightChange = (id: string, newWeight: number) => {
        const clamped = Math.max(0, Math.min(1, newWeight)); // 防守式约束
        const others = selectedFactors.filter(f => f.id !== id);

        const remain = Math.max(0, 1 - clamped);
        const othersSum = others.reduce((s, f) => s + (f.weight ?? 0), 0);

        const updated = selectedFactors.map(f => {
          if (f.id === id) return { ...f, weight: clamped };

          const base = othersSum > 0 ? ((f.weight ?? 0) / othersSum) : (1 / (others.length || 1));
          return { ...f, weight: remain * base };
        });

  
        updated.forEach(f => {
          dispatch(setFactorWeight({ code_key: f.code_key, weight: f.weight! }));
        });


      };




    const total = selectedFactors.reduce((sum, f) => sum + (f?.weight ?? 0), 0);

    //   const handleSubmit = async(e: React.FormEvent) => {
    //     e.preventDefault();

    //     const data: FactorSelectionModel[] = selectedFactors.map(f => ({
    //       name: f.name ?? "",
    //       weight: f.weight ?? 0,
    //       CodeCompute: f.computeCode,
    //       CodeKey: f.code_key as string,
    //     }));

    //     try {
        
    //     //等待后端从数据库取出来的，返回的因子
    //       const res = await FactorSelectionForm(data);
    //       toast.success("Factors submitted successfully!");
    //       console.log("Submitted Factors:", res);

    //       // 如果后端返回 session_id，可以在这里处理
    //       if (res?.session_id) {
    //         dispatch(setSessionId(res.session_id));
    //         localStorage.setItem("session_id", res.session_id);
    //       }
    //     } catch {
    //       toast.error("Failed to submit factors.");
    //     }
    //   };

      return (
        
         
           

            <div className='bg-slate-100 p-4 rounded-3xl flex flex-wrap ml-5 mt-5 w-full text-center'>
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
                <div>
                    <strong className='ml-5 text-gray-100'>Total Weights: {(total * 100).toFixed(1)}%</strong>
                          {Math.abs(total - 1) > 0.01 && (
                      <span style={{ color: 'red', marginLeft: 10 }}>⚠ Total Occupy is not equal to 100%</span>
                  )}
              </div>
            </div>

        
      );
    }


export default NewFactorAdjuster; 



