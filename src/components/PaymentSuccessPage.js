// PaymentSuccessPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function PaymentSuccessPage() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment. Your transaction has been successfully processed.</p>
            <Link to="/">Go Back to Home</Link>
        </div>
    );
}

export default PaymentSuccessPage;
