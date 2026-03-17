import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';
import logoImg from '../assets/logo.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (email === 'admin@weunited.com' && password === 'admin123') {
            const adminData = {
                firstName: 'System',
                lastName: 'Administrator',
                email: 'admin@weunited.com',
                role: 'admin',
                id: 'admin_1'
            };
            login(adminData);
            navigate('/admin');
        } else {
            setError('Invalid administrator credentials.');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <img src={logoImg} alt="WeUnited Logo" className="admin-logo" />
                    <h2>Admin Portal</h2>
                    <p>Secure System Access</p>
                </div>

                {error && <div className="admin-error-message">{error}</div>}

                <form className="admin-login-form" onSubmit={handleLogin}>
                    <div className="admin-form-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@weunited.com"
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Admin Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="admin-auth-btn">Authorize Access</button>
                    
                    <div className="admin-back-link">
                        <button type="button" onClick={() => navigate('/')}>Return to Main Site</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
