import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, LogOut } from 'lucide-react';

const Suspended = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.status !== 'suspended') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: '#1f2937', marginBottom: '1rem' }}>Account Suspended</h1>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', marginBottom: '2rem', lineHeight: '1.6' }}>
                Your account has been temporarily or permanently suspended due to a violation of our community guidelines. 
                If you believe this is a mistake, please contact our support team.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="mailto:support@weunited.com" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
                    Contact Support
                </a>
                <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Suspended;
