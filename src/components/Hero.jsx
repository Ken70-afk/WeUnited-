import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, Globe } from 'lucide-react';
import './Hero.css';
import bannerBg from '../assets/weunited_banner.jpg';

const Hero = () => {
    const navigate = useNavigate();
    const [isReturningUser, setIsReturningUser] = useState(false);
    const [userName, setUserName] = useState('');
    const [onlineUsers, setOnlineUsers] = useState(1243); // Initial mock number

    const [formData, setFormData] = useState({
        profileFor: '',
        name: '',
        countryCode: '+1',
        mobile: ''
    });

    useEffect(() => {
        const savedData = localStorage.getItem('onboardingData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.fullName) {
                    setUserName(parsed.fullName.split(' ')[0]); // Get first name
                    setIsReturningUser(true);
                }
            } catch (e) {
                console.error("Error parsing user data");
            }
        }

        // Live updating mock online user count
        const interval = setInterval(() => {
            setOnlineUsers(prev => {
                // Randomly fluctuate the number up or down a bit
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return prev + change > 1000 ? prev + change : 1000;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we could pass data or trigger OTP, but for the flow we go directly to onboarding 
        navigate('/onboarding');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <section className="hero" style={{ backgroundImage: `url(${bannerBg})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content container">

                {/* Left Column: Registration Card */}
                <div className="hero-left animate-fade-in-up">
                    <div className="registration-card">
                        <div className="card-header">
                            <h2>{isReturningUser ? 'Welcome Back!' : 'Create a Profile'}</h2>
                        </div>
                        <div className="card-body">

                            {isReturningUser ? (
                                <div style={{ textAlign: 'center', padding: '1rem 0 2rem' }}>
                                    <h3 style={{ color: 'var(--text-dark)', marginBottom: '1.5rem' }}>Ready to find your match, {userName}?</h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>You've already started your journey. Continue right where you left off.</p>
                                    <button
                                        onClick={() => navigate('/profiles')}
                                        className="btn-register"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                                    >
                                        Go to My Matches &rarr;
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="card-subtitle">Find your perfect match</h3>

                                    <form className="registration-form" onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <select
                                                name="profileFor"
                                                value={formData.profileFor}
                                                onChange={handleChange}
                                                required
                                                className="form-select"
                                            >
                                                <option value="" disabled>Profile created for</option>
                                                <option value="Self">Self</option>
                                                <option value="Son">Son</option>
                                                <option value="Daughter">Daughter</option>
                                                <option value="Brother">Brother</option>
                                                <option value="Sister">Sister</option>
                                                <option value="Relative">Relative</option>
                                                <option value="Friend">Friend</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter the name"
                                                required
                                                className="form-input"
                                            />
                                        </div>

                                        <div className="form-group mobile-group">
                                            <select
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleChange}
                                                className="form-select country-code"
                                            >
                                                <option value="+1">+1 (US/CA)</option>
                                                <option value="+44">+44 (UK)</option>
                                                <option value="+91">+91 (IN)</option>
                                                <option value="+61">+61 (AU)</option>
                                            </select>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                placeholder="Enter Mobile Number"
                                                required
                                                className="form-input mobile-input"
                                            />
                                        </div>

                                        <p className="otp-hint">OTP will be sent to this number</p>

                                        <button type="submit" className="btn-register">
                                            REGISTER FREE &rarr;
                                        </button>
                                    </form>

                                    <p className="terms-text">
                                        *By clicking register free, I agree to the <a href="#">T&amp;C</a> and <a href="#">Privacy Policy</a>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Hero Text */}
                <div className="hero-right animate-fade-in-up delay-200">
                    <h1 className="hero-headline">
                        Begin your journey to a <span className="highlight-text">lifetime</span> of happiness!
                    </h1>

                    {/* Stats Counter Row */}
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
