// store/factorSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FactorProps } from '../../../Components/Factor/Factor';

interface FactorState {
  selectedFactors: FactorProps[];
}

const initialState: FactorState = {
  selectedFactors: [],
};

const factorSlice = createSlice({
  name: 'factor',
  initialState,
  reducers: {

    addFactor(state, action: PayloadAction<FactorProps>) {
      const exists = state.selectedFactors.some(f => f.id === action.payload.id);
      if (!exists) {
        state.selectedFactors.push(action.payload);
      }
    },

    removeFactor(state, action: PayloadAction<string>) {
      state.selectedFactors = state.selectedFactors.filter(f => f.id !== action.payload);
    },

    setFactorWeight(state, action: PayloadAction<{ id: string; weight: number }>) {
      const factor = state.selectedFactors.find(f => f.id === action.payload.id);
      if (factor) {
        factor.weight = action.payload.weight;
      }
    },

    clearFactors(state) {
      state.selectedFactors = [];
    }

  }
});

export const { addFactor, removeFactor, clearFactors, setFactorWeight} = factorSlice.actions;
export default factorSlice.reducer;
