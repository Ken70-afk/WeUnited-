import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/* ── helpers ── */
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // step: 'form' | 'otp'
    const [step, setStep] = useState('form');
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');

    // OTP state
    const [sentOTP, setSentOTP] = useState('');
    const [enteredOTP, setEnteredOTP] = useState('');
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    };

    /* Step 1 — submit form → send (mock) OTP */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            setError('Please fill in all required fields.');
            return;
        }
        const otp = generateOTP();
        setSentOTP(otp);
        setEnteredOTP('');
        setOtpError('');
        setStep('otp');
        // In real app: POST to /api/send-otp. For now, show it in console.
        console.info(`[DEV] OTP for ${form.email}: ${otp}`);
        startResendCooldown();
    };

    const startResendCooldown = () => {
        setResendCooldown(30);
        const t = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(t); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = () => {
        const otp = generateOTP();
        setSentOTP(otp);
        console.info(`[DEV] Resent OTP for ${form.email}: ${otp}`);
        startResendCooldown();
        setOtpError('');
    };

    /* Step 2 — verify OTP → create profile */
    const handleOTPSubmit = (e) => {
        e.preventDefault();
        setOtpError('');
        if (enteredOTP.trim() !== sentOTP) {
            setOtpError('Incorrect OTP. Please try again.');
            return;
        }
        const newProfile = {
            firstName: form.firstName, middleName: '', lastName: form.lastName,
            email: form.email, phone: form.phone, gender: '', dob: '', height: '',
            weight: '', bioTags: '', community: '', religion: '', caste: '',
            qualification: '', job: '', income: '', location: '',
            familyInfo: '', hobbies: '', photos: [],
        };
        localStorage.setItem('profileDataFull', JSON.stringify(newProfile));
        login(newProfile);
        navigate('/onboarding');
    };

    /* ── OTP digit box handler ── */
    const handleOTPChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setEnteredOTP(val);
    };

    return (
        <div className="auth-page">
            {/* Left decorative panel */}
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-logo-mark">💜</div>
                    <h2 className="auth-tagline">Find your <em>forever</em> — it starts here.</h2>
                    <p className="auth-sub">Join thousands of verified members who found their perfect match on WeUnited.</p>
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
                            <span className="auth-stat-num">98%</span>
                            <span className="auth-stat-lbl">Satisfaction</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-right animate-fade-in">
                <div className="auth-form-wrap">

                    {step === 'form' ? (
                        <>
                            <h1 className="auth-title">Create Account</h1>
                            <p className="auth-desc">Start your journey to finding the perfect match.</p>

                            {error && <div className="auth-error">{error}</div>}

                            <form className="auth-form" onSubmit={handleFormSubmit}>
                                <div className="auth-row">
                                    <div className="auth-field">
                                        <label htmlFor="firstName">First Name</label>
                                        <input type="text" id="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Jane" required />
                                    </div>
                                    <div className="auth-field">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input type="text" id="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Doe" required />
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="phone">Phone Number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(for OTP verification)</span></label>
                                    <input type="tel" id="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="password">Password</label>
                                    <input type="password" id="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
                                </div>

                                <button type="submit" className="auth-btn">
                                    Continue &amp; Verify →
                                </button>
                            </form>

                            <p className="auth-switch">
                                Already have an account? <Link to="/login">Log in</Link>
                            </p>
                            <p className="auth-terms">
                                By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
                            </p>
                        </>
                    ) : (
                        /* ── OTP step ── */
                        <>
                            <div className="otp-icon">📱</div>
                            <h1 className="auth-title">Verify your email</h1>
                            <p className="auth-desc">
                                We've sent a 6-digit code to <strong>{form.email}</strong>.<br />
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Check your browser console for the dev OTP.</span>
                            </p>

                            {otpError && <div className="auth-error">{otpError}</div>}

                            <form className="auth-form" onSubmit={handleOTPSubmit}>
                                <div className="auth-field">
                                    <label htmlFor="otp">Enter 6-digit OTP</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        inputMode="numeric"
                                        value={enteredOTP}
                                        onChange={handleOTPChange}
                                        placeholder="_ _ _ _ _ _"
                                        maxLength={6}
                                        className="otp-input"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button type="submit" className="auth-btn" disabled={enteredOTP.length < 6}>
                                    Verify &amp; Create Account →
                                </button>
                            </form>

                            <div className="otp-resend-row">
                                <span>Didn't receive it?</span>
                                {resendCooldown > 0 ? (
                                    <span className="otp-cooldown">Resend in {resendCooldown}s</span>
                                ) : (
                                    <button className="otp-resend-btn" onClick={handleResend}>Resend OTP</button>
                                )}
                            </div>

                            <button className="otp-back-btn" onClick={() => { setStep('form'); setOtpError(''); }}>
                                ← Back to details
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
