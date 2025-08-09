import React, { useState } from 'react';

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
    // 可以提交到父组件或后端
    console.log({
      rebalanceFreq,
      maxPositionPerChase,
      riskFreeRatio,
      positionLimit,
      commission,
      slip
    });
  };

  return (
    <form className='text-blod bg-lightGreen' onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>投资组合约束设置</h2>
      <div>
        <label>调仓频率：</label>
        <select
          value={rebalanceFreq}
          onChange={e => setRebalanceFreq(e.target.value)}
        >
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
          <option value="quarterly">每季度</option>
        </select>
      </div>
      <div>
        <label>单个资产最大占比（%）：</label>
        <input
          type="number"
          min={0}
          max={100}
          value={maxPositionPerChase}
          onChange={e => setMaxPositionPerChase(Number(e.target.value))}
        />
      </div>
      <div>
        <label>无风险资产比例（%）：</label>
        <input
          type="number"
          min={0}
          max={100}
          value={riskFreeRatio}
          onChange={e => setRiskFreeRatio(Number(e.target.value))}
        />
      </div>
      <div>
        <label>持仓数量上限：</label>
        <input
          type="number"
          min={1}
          value={positionLimit}
          onChange={e => setPositionLimit(Number(e.target.value))}
        />
      </div>
      <div>
        <label>佣金（%）：</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={commission}
          onChange={e => setCommission(Number(e.target.value))}
        />
      </div>
      <div>
        <label>滑点比例（%）：</label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={slip}
          onChange={e => setSlip(Number(e.target.value))}
        />
      </div>
      <button type="submit">提交</button>
    </form>
  );
};

export default PortfolioConstraintForm;