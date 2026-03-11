import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    // In a real app with Stripe Webhooks, the backend would have upgraded the user.
    // Here, we just celebrate.

    return (
        <div className="success-container animate-fade-in">
            <div className="success-card animate-fade-in-up">
                <div className="success-icon-wrapper">
                    <div className="success-icon">
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                </div>

                <h1 className="success-headline">Payment Successful!</h1>
                <p className="success-message">
                    Welcome to <strong>WeUnited Plus</strong>. Your profile has been upgraded to Premium status, giving you priority placement and unrestricted access to contact thousands of verified matches.
                </p>

                <div className="success-receipt">
                    <div className="receipt-row">
                        <span>Amount Paid</span>
                        <strong>$39.00 USD</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Plan</span>
                        <span>Plus (Monthly)</span>
                    </div>
                    <div className="receipt-row">
                        <span>Transaction ID</span>
                        <span className="mono">txn_mock_893274982</span>
                    </div>
                </div>

                <div className="success-actions">
                    <button className="btn-dashboard" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                    <button className="btn-receipt">
                        Download Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
