import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const saved = localStorage.getItem('profileDataFull');
        if (saved) {
            const profile = JSON.parse(saved);
            if (profile.email && profile.email.toLowerCase() === email.toLowerCase()) {
                login(profile);
                navigate('/profile');
                return;
            }
        }
        setError('No account found with that email. Please register first.');
    };

    return (
        <div className="auth-page">
            {/* Left decorative panel */}
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-logo-mark">💜</div>
                    <h2 className="auth-tagline">Welcome back — your match is waiting.</h2>
                    <p className="auth-sub">Log in to continue browsing verified profiles and managing your matches.</p>
                    <div className="auth-stats-row">
                        <div className="auth-stat">
                            <span className="auth-stat-num">10k+</span>
                            <span className="auth-stat-lbl">Verified Profiles</span>
                        </div>
                        <div className="auth-stat">
                            <span className="auth-stat-num">50+</span>
                            <span className="auth-stat-lbl">Communities</span>
                        </div>
                        <div className="auth-stat">
                            <span className="auth-stat-num">1k+</span>
                            <span className="auth-stat-lbl">Online Now</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-right animate-fade-in">
                <div className="auth-form-wrap">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-desc">Log in to continue your journey.</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </div>

                        <div className="auth-field">
                            <div className="auth-field-header">
                                <label htmlFor="password">Password</label>
                                <a href="#" className="auth-forgot">Forgot Password?</a>
                            </div>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>

                        <button type="submit" className="auth-btn">
                            Log In →
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Sign up free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
