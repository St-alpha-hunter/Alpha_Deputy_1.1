import React, { useState } from 'react';
import { toast } from 'react-toastify';
import  { StockSelectionForm } from '../../Service/StockSelection';
import { StockSelectionModel } from '../../Service/StockSelection';


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
    const data = new StockSelectionModel(
      poolSize,
      selectedIndustries,
      maxIndustryExposure
    );
    StockSelectionForm(data)
      .then((res) => {
        if (res) {
          toast.success("Stock selection submitted successfully!");
        }
      })
      .catch((error) => {
        toast.error("Failed to submit stock selection: " + error.message);
      });
  };


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }} className='bg-gray-200 p-5 m-1 rounded-xl'>
      <h3>Step 2: Selecting Stocks</h3>
      <div>
        <label> Numbers of Stock：</label>
        <input
          type="number"
          min={1}
          value={poolSize}
          onChange={e => setPoolSize(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Selected Industries:</label>
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
        <label>max industry exposure (%):</label>
        <input
          type="number"
          min={0}
          max={100}
          value={maxIndustryExposure}
          onChange={e => setMaxIndustryExposure(Number(e.target.value))}
        />
      </div>
      <button type="submit" className='bg-red-500 text-white rounded-lg p-2'>Start Choosing Stocks</button>
    </form>
  );
};

export default StockSelection;