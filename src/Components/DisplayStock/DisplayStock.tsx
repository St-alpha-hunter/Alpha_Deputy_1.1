import React from 'react';

type Props = {
  selected_stocks: string[];
};

const cardStyle: React.CSSProperties = {
  margin: "32px auto",
  padding: "24px 32px",
  maxWidth: "400px",
  background: "#f8f9fa",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 600,
  marginBottom: "18px",
  color: "#d32f2f",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const itemStyle: React.CSSProperties = {
  padding: "8px 0",
  borderBottom: "1px solid #eee",
  fontSize: "1.1rem",
  color: "#333",
};

const DisplayStock: React.FC<Props> = ({ selected_stocks }) => (
  <div style={cardStyle}>
    <div style={titleStyle}>The Results Of Choosing Stocks</div>
    <ul style={listStyle}>
      {selected_stocks.map(symbol => (
        <li key={symbol} style={itemStyle}>{symbol}</li>
      ))}
    </ul>
  </div>
);

export default DisplayStock;