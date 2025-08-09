import React, { useState } from 'react';

type Props = {};

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Consumer Electronics",
  "Energy",
  "Utilities",
  "Industrials",
  "Materials",
  "Real Estate",
  "Communication Services"
];

const StockSelection = (props: Props) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [poolSize, setPoolSize] = useState<number>(10);
  const [maxIndustryExposure, setMaxIndustryExposure] = useState<number>(50);

  const allSelected = selectedIndustries.length === industries.length;

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleAllChange = () => {
    setSelectedIndustries(allSelected ? [] : [...industries]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以提交数据到父组件或后端
    console.log({
      poolSize,
      selectedIndustries,
      maxIndustryExposure
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h3>股票筛选设置</h3>
      <div>
        <label>股票池子数量：</label>
        <input
          type="number"
          min={1}
          value={poolSize}
          onChange={e => setPoolSize(Number(e.target.value))}
        />
      </div>
      <div>
        <label>选择行业：</label>
        <div>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleAllChange}
          /> all
        </div>
        {industries.map(industry => (
          <div key={industry}>
            <input
              type="checkbox"
              checked={selectedIndustries.includes(industry)}
              onChange={() => handleIndustryChange(industry)}
            />
            {industry}
          </div>
        ))}
      </div>
      <div>
        <label>最大行业暴露（%）：</label>
        <input
          type="number"
          min={0}
          max={100}
          value={maxIndustryExposure}
          onChange={e => setMaxIndustryExposure(Number(e.target.value))}
        />
      </div>
      <button type="submit">提交</button>
    </form>
  );
};

export default StockSelection;