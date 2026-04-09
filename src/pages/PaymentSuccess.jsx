import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Download } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        if (!sessionId) {
            setLoading(false);
            // If they just navigated here without a session ID, we don't fetch data, just show default celebrating page
            return;
        }

        const fetchSession = async () => {
            try {
                const res = await fetch(`http://localhost:4242/checkout-session?session_id=${sessionId}`);
                if (!res.ok) throw new Error("Could not retrieve session details.");
                const data = await res.json();
                setSessionData(data);
            } catch (err) {
                console.error("Fetch session err:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="success-container loading-container">
                <Loader2 className="spinner-large" size={48} color="var(--primary)" />
                <p>Retrieving your payment details...</p>
            </div>
        );
    }

    // Determine details
    const amount = sessionData && sessionData.amount_total 
        ? `$${(sessionData.amount_total / 100).toFixed(2)} ${sessionData.currency.toUpperCase()}` 
        : "$49.00 CAD";
        
    const planName = sessionData && sessionData.amount_total === 2900 ? 'Basic (Monthly)' : 'Premium (2 Months)';
    const txnId = sessionData ? sessionData.payment_intent?.id : 'txn_mock_893274982';
    const receiptUrl = sessionData ? sessionData.payment_intent?.latest_charge?.receipt_url : null;

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
                        <strong>{amount}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Plan</span>
                        <span>{planName}</span>
                    </div>
                    {sessionData && (
                        <div className="receipt-row">
                            <span>Transaction ID</span>
                            <span className="mono">{txnId}</span>
                        </div>
                    )}
                </div>

                <div className="success-actions">
                    <button className="btn-dashboard outline" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </button>
                    {receiptUrl && (
                        <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="btn-receipt fill">
                            <Download size={18} /> Download Receipt
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
