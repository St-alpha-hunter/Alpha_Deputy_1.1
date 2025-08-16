import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { PortfolioConstraint } from '../../Service/Constraint';
import { PortfolioConstraintModel } from '../../Service/Constraint';

type Props = {};


const PortfolioConstraintForm = (props: Props) => {
  const [rebalanceFreq, setRebalanceFreq] = useState<string>('monthly');
  const [maxPositionPerChase, setMaxPositionPerChase] = useState<number>(10);
  const [riskFreeRatio, setRiskFreeRatio] = useState<number>(0);
  const [positionLimit, setPositionLimit] = useState<number>(20);
  const [commission, setCommission] = useState<number>(0.1);
  const [slip, setSlip] = useState<number>(0.05);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const constraint = new PortfolioConstraintModel(
    rebalanceFreq,
    maxPositionPerChase,
    riskFreeRatio,
    positionLimit,
    commission,
    slip
  );
  PortfolioConstraint(constraint)
    .then((res) => {
      if (res) {
        toast.success("Constraint submit successfully");
      }
    })
    .catch((e) => {
      toast.error("Constraint submit failed: " + e.message);
    });
};

  return (
    <form className='text-blod bg-gray-200 rounded-lg m-1 p-5 space-y-6' onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Portfolio Constraint Settings</h2>
      <div>
        <label>Rebalance Frequency:</label>
        <select
          value={rebalanceFreq}
          onChange={e => setRebalanceFreq(e.target.value)}
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
          <option value="quarterly">quarterly</option>
        </select>
      </div>
      <div>
        <label>max position per chase (%):</label>
        <input
          type="number"
          min={0}
          max={100}
          value={maxPositionPerChase}
          onChange={e => setMaxPositionPerChase(Number(e.target.value))}
        />
      </div>
      <div>
        <label>risk-free asset ratio (%):</label>
        <input
          type="number"
          min={0}
          max={100}
          value={riskFreeRatio}
          onChange={e => setRiskFreeRatio(Number(e.target.value))}
        />
      </div>
      <div>
        <label>position limit:</label>
        <input
          type="number"
          min={1}
          value={positionLimit}
          onChange={e => setPositionLimit(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Commission (%):</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={commission}
          onChange={e => setCommission(Number(e.target.value))}
        />
      </div>
      <div>
        <label>slippage (%)：</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={slip}
          onChange={e => setSlip(Number(e.target.value))}
        />
      </div>
      <button type="submit" className='bg-red-500 text-white rounded-lg p-2'>Start Backtest</button>
    </form>
  );
};

export default PortfolioConstraintForm;