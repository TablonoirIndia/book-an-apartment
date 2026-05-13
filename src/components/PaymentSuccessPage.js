// // PaymentSuccessPage.js
// import React from 'react';
// import { Link } from 'react-router-dom';

// function PaymentSuccessPage() {
//     return (
//         <div style={{ textAlign: 'center', marginTop: '50px' }}>
//             <h1>Payment Successful!</h1>
//             <p>Thank you for your payment. Your transaction has been successfully processed.</p>
//             <Link to="/">Go Back to Home</Link>
//         </div>
//     );
// }

// export default PaymentSuccessPage;


// PaymentSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/PaymentSuccessPage.css';

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Get transaction details from location state (if passed)
  const transactionDetails = location.state || {
    transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    amount: '₹0.00',
    date: new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    paymentMethod: 'Online Payment'
  };

  // Get primary color from CSS variable
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim() || '#c9a96e';

  // Generate confetti effect
  useEffect(() => {
    if (showConfetti) {
      const confettiCount = 100;
      const container = document.createElement('div');
      container.className = 'success-confetti';
      document.body.appendChild(container);

      for (let i = 0; i < confettiCount; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = 2 + Math.random() * 2 + 's';
        piece.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        piece.style.width = Math.random() * 8 + 4 + 'px';
        piece.style.height = Math.random() * 8 + 4 + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(piece);
      }

      // Remove confetti after animation
      const timer = setTimeout(() => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 4000);

      return () => {
        clearTimeout(timer);
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };
    }
  }, [showConfetti]);

  // Auto redirect to dashboard after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-page">
      <div className="success-card">
        {/* Success Icon with animation */}
        <div className="success-icon">🎉</div>
        
        {/* Success Message */}
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Thank you for your payment. Your transaction has been successfully processed.
          {!transactionDetails.transactionId?.startsWith('TXN') && 
            " A confirmation email has been sent to your registered email address."}
        </p>

        {/* Transaction Details */}
        <div className="success-details">
          <div className="success-detail-row">
            <span className="success-detail-label">Transaction ID</span>
            <span className="success-detail-value">{transactionDetails.transactionId}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Amount Paid</span>
            <span className="success-detail-highlight">{transactionDetails.amount}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Date & Time</span>
            <span className="success-detail-value">{transactionDetails.date}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Payment Method</span>
            <span className="success-detail-value">{transactionDetails.paymentMethod}</span>
          </div>
          <div className="success-detail-row">
            <span className="success-detail-label">Status</span>
            <span className="success-detail-value" style={{ color: '#22c55e', fontWeight: 700 }}>
              ✓ Completed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <Link to="/dashboard" className="success-btn success-btn-primary">
            📊 Go to Dashboard →
          </Link>
          <Link to="/" className="success-btn success-btn-secondary">
            🏠 Back to Home
          </Link>
        </div>

        {/* Footer with additional info */}
        <div className="success-footer">
          <p>
            Need help? <a href="/contact" className="success-footer-link">Contact Support</a>
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            You will be redirected to dashboard in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;