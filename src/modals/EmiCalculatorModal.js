import { CoPresent } from '@mui/icons-material';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';

const EmiCalculatorModal = () => {

  const [loanAmount, setLoanAmount] = useState(50); // in Lakhs
  const [loanUnit, setLoanUnit] = useState('lakhs'); // 'lakhs' or 'crores'
  const [interestRate, setInterestRate] = useState(8); // in Percentage
  const [loanTenure, setLoanTenure] = useState(20); // in Years
  const [tenureUnit, setTenureUnit] = useState('years'); // 'years' or 'months'

  const calculateEMI = (amount, rate, tenure, tenureUnit) => {
    const principal = loanUnit === 'crores' ? amount * 10000000 : amount * 100000;
    const numberOfMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return emi.toFixed(2);
  };

  return (
    <div className="calculator-container">
      <Row className="calculator-container-row">
        <Col md={2}>
          <div className='calculator-title'>
              <h3>EMI Calculator</h3>
          </div>          
        </Col>
        <Col md={8}>
          <div className="slider-container">

            <label>Loan Amount ({loanUnit === 'lakhs' ? 'in Lakhs' : 'in Crores'})</label>           
            <div className='emi-calculator-radio'>
              <label>
                <input
                  type="radio"
                  value="lakhs"
                  checked={loanUnit === 'lakhs'}
                  onChange={(e) => setLoanUnit(e.target.value)}
                />
                Lakhs
              </label>
              <label>
                <input
                  type="radio"
                  value="crores"
                  checked={loanUnit === 'crores'}
                  onChange={(e) => setLoanUnit(e.target.value)}
                />
                Crores
              </label>
            </div>
            <span>{loanAmount} {loanUnit === 'lakhs' ? 'Lakhs' : 'Crores'}</span>
          </div>
          <div>
            <input
              type="range"
              min="1"
              max="100"
              step="0.1"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <div className="slider-container">
            <label>Interest Rate (%)</label>
            <span>{interestRate}%</span>
          </div>
          <div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          <div className="slider-container">
            <label>Loan Tenure ({tenureUnit === 'years' ? 'in Years' : 'in Months'})</label>            
            <div className='emi-calculator-radio'>
              <label>
                <input
                  type="radio"
                  value="years"
                  checked={tenureUnit === 'years'}
                  onChange={(e) => setTenureUnit(e.target.value)}
                />
                Years
              </label>
              <label>
                <input
                  type="radio"
                  value="months"
                  checked={tenureUnit === 'months'}
                  onChange={(e) => setTenureUnit(e.target.value)}
                />
                Months
              </label>
            </div>
            <span>{loanTenure} {tenureUnit === 'years' ? 'Years' : 'Months'}</span>
          </div>
          <div>
            <input
              type="range"
              min="1"
              max={tenureUnit === 'years' ? "30" : "360"}
              value={loanTenure}
              onChange={(e) => setLoanTenure(e.target.value)}
            />
          </div>
        </Col>
        <Col md={2}>
          <div className="emi-result">
            <h2>EMI Amount </h2>
            <h4>₹ {calculateEMI(loanAmount, interestRate, loanTenure, tenureUnit)}</h4>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default EmiCalculatorModal;
