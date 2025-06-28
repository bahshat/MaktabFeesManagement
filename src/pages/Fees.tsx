import React from 'react';

const Fees: React.FC = () => {

  const fees = [
    { id: 1, amount: 1000 },
    { id: 2, amount: 1500 },
    { id: 3, amount: 2000 },
    { id: 4, amount: 2500 },
  ];

  return (
    <div className="students">
      <h2>Fees List</h2>
      <p>ID     Amt</p>

      {fees.map((fee) => (
        <div key={fee.id} className="fee-item">
          <p>{fee.id} INR{fee.amount}</p>
        </div>
      ))}

    </div>
  );
};

export default Fees
