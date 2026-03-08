import axios from 'axios';
import  { handleError } from '../Helpers/ErrorHandler';
import { PortfolioConstraint } from './Constraint';


//
// class ConsoleModel {
//     name: string;
//     universe: string;
//     dataVersion: string;

//     rebalanceFreq: string;
//     holidayPolicy: string

//     signalType: string;
//     inputs: string;
//     lookback: number;
//     lag: number;

//     topk: number;
//     weightSpec: string
//     initalCash: number;
//     targetCashWeight: number;

//     weight: number;

//     start: string;
//     end: string;
//     calendar: string;

//     priceType: string;
//     commission: number
//     slippageBps: number;
//     allowShort: boolean;

//     maxDrawdown: number;
//     maxPositionPerStock: number
//     maxTurnover: number;
//     maxleverage: number;
//     volTarget: number;

//     benchmark: string;

//     constructor(
//         name: string,
//         universe: string,
//         dataVersion: string,
//         rebalanceFreq: string,
//         holidayPolicy: string,
//         signalType: string,
//         inputs: string,
//         lookback: number,
//         lag: number,
//         topk: number,
//         weightSpec: string,
//         initalCash: number,
//         targetCashWeight: number,
//         weight:number,
//         start: string,
//         end: string,
//         calendar: string,
//         priceType: string,
//         commission: number,
//         slippageBps: number,
//         allowShort: boolean,
//         maxDrawdown: number,
//         maxPositionPerStock: number,
//         maxTurnover: number,
//         maxleverage: number,
//         volTarget: number,
//         benchmark: string
//     ){
//         this.name = name;
//         this.universe = universe;
//         this.dataVersion = dataVersion;
//         this.rebalanceFreq = rebalanceFreq; 
//         this.holidayPolicy = holidayPolicy;
//         this.signalType = signalType;
//         this.inputs = inputs;
//         this.lookback = lookback;
//         this.lag = lag;
//         this.topk = topk;
//         this.weightSpec = weightSpec;
//         this.initalCash = initalCash;
//         this.targetCashWeight = targetCashWeight;
//         this.weight = weight;
//         this.start = start;
//         this.end = end;
//         this.calendar = calendar;
//         this.priceType = priceType;
//         this.commission = commission;
//         this.slippageBps = slippageBps;
//         this.allowShort = allowShort;
//         this.maxDrawdown = maxDrawdown;
//         this.maxPositionPerStock = maxPositionPerStock;
//         this.maxTurnover = maxTurnover;
//         this.maxleverage = maxleverage;
//         this.volTarget = volTarget;
//         this.benchmark = benchmark;
//     }
// }

// //一致性怎么保证
//     export class BacktestResult {
//         name: string;
//         equityCurve: any;
//         tradeList: any;
//         sharp:any;
//         max_drawdown:any;

//         constructor(
//             name: string,
//             equityCurve: any,
//             tradeList: any,
//             sharp:any,
//             max_drawdown:any
//         ){
//             this.name = name;
//             this.equityCurve = equityCurve;
//             this.tradeList = tradeList;
//             this.sharp = sharp;
//             this.max_drawdown = max_drawdown;
//         }
//     }


    ///dispatch是取出Redux吗？