import axios from 'axios';
import {handleError} from '../Helpers/ErrorHandler';

class FactorSelectionModel {
    name: string;
    weight: number;
    code: string;

    constructor(name: string, weight: number, code: string) {
        this.name = name;
        this.weight = weight;
        this.code = code;
    }
}

const api = "http://localhost:8000/factor_selection";

export const FactorSelectionForm = async (data: FactorSelectionModel[]) => {
    try {
        const response = await axios.post(api, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export { FactorSelectionModel };