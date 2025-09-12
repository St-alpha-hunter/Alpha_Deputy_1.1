import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";

class PortfolioConstraintModel {
    rebalanceFreq: string;
    maxPositionPerChase: number;
    riskFreeRatio: number;
    positionLimit: number;
    commission: number;
    slip: number;
    session_id: string;

    constructor(
        rebalanceFreq: string,
        maxPositionPerChase: number,
        riskFreeRatio: number,
        positionLimit: number,
        commission: number,
        slip: number,
        session_id: string
    ) {
        this.rebalanceFreq = rebalanceFreq;
        this.maxPositionPerChase = maxPositionPerChase;
        this.riskFreeRatio = riskFreeRatio;
        this.positionLimit = positionLimit;
        this.commission = commission;
        this.slip = slip;
        this.session_id = session_id;
    }
}

export class BacktestResponse {
    session_id: string;
    results: any;

    constructor(session_id: string, results: any) {
        this.session_id = session_id;
        this.results = results;
    }
}
   
//const ziplineBase = import.meta.env.VITE_ZIPLINE_BASE;
const api = `${import.meta.env.VITE_ZIPLINE_BASE}/portfolio_constraint`;

export const PortfolioConstraint = async (data: PortfolioConstraintModel) => {
    try {
        const response = await axios.post(api, data, { params: { 'session_id': data.session_id } });
        return response.data as BacktestResponse;
    } catch (error) {
        handleError(error);
    }
};

export { PortfolioConstraintModel };