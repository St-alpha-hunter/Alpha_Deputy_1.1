import axios from "axios";
import { handleError } from "../Helpers/ErrorHandler";

class PortfolioConstraintModel {
    rebalanceFreq: string;
    maxPositionPerChase: number;
    riskFreeRatio: number;
    positionLimit: number;
    commission: number;
    slip: number;

    constructor(
        rebalanceFreq: string,
        maxPositionPerChase: number,
        riskFreeRatio: number,
        positionLimit: number,
        commission: number,
        slip: number
    ) {
        this.rebalanceFreq = rebalanceFreq;
        this.maxPositionPerChase = maxPositionPerChase;
        this.riskFreeRatio = riskFreeRatio;
        this.positionLimit = positionLimit;
        this.commission = commission;
        this.slip = slip;
    }
}
   
const api = "http://localhost:8000/portfolio_constraint"

export const PortfolioConstraint = async (data: PortfolioConstraintModel) => {
    try {
        const response = await axios.post(api, data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export { PortfolioConstraintModel };