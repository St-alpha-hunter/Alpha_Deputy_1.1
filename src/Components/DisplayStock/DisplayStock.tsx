import React from 'react';




type Props = {
  selected_stocks: string[];
};


const DisplayStock: React.FC<Props> = ({ selected_stocks }) => (
  <div >
    <div className='font-bold text-lg mb-4 text-red-950'>The Results Of Choosing Stocks</div>
      <div className='bg-gray-100 p-4 rounded flex flex-wrap m-10 min-h-40'>
      
          {selected_stocks.map((symbol, idx) => (
            <div className='border h-10 p-2 m-4 rounded-lg bg-lightGreen text-font' key={idx}>{symbol}</div>
          ))}
        
      </div>
  </div>
);

export default DisplayStock;