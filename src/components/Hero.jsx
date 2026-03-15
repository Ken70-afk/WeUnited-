import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Hero.css';
import bannerBg from '../assets/weunited_banner.jpg';

const Hero = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState(1243);

    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineUsers(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                return prev + change > 1000 ? prev + change : 1000;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero" style={{ backgroundImage: `url(${bannerBg})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content container">

                {/* Left Column: CTA Card */}
                <div className="hero-left animate-fade-in-up">
                    <div className="registration-card">
                        <div className="card-header">
                            <h2>{user ? `Welcome back, ${user.firstName || 'there'}! 👋` : 'Find Your Perfect Match'}</h2>
                        </div>
                        <div className="card-body">
                            {user ? (
                                /* ── Logged-in state ── */
                                <div style={{ padding: '0.5rem 0 1rem' }}>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                                        Ready to find your perfect match? Pick up right where you left off.
                                    </p>
                                    <button
                                        onClick={() => navigate('/profiles')}
                                        className="btn-register"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '0.75rem' }}
                                    >
                                        Browse Matches →
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="btn-register"
                                        style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)' }}
                                    >
                                        Edit My Profile
                                    </button>
                                </div>
                            ) : (
                                /* ── Logged-out state: stylised CTA ── */
                                <div className="hero-cta-body">
                                    <p className="hero-cta-desc">
                                        Join <strong>10,000+</strong> verified members across <strong>50+ communities</strong> who found their forever match.
                                    </p>

                                    <ul className="hero-cta-perks">
                                        <li><ShieldCheck size={16} /> ID-verified profiles only</li>
                                        <li><Globe size={16} /> Matches across 50+ communities</li>
                                    </ul>

                                    <button
                                        className="hero-register-btn"
                                        onClick={() => navigate('/register')}
                                    >
                                        <span className="hero-register-btn-text">REGISTER FREE</span>
                                        <span className="hero-register-btn-icon"><ArrowRight size={20} /></span>
                                        <span className="hero-register-btn-shimmer" />
                                    </button>

                                    <p className="hero-login-hint">
                                        Already a member? <span onClick={() => navigate('/login')}>Log in</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Hero Text */}
                <div className="hero-right animate-fade-in-up delay-200">
                    <h1 className="hero-headline">
                        Begin your journey to a <span className="highlight-text">lifetime</span> of happiness!
                    </h1>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <ShieldCheck size={28} className="stat-icon" />
                            <div className="stat-details">
                                <span className="stat-number">10k+</span>
                                <span className="stat-label">Verified Profiles</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <Globe size={28} className="stat-icon" />
                            <div className="stat-details">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Communities Served</span>
                            </div>
                        </div>
                        <div className="stat-item live-stat">
                            <div className="live-indicator">
                                <span className="pulse-dot"></span>
                            </div>
                            <div className="stat-details">
                                <span className="stat-number">{onlineUsers.toLocaleString()}</span>
                                <span className="stat-label">Users Online Now</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
