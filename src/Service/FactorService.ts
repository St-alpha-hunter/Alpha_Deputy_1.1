import axios from 'axios';
import {handleError} from '../Helpers/ErrorHandler';

class FactorSelectionModel {
    name: string;
    weight: number;
    CodeCompute: string;
    CodeKey: string;

    constructor(name: string, weight: number, CodeCompute: string, CodeKey: string) {
        this.name = name;
        this.weight = weight;
        this.CodeCompute = CodeCompute;
        this.CodeKey = CodeKey;
    }
}
export interface FactorSelectionResponse {
  session_id: string;
  // 其它字段...
}

//const ziplineBase = import.meta.env.VITE_ZIPLINE_BASE;
const api = `${import.meta.env.VITE_ZIPLINE_BASE}/factor_selection`;

export const FactorSelectionForm = async (data: FactorSelectionModel[]): Promise<FactorSelectionResponse> => {
    try {
        const response = await axios.post<FactorSelectionResponse>(api, { selectedFactors: data });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};




export { FactorSelectionModel };