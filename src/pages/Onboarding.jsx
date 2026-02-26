import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    // Step 6: Monetization State
    const [selectedPlan, setSelectedPlan] = useState('plus'); // 'classic' or 'plus'
    const [currency, setCurrency] = useState('usd');

    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        dob: '',
        religion: '',
        email: '',
        education: '',
        profession: '',
        income: '',
        prefAgeMin: '18',
        prefAgeMax: '35',
        prefLanguage: '',
        prefLocation: '',
        prefCommunity: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleMockCheckout = () => {
        // In a real app, this would redirect to a Stripe Checkout Session URL
        navigate('/success');
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                    <div className="progress-text">Step {currentStep} of {totalSteps}</div>
                </div>

                {/* Step Content */}
                <div className="step-content">
                    {currentStep === 1 && (
                        <div className="step-card">
                            <h2>Basic Details</h2>
                            <p className="step-description">Tell us a bit about yourself to get started.</p>

                            <div className="ob-form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="ob-input" placeholder="Enter your full name" />
                            </div>

                            <div className="ob-form-group">
                                <label>Gender</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} /> Male
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} /> Female
                                    </label>
                                </div>
                            </div>

                            <div className="ob-form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="ob-input" />
                            </div>

                            <div className="ob-form-group">
                                <label>Religion &amp; Community</label>
                                <select name="religion" value={formData.religion} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Select your community</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Sikh">Sikh</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="ob-form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="ob-input" placeholder="For login recovery & notifications" />
                            </div>

                            <div className="button-group">
                                <button onClick={nextStep} className="btn-next">Continue</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="step-card">
                            <h2>Professional Details</h2>
                            <p className="step-description">Your career is important. Share your professional background to help us find the perfect match.</p>

                            <div className="ob-form-group">
                                <label>Highest Education</label>
                                <select name="education" value={formData.education} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Select education</option>
                                    <option value="Bachelors">Bachelors / Undergrad</option>
                                    <option value="Masters">Masters / Postgrad</option>
                                    <option value="Doctorate">Doctorate / PhD</option>
                                    <option value="HighSchool">High School</option>
                                </select>
                            </div>

                            <div className="ob-form-group">
                                <label>Current Profession</label>
                                <select name="profession" value={formData.profession} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Select profession</option>
                                    <option value="Engineer">Software/IT Engineer</option>
                                    <option value="Doctor">Doctor/Medical</option>
                                    <option value="Business">Business/Entrepreneur</option>
                                    <option value="Education">Education/Teaching</option>
                                    <option value="Finance">Finance/Banking</option>
                                    <option value="Other">Other Professional</option>
                                </select>
                            </div>

                            <div className="ob-form-group">
                                <label>Annual Income (estimate)</label>
                                <select name="income" value={formData.income} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Select income range</option>
                                    <option value="0-50k">Less than $50k</option>
                                    <option value="50k-100k">$50k - $100k</option>
                                    <option value="100k-200k">$100k - $200k</option>
                                    <option value="200k+">$200k+</option>
                                </select>
                            </div>

                            <div className="file-upload-box">
                                <p style={{ margin: 0, fontWeight: 500 }}>Earn a "Professional Badge" ✨</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>Upload an education certificate or a salary slip to verify your credentials.</p>
                                <label className="file-upload-label">
                                    Choose File
                                    <input type="file" />
                                </label>
                            </div>

                            <div className="button-group split">
                                <button onClick={prevStep} className="btn-back">Back</button>
                                <button onClick={nextStep} className="btn-next">Continue</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="step-card">
                            <h2>Trust Badge Verification</h2>
                            <p className="step-description">Verify your identity to build trust with potential matches. Verified profiles receive 5x more interest.</p>

                            <div className="ob-form-group">
                                <h3>1. Identity Badge 🏛️</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>Upload a Government ID (Aadhaar, Passport, PAN, or Driving License)</p>
                                <label className="file-upload-label" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                    Upload Document
                                    <input type="file" />
                                </label>
                            </div>

                            <hr style={{ borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

                            <div className="ob-form-group">
                                <h3>2. Profile Badge 📸</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>Perform a quick liveness check to prove you match your photos.</p>
                                <button className="btn-back" style={{ width: '100%', borderColor: '#3b82f6', color: '#3b82f6' }}>
                                    Start Liveness Check
                                </button>
                            </div>

                            <hr style={{ borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

                            <div className="ob-form-group">
                                <h3>3. Social Badge 🌐</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>Connect your social media to verify social authenticity.</p>
                                <button className="btn-back" style={{ width: '100%', backgroundColor: '#1877f2', color: 'white', border: 'none' }}>
                                    Connect Facebook
                                </button>
                            </div>

                            <div className="button-group split">
                                <button onClick={prevStep} className="btn-back">Back</button>
                                <button onClick={nextStep} className="btn-next">Skip &amp; Continue</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="step-card">
                            <h2>Partner Preferences</h2>
                            <p className="step-description">What are you looking for in a partner? We'll use this to curate your mutual matches.</p>

                            <div className="ob-form-group">
                                <label>Age Range</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input type="number" name="prefAgeMin" value={formData.prefAgeMin} onChange={handleChange} className="ob-input" placeholder="Min" />
                                    <span>to</span>
                                    <input type="number" name="prefAgeMax" value={formData.prefAgeMax} onChange={handleChange} className="ob-input" placeholder="Max" />
                                </div>
                            </div>

                            <div className="ob-form-group">
                                <label>Mother Tongue</label>
                                <select name="prefLanguage" value={formData.prefLanguage} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Does not matter</option>
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Telugu">Telugu</option>
                                    <option value="Bengali">Bengali</option>
                                </select>
                            </div>

                            <div className="ob-form-group">
                                <label>Preferred Location</label>
                                <input type="text" name="prefLocation" value={formData.prefLocation} onChange={handleChange} className="ob-input" placeholder="City or State" />
                            </div>

                            <div className="ob-form-group">
                                <label>Community (Optional)</label>
                                <select name="prefCommunity" value={formData.prefCommunity} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Does not matter</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Muslim">Muslim</option>
                                    <option value="Christian">Christian</option>
                                    <option value="Sikh">Sikh</option>
                                </select>
                            </div>

                            <div className="button-group split">
                                <button onClick={prevStep} className="btn-back">Back</button>
                                <button onClick={nextStep} className="btn-next">Finding Matches...</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="step-card">
                            <h2>Photo Upload</h2>
                            <p className="step-description">Profiles with at least 3 photos get up to 10x more responses. Complete your profile!</p>

                            <div style={{ padding: '1rem', backgroundColor: '#f9f5fa', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>Profile Completion Score: 65%</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1a1a1a' }}>Upload 3 photos to reach 80% and unlock premium visibility.</p>
                            </div>

                            <div className="file-upload-box" style={{ padding: '3rem 2rem' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                <p style={{ margin: 0, fontWeight: 500 }}>Drag &amp; Drop photos here</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>or click to browse from your device</p>
                                <label className="file-upload-label">
                                    Browse Photos
                                    <input type="file" multiple accept="image/*" />
                                </label>
                            </div>

                            <div className="button-group split">
                                <button onClick={prevStep} className="btn-back">Back</button>
                                <button onClick={nextStep} className="btn-next">Finish Setup</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="step-card">
                            <h2>Unlock Premium Features</h2>
                            <p className="step-description">Select a plan to start viewing verified contact numbers and messaging your perfect matches.</p>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <select
                                    className="ob-select"
                                    style={{ width: 'auto', padding: '0.5rem', marginBottom: 0 }}
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                >
                                    <option value="usd">USD ($)</option>
                                    <option value="gbp">GBP (£)</option>
                                    <option value="aud">AUD ($)</option>
                                    <option value="inr">INR (₹)</option>
                                </select>
                            </div>

                            <div className="pricing-grid">
                                <div
                                    className={`pricing-card ${selectedPlan === 'classic' ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan('classic')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3>Classic</h3>
                                    <div className="pricing-price">
                                        {currency === 'usd' && '$19'}
                                        {currency === 'gbp' && '£15'}
                                        {currency === 'aud' && '$29'}
                                        {currency === 'inr' && '₹1500'}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/mo</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ View 50 Verified Phone Numbers</li>
                                        <li>✓ Standard Placement in Search</li>
                                        <li>✓ Unlimited Messaging</li>
                                    </ul>
                                </div>
                                <div
                                    className={`pricing-card ${selectedPlan === 'plus' ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan('plus')}
                                    style={{ cursor: 'pointer' }}
                                > {/* Highlighted plan */}
                                    <div style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem', borderRadius: '4px', marginBottom: '0.5rem', display: 'inline-block' }}>MOST POPULAR</div>
                                    <h3>Plus</h3>
                                    <div className="pricing-price">
                                        {currency === 'usd' && '$39'}
                                        {currency === 'gbp' && '£30'}
                                        {currency === 'aud' && '$59'}
                                        {currency === 'inr' && '₹3200'}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/mo</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ View 150 Verified Phone Numbers</li>
                                        <li>✓ Priority Placement in Search</li>
                                        <li>✓ Unlimited Messaging</li>
                                        <li>✓ Enhanced Trust Badge</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center', backgroundColor: '#fbf8fc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ecc9f2' }}>
                                <h3 style={{ color: 'var(--primary-dark)', margin: '0 0 0.5rem 0' }}>Want Assisted Matchmaking?</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', margin: '0 0 1rem 0' }}>Get a dedicated Relationship Manager to handpick the best matches for you.</p>
                                <button style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Learn More About Assisted Services</button>
                            </div>

                            <div className="button-group split" style={{ marginTop: '2.5rem' }}>
                                <button className="btn-back" onClick={prevStep}>Back</button>
                                <button className="btn-done" onClick={handleMockCheckout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    Checkout Securely
                                </button>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button className="btn-skip" onClick={() => navigate('/')}>Skip for now, I'll pay later</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
