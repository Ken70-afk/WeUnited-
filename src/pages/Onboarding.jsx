import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem('onboardingStep');
        return savedStep ? parseInt(savedStep, 10) : 1;
    });
    const totalSteps = 5;

    // Step 6: Monetization State
    const [selectedPlan, setSelectedPlan] = useState('plus'); // 'classic' or 'plus'
    const [currency, setCurrency] = useState('usd');

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('onboardingData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        // Seed from the profile created during Register
        const savedProfile = localStorage.getItem('profileDataFull');
        const profile = savedProfile ? JSON.parse(savedProfile) : {};
        return {
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            gender: profile.gender || '',
            dob: profile.dob || '',
            community: profile.community || '',
            religion: profile.religion || '',
            caste: profile.caste || '',
            email: profile.email || '',
            phone: profile.phone || '',
            education: profile.qualification || '',
            profession: profile.job || '',
            income: profile.income || '',
            prefAgeMin: '18',
            prefAgeMax: '35',
            prefLanguage: '',
            prefLocation: '',
            prefCommunity: ''
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('onboardingData', JSON.stringify(formData));
        localStorage.setItem('onboardingStep', currentStep.toString());
    }, [formData, currentStep]);

    // Auto-detect user currency on component mount
    useEffect(() => {
        const detectCurrency = async () => {
            try {
                // Free IP geolocation API to determine country
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data && data.currency) {
                    const detectedCurrency = data.currency.toLowerCase();
                    const supportedCurrencies = ['usd', 'gbp', 'aud', 'inr', 'eur', 'cad', 'jpy', 'chf', 'cny'];
                    // Validate if it's one of our supported currencies before setting
                    if (supportedCurrencies.includes(detectedCurrency)) {
                        setCurrency(detectedCurrency);
                    } else if (data.country_code === 'IN') {
                        setCurrency('inr');
                    } else if (data.country_code === 'GB') {
                        setCurrency('gbp');
                    } else if (data.country_code === 'AU') {
                        setCurrency('aud');
                    }
                    // Defaults back to 'usd' if unsupported
                }
            } catch (error) {
                console.error("Could not auto-detect currency:", error);
                // Fail gracefully, defaults to usd
            }
        };

        detectCurrency();
    }, []);

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

    const buildProfile = () => ({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        community: formData.community,
        religion: formData.religion,
        caste: formData.caste,
        email: formData.email,
        phone: '',
        qualification: formData.education,
        job: formData.profession,
        income: formData.income,
        location: '',
        bioTags: '',
        height: '',
        weight: '',
        familyInfo: '',
        hobbies: '',
        photos: [],
        preferences: {
            ageMin: formData.prefAgeMin,
            ageMax: formData.prefAgeMax,
            language: formData.prefLanguage,
            location: formData.prefLocation,
            community: formData.prefCommunity,
        },
    });

    const handleMockCheckout = () => {
        const profile = buildProfile();
        localStorage.setItem('profileDataFull', JSON.stringify(profile));
        login(profile);
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingStep');
        navigate('/success');
    };

    const handleSkip = () => {
        const profile = buildProfile();
        localStorage.setItem('profileDataFull', JSON.stringify(profile));
        login(profile);
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingStep');
        navigate('/');
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
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="ob-input" placeholder="e.g. John" />
                            </div>
                            <div className="ob-form-group">
                                <label>Middle Name (Optional)</label>
                                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="ob-input" placeholder="e.g. Robert" />
                            </div>
                            <div className="ob-form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="ob-input" placeholder="e.g. Doe" />
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
                                <label>Community (e.g. Malayali, NRIs, Whites...)</label>
                                <input type="text" name="community" value={formData.community} onChange={handleChange} className="ob-input" placeholder="Enter your community" />
                            </div>
                            <div className="ob-form-group">
                                <label>Religion (e.g. Hindu, Muslim...)</label>
                                <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="ob-input" placeholder="Enter your religion" />
                            </div>
                            <div className="ob-form-group">
                                <label>Caste (e.g. Nair, Ezhava, RC...)</label>
                                <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="ob-input" placeholder="Enter your caste" />
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
                                    <option value="High School">High School</option>
                                    <option value="Diploma">Diploma / Certification</option>
                                    <option value="Associates">Associates Degree</option>
                                    <option value="Bachelors">Bachelors / Undergrad</option>
                                    <option value="Masters">Masters / Postgrad</option>
                                    <option value="Doctorate">Doctorate / PhD</option>
                                    <option value="Trade School">Trade School</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="ob-form-group">
                                <label>Current Profession</label>
                                <select name="profession" value={formData.profession} onChange={handleChange} className="ob-select">
                                    <option value="" disabled>Select profession</option>
                                    <option value="Software/IT">Software/IT</option>
                                    <option value="Medical/Healthcare">Medical/Healthcare</option>
                                    <option value="Business/Entrepreneur">Business/Entrepreneur</option>
                                    <option value="Education/Teaching">Education/Teaching</option>
                                    <option value="Finance/Banking">Finance/Banking</option>
                                    <option value="Law/Legal">Law/Legal</option>
                                    <option value="Arts/Design">Arts/Design/Media</option>
                                    <option value="Engineering/Architecture">Engineering/Architecture</option>
                                    <option value="Government/Public Sector">Government/Public Sector</option>
                                    <option value="Sales/Marketing">Sales/Marketing</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Other">Other</option>
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

                            <div className="button-group split">
                                <button onClick={prevStep} className="btn-back">Back</button>
                                <button onClick={nextStep} className="btn-next">Continue</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
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

                    {currentStep === 4 && (
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

                    {currentStep === 5 && (
                        <div className="step-card">
                            <h2>Unlock Premium Features</h2>
                            <p className="step-description">Select a plan to start viewing verified contact numbers and messaging your perfect matches.</p>

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
                                        {currency === 'aud' && 'A$29'}
                                        {currency === 'cad' && 'C$25'}
                                        {currency === 'eur' && '€19'}
                                        {currency === 'chf' && 'CHF 19'}
                                        {currency === 'inr' && '₹1500'}
                                        {currency === 'jpy' && '¥2900'}
                                        {currency === 'cny' && '¥150'}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/mo</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ View 50 Verified Phone Numbers</li>
                                        <li>✓ Standard Placement in Search</li>
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
                                        {currency === 'aud' && 'A$59'}
                                        {currency === 'cad' && 'C$49'}
                                        {currency === 'eur' && '€39'}
                                        {currency === 'chf' && 'CHF 39'}
                                        {currency === 'inr' && '₹3200'}
                                        {currency === 'jpy' && '¥5900'}
                                        {currency === 'cny' && '¥280'}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>/mo</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ View 150 Verified Phone Numbers</li>
                                        <li>✓ Priority Placement in Search</li>
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
                                <button className="btn-skip" onClick={handleSkip}>Skip for now, I'll pay later</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
