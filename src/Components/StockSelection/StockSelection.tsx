import React, { useState } from 'react';
import { toast } from 'react-toastify';
import  { StockSelectionForm } from '../../Service/StockSelection';
import { StockSelectionModel } from '../../Service/StockSelection';


type Props = {};

const industries = [
    "Advertising Agencies",
    "Aerospace & Defense",
    "Agricultural - Machinery",
    "Agricultural Farm Products",
    "Agricultural Inputs",
    "Airlines",
    "Airports & Air Services",
    "Aluminum",
    "Apparel - Footwear & Accessories",
    "Apparel - Manufacturers",
    "Apparel - Retail",
    "Asset Management",
    "Asset Management - Cryptocurrency",
    "Asset Management - Global",
    "Asset Management - Income",
    "Auto - Dealerships",
    "Auto - Manufacturers",
    "Auto - Parts",
    "Auto - Recreational Vehicles",
    "Banks",
    "Banks - Diversified",
    "Banks - Regional",
    "Beverages - Alcoholic",
    "Beverages - Non-Alcoholic",
    "Beverages - Wineries & Distilleries",
    "Biotechnology",
    "Broadcasting",
    "Business Equipment & Supplies",
    "Chemicals",
    "Chemicals - Specialty",
    "Coal",
    "Communication Equipment",
    "Computer Hardware",
    "Conglomerates",
    "Construction",
    "Construction Materials",
    "Consulting Services",
    "Consumer Electronics",
    "Copper",
    "Department Stores",
    "Discount Stores",
    "Diversified Utilities",
    "Drug Manufacturers - General",
    "Drug Manufacturers - Specialty & Generic",
    "Education & Training Services",
    "Electrical Equipment & Parts",
    "Electronic Gaming & Multimedia",
    "Engineering & Construction",
    "Entertainment",
    "Financial - Capital Markets",
    "Financial - Conglomerates",
    "Financial - Credit Services",
    "Financial - Data & Stock Exchanges",
    "Financial - Diversified",
    "Financial - Mortgages",
    "Food Confectioners",
    "Food Distribution",
    "Furnishings, Fixtures & Appliances",
    "Gambling",
    "Resorts & Casinos",
    "General Transportation",
    "General Utilities",
    "Gold",
    "Grocery Stores",
    "Hardware, Equipment & Parts",
    "Home Improvement",
    "Household & Personal Products",
    "Independent Power Producers",
    "Industrial - Distribution",
    "Industrial - Infrastructure Operations",
    "Industrial - Machinery",
    "Industrial - Pollution & Treatment Controls",
    "Industrial - Specialties",
    "Industrial Materials",
    "Information Technology Services",
    "Insurance - Brokers",
    "Insurance - Diversified",
    "Insurance - Life",
    "Insurance - Property & Casualty",
    "Insurance - Reinsurance",
    "Insurance - Specialty",
    "Integrated Freight & Logistics",
    "Internet Content & Information",
    "Investment - Banking & Investment Services",
    "Leisure",
    "Luxury Goods",
    "Manufacturing - Metal Fabrication",
    "Manufacturing - Miscellaneous",
    "Manufacturing - Textiles",
    "Manufacturing - Tools & Accessories",
    "Marine Shipping",
    "Media & Entertainment",
    "Medical - Care Facilities",
    "Medical - Devices",
    "Medical - Diagnostics & Research",
    "Medical - Distribution",
    "Medical - Equipment & Services",
    "Medical - Healthcare Information Services",
    "Medical - Healthcare Plans",
    "Medical - Instruments & Supplies",
    "Medical - Pharmaceuticals",
    "None",
    "Oil & Gas Drilling",
    "Oil & Gas Energy",
    "Oil & Gas Equipment & Services",
    "Oil & Gas Exploration & Production",
    "Oil & Gas Integrated",
    "Oil & Gas Midstream",
    "Oil & Gas Refining & Marketing",
    "Other Precious Metals",
    "Packaged Foods",
    "Packaging & Containers",
    "Paper, Lumber & Forest Products",
    "Personal Products & Services",
    "Publishing",
    "Railroads",
    "Real Estate - Development",
    "Real Estate - Diversified",
    "Real Estate - General",
    "Real Estate - Services",
    "Regulated Electric",
    "Regulated Gas",
    "Regulated Water",
    "REIT - Diversified",
    "REIT - Healthcare Facilities",
    "REIT - Hotel & Motel",
    "REIT - Industrial",
    "REIT - Mortgage",
    "REIT - Office",
    "REIT - Residential",
    "REIT - Retail",
    "REIT - Specialty",
    "Renewable Utilities",
    "Rental & Leasing Services",
    "Residential Construction",
    "Restaurants",
    "Security & Protection Services",
    "Semiconductors",
    "Shell Companies",
    "Silver",
    "Software - Application",
    "Software - Infrastructure",
    "Software - Services",
    "Solar",
    "Specialty Business Services",
    "Specialty Retail",
    "Staffing & Employment Services",
    "Steel",
    "Technology Distributors",
    "Telecommunications Services",
    "Tobacco",
    "Travel Lodging",
    "Travel Services",
    "Trucking",
    "Uranium",
    "Waste Management"
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
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto' }} className='bg-gray-200 p-5 m-1 rounded-xl'>
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
        <div style = {{maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', padding: '4px', marginBottom: '8px' }}>
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