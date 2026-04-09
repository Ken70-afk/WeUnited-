import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import DropdownWithOptions from '../components/DropdownWithOptions';
import './Onboarding.css';

// Regional pricing config
const REGION_PRICING = {
    CA: { label: '🇨🇦 Canada',    currency: 'CAD', symbol: '$',  plan2mo: 79,  plan3mo: 99  },
    US: { label: '🇺🇸 USA',       currency: 'USD', symbol: '$',  plan2mo: 39,  plan3mo: 75  },
    AU: { label: '🇦🇺 Australia', currency: 'AUD', symbol: '$',  plan2mo: 49,  plan3mo: 99  },
    EU: { label: '🇪🇺 Europe',    currency: 'EUR', symbol: '€',  plan2mo: 29,  plan3mo: 59  },
};

// Countries considered part of Europe for region detection
const EU_COUNTRIES = new Set([
    'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
    'IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK',
    'NO','CH','IS','GB','AL','BA','ME','MK','RS','TR','UA','BY','MD',
]);

const detectRegion = (countryCode) => {
    if (!countryCode) return 'CA';
    if (countryCode === 'CA') return 'CA';
    if (countryCode === 'US') return 'US';
    if (countryCode === 'AU') return 'AU';
    if (EU_COUNTRIES.has(countryCode)) return 'EU';
    return 'CA'; // default fallback
};

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(() => {
        const savedStep = localStorage.getItem('onboardingStep');
        return savedStep ? parseInt(savedStep, 10) : 1;
    });
    const totalSteps = 5;

    // Step 6: Monetization State
    const [selectedPlan, setSelectedPlan] = useState('premium'); // 'basic' or 'premium'
    const [region, setRegion] = useState('CA');
    const [detecting, setDetecting] = useState(true);

    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('onboardingData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        return {
            firstName: '', middleName: '', lastName: '', gender: '', dob: '',
            height: '', heightUnit: 'cm', weight: '', weightUnit: 'kg', aboutMe: '',
            community: '', religion: '', caste: '', email: '', phone: '', currentPlace: '',
            education: '', profession: '', income: '', prefAgeMin: '18',
            familyType: '', familyValues: '', familyStatus: '', fatherOccupation: '', motherOccupation: '', brothers: '', sisters: '',
            maritalStatus: '', prefMaritalStatus: '', prefHeightMin: '', prefHeightMax: '', prefHeightUnit: 'cm',
            prefReligion: '', prefQualification: '', prefProfession: '', prefIncome: '',
            prefAgeMax: '35', prefLanguage: '', prefLocation: '', prefCommunity: '',
            photos: []
        };
    });
    
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

    // Seed from the user object if it loads and we haven't filled names yet
    useEffect(() => {
        if (user && !formData.firstName && !formData.lastName) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || prev.firstName,
                lastName: user.lastName || prev.lastName,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
        }
    }, [user, formData.firstName, formData.lastName]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (formData.firstName || formData.lastName) {
            localStorage.setItem('onboardingData', JSON.stringify(formData));
            localStorage.setItem('onboardingStep', currentStep.toString());
        }
    }, [formData, currentStep]);

    // Auto-detect user region on component mount
    useEffect(() => {
        const detectUserRegion = async () => {
            try {
                // Free IP geolocation API to determine country
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data && data.country_code) {
                    setRegion(detectRegion(data.country_code));
                }
            } catch (error) {
                console.error("Could not auto-detect region:", error);
                setRegion('CA'); // Fail gracefully
            } finally {
                setDetecting(false);
            }
        };

        detectUserRegion();
    }, []);

    const pricing = REGION_PRICING[region] || REGION_PRICING['CA'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dob || !formData.height || !formData.weight || !formData.maritalStatus || !formData.community || !formData.religion || !formData.caste || !formData.email) {
                alert("Please fill in all required fields (Middle Name and About Me are optional).");
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.education || !formData.profession) {
                alert("Please select your highest education and current profession.");
                return;
            }
        }
        if (currentStep === 3) {
            if (!formData.prefAgeMin || !formData.prefAgeMax) {
                alert("Please provide an age range.");
                return;
            }
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const buildProfileUpdates = () => {
        const updates = {
            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            gender: formData.gender,
            dob: formData.dob,
            height: formData.height,
            heightUnit: formData.heightUnit,
            weight: formData.weight,
            weightUnit: formData.weightUnit,
            aboutMe: formData.aboutMe,
            community: formData.community,
            religion: formData.religion,
            caste: formData.caste,
            email: formData.email,
            maritalStatus: formData.maritalStatus,
            qualification: formData.education,
            job: formData.profession,
            income: formData.income,
            photos: formData.photos,
            location: formData.currentPlace,
            familyType: formData.familyType,
            familyValues: formData.familyValues,
            familyStatus: formData.familyStatus,
            fatherOccupation: formData.fatherOccupation,
            motherOccupation: formData.motherOccupation,
            brothers: formData.brothers,
            sisters: formData.sisters,
            prefAgeMin: formData.prefAgeMin,
            prefAgeMax: formData.prefAgeMax,
            prefHeightMin: formData.prefHeightMin,
            prefHeightMax: formData.prefHeightMax,
            prefHeightUnit: formData.prefHeightUnit,
            prefMaritalStatus: formData.prefMaritalStatus,
            prefReligion: formData.prefReligion,
            prefQualification: formData.prefQualification,
            prefProfession: formData.prefProfession,
            prefIncome: formData.prefIncome,
            prefLanguage: formData.prefLanguage,
            prefLocation: formData.prefLocation,
            onboardingCompleted: true,
        };
        // Only include fields that have values to avoid clearing existing data with empty strings
        return Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== '' && v !== null && typeof v !== 'undefined'));
    };

    const handleCheckout = async () => {
        const updates = buildProfileUpdates();
        try {
            const { db } = await import('../firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            if (user && user.uid) {
                await updateDoc(doc(db, 'profiles', user.uid), updates);
            }
        } catch (err) {
            console.error("Error saving onboarding data", err);
        }
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingStep');
        
        // NOW Redirect to Stripe
        const PRICE_IDS = {
            premium: {
                CA: import.meta.env.VITE_STRIPE_PREMIUM_CA,
                US: import.meta.env.VITE_STRIPE_PREMIUM_US,
                AU: import.meta.env.VITE_STRIPE_PREMIUM_AU,
                EU: import.meta.env.VITE_STRIPE_PREMIUM_EU,
            },
            basic: {
                CA: import.meta.env.VITE_STRIPE_BASIC_CA,
                US: import.meta.env.VITE_STRIPE_BASIC_US,
                AU: import.meta.env.VITE_STRIPE_BASIC_AU,
                EU: import.meta.env.VITE_STRIPE_BASIC_EU,
            }
        };

        const priceId = PRICE_IDS[selectedPlan]?.[region] || PRICE_IDS[selectedPlan]?.['CA'];

        if (!priceId) {
            console.error(`Missing Price ID for ${selectedPlan} plan.`);
            alert("Payment configuration error. Please contact support.");
            navigate('/success');
            return;
        }

        try {
            const response = await fetch('http://localhost:4242/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: user.uid,
                    region, 
                    currency: pricing.currency
                }),
            });

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                console.error("No checkout URL returned", data);
                alert("Could not initiate checkout. Please try again.");
                navigate('/success');
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Server connection failed. Is the backend running?");
            navigate('/success');
        }
    };

    const handleSkip = async () => {
        // When skipping, we still want to save what they might have filled
        const updates = buildProfileUpdates();
        try {
            const { db } = await import('../firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            if (user && user.uid && Object.keys(updates).length > 0) {
                await updateDoc(doc(db, 'profiles', user.uid), updates);
            }
        } catch (err) {
            console.error("Error saving onboarding data", err);
        }
        localStorage.removeItem('onboardingData');
        localStorage.removeItem('onboardingStep');
        navigate('/dashboard'); // Go to dashboard instead of Home
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !user) return;
        
        setIsUploadingPhotos(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const fileRef = ref(storage, `users/${user.uid}/gallery_${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                return await getDownloadURL(fileRef);
            });
            const newUrls = await Promise.all(uploadPromises);
            
            const updatedPhotos = [...(formData.photos || []), ...newUrls];
            setFormData(prev => ({ ...prev, photos: updatedPhotos }));
        } catch (err) {
            console.error("Error uploading gallery photos", err);
            alert("Gallery upload failed: " + err.message);
        } finally {
            setIsUploadingPhotos(false);
        }
    };

    const handleRemovePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: (prev.photos || []).filter((_, i) => i !== index)
        }));
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

                            <DropdownWithOptions
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                options={['Male', 'Female']}
                                required={true}
                                hasAny={false}
                                placeholder="Specify your gender"
                            />

                            <div className="ob-form-group">
                                <label>Current Place</label>
                                <input type="text" name="currentPlace" value={formData.currentPlace} onChange={handleChange} className="ob-input" placeholder="e.g. Toronto, Canada" />
                            </div>
                            
                            <DropdownWithOptions
                                label="Marital Status"
                                name="maritalStatus"
                                value={formData.maritalStatus}
                                onChange={handleChange}
                                options={['Unmarried', 'Legally Separated']}
                                required={true}
                                hasAny={false}
                            />

                            <div className="ob-form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="ob-input" />
                            </div>

                            <div className="ob-form-group">
                                <label>Height</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" name="height" value={formData.height || ''} onChange={handleChange} className="ob-input" placeholder="e.g. 5'10 / 175" style={{ flex: 1 }} />
                                    <select name="heightUnit" value={formData.heightUnit || 'cm'} onChange={handleChange} className="ob-select" style={{ width: '80px', flexShrink: 0 }}>
                                        <option value="cm">cm</option>
                                        <option value="ft/in">ft/in</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="ob-form-group">
                                <label>Weight</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="ob-input" placeholder="e.g. 75" style={{ flex: 1 }} />
                                    <select name="weightUnit" value={formData.weightUnit || 'kg'} onChange={handleChange} className="ob-select" style={{ width: '80px', flexShrink: 0 }}>
                                        <option value="kg">kg</option>
                                        <option value="lbs">lbs</option>
                                    </select>
                                </div>
                            </div>

                            <div className="ob-form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>About Me <span className="opt">(Optional)</span></label>
                                <textarea
                                    name="aboutMe"
                                    value={formData.aboutMe || ''}
                                    onChange={handleChange}
                                    className="ob-input"
                                    rows="4"
                                    maxLength={500}
                                    placeholder="Tell people a little about yourself — your personality, values, what you're looking for..."
                                    style={{ resize: 'vertical', minHeight: '100px' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: (formData.aboutMe || '').length > 450 ? '#ef4444' : '#6b7280', marginTop: '4px', display: 'block', textAlign: 'right' }}>
                                    {(formData.aboutMe || '').length} / 500
                                </span>
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

                            <DropdownWithOptions
                                label="Highest Education"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                options={['High School', 'Diploma', 'Associates', 'Bachelors', 'Masters', 'Doctorate', 'Trade School']}
                                required={true}
                            />

                            <DropdownWithOptions
                                label="Current Profession"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                options={['Software/IT', 'Medical/Healthcare', 'Business/Entrepreneur', 'Education/Teaching', 'Finance/Banking', 'Law/Legal', 'Arts/Design', 'Engineering/Architecture', 'Government/Public Sector', 'Sales/Marketing', 'Self-Employed']}
                                required={true}
                            />

                            <DropdownWithOptions
                                label="Annual Income (estimate)"
                                name="income"
                                value={formData.income}
                                onChange={handleChange}
                                options={['0-50k', '50k-100k', '100k-200k', '200k+']}
                                required={false}
                            />

                            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Family Information</h3>

                            <DropdownWithOptions
                                label="Family Type"
                                name="familyType"
                                value={formData.familyType}
                                onChange={handleChange}
                                options={['Joint Family', 'Nuclear Family']}
                                required={false}
                            />
                            <DropdownWithOptions
                                label="Family Values"
                                name="familyValues"
                                value={formData.familyValues}
                                onChange={handleChange}
                                options={['Orthodox', 'Traditional', 'Moderate', 'Liberal']}
                                required={false}
                            />
                            <DropdownWithOptions
                                label="Family Status"
                                name="familyStatus"
                                value={formData.familyStatus}
                                onChange={handleChange}
                                options={['Middle Class', 'Upper Middle Class', 'Rich', 'Affluent']}
                                required={false}
                            />
                            <DropdownWithOptions
                                label="Father's Occupation"
                                name="fatherOccupation"
                                value={formData.fatherOccupation}
                                onChange={handleChange}
                                options={['Business', 'Government / Public Sector', 'Private Sector', 'Self-Employed', 'Retired', 'Homemaker', 'Deceased']}
                                required={false}
                            />
                            <DropdownWithOptions
                                label="Mother's Occupation"
                                name="motherOccupation"
                                value={formData.motherOccupation}
                                onChange={handleChange}
                                options={['Business', 'Government / Public Sector', 'Private Sector', 'Self-Employed', 'Retired', 'Homemaker', 'Deceased']}
                                required={false}
                            />
                            <DropdownWithOptions
                                label="Brothers"
                                name="brothers"
                                value={formData.brothers}
                                onChange={handleChange}
                                options={['0','1','2','3','4+']}
                                required={false}
                                hasAny={false}
                                placeholder="Select number of brothers"
                            />
                            <DropdownWithOptions
                                label="Sisters"
                                name="sisters"
                                value={formData.sisters}
                                onChange={handleChange}
                                options={['0','1','2','3','4+']}
                                required={false}
                                hasAny={false}
                                placeholder="Select number of sisters"
                            />

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
                                <label>Height Min</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" name="prefHeightMin" value={formData.prefHeightMin || ''} onChange={handleChange} className="ob-input" placeholder="e.g. 155 or 5'1" style={{ flex: 1 }} />
                                    <select name="prefHeightUnit" value={formData.prefHeightUnit || 'cm'} onChange={handleChange} className="ob-select" style={{ width: '80px', flexShrink: 0 }}>
                                        <option value="cm">cm</option>
                                        <option value="ft/in">ft/in</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ob-form-group">
                                <label>Height Max</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" name="prefHeightMax" value={formData.prefHeightMax || ''} onChange={handleChange} className="ob-input" placeholder="e.g. 185 or 6'1" style={{ flex: 1 }} />
                                    <select name="prefHeightUnit" value={formData.prefHeightUnit || 'cm'} onChange={handleChange} className="ob-select" style={{ width: '80px', flexShrink: 0 }}>
                                        <option value="cm">cm</option>
                                        <option value="ft/in">ft/in</option>
                                    </select>
                                </div>
                            </div>

                            <DropdownWithOptions
                                label="Marital Status"
                                name="prefMaritalStatus"
                                value={formData.prefMaritalStatus}
                                onChange={handleChange}
                                options={['Unmarried', 'Legally Separated']}
                                required={false}
                                hasAny={true}
                            />
                            <DropdownWithOptions
                                label="Religion"
                                name="prefReligion"
                                value={formData.prefReligion}
                                onChange={handleChange}
                                options={['Hindu', 'Muslim', 'Christian', 'Sikh']}
                                required={false}
                                hasAny={true}
                            />
                            <DropdownWithOptions
                                label="Qualification"
                                name="prefQualification"
                                value={formData.prefQualification}
                                onChange={handleChange}
                                options={['High School', 'Diploma', 'Associates', 'Bachelors', 'Masters', 'Doctorate', 'Trade School']}
                                required={false}
                                hasAny={true}
                            />
                            <DropdownWithOptions
                                label="Job / Profession"
                                name="prefProfession"
                                value={formData.prefProfession}
                                onChange={handleChange}
                                options={['Software/IT', 'Medical/Healthcare', 'Business/Entrepreneur', 'Education/Teaching', 'Finance/Banking', 'Law/Legal', 'Arts/Design', 'Engineering/Architecture', 'Government/Public Sector', 'Sales/Marketing', 'Self-Employed']}
                                required={false}
                                hasAny={true}
                            />
                            <DropdownWithOptions
                                label="Annual Income"
                                name="prefIncome"
                                value={formData.prefIncome}
                                onChange={handleChange}
                                options={['0-50k', '50k-100k', '100k-200k', '200k+']}
                                required={false}
                                hasAny={true}
                            />

                            <DropdownWithOptions 
                                label="Mother Tongue"
                                name="prefLanguage"
                                value={formData.prefLanguage}
                                onChange={handleChange}
                                options={['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali']}
                                required={false}
                                hasAny={true}
                                placeholder="Specify language"
                            />

                            <div className="ob-form-group">
                                <label>Preferred Location</label>
                                <input type="text" name="prefLocation" value={formData.prefLocation} onChange={handleChange} className="ob-input" placeholder="City or State" />
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
                                <p style={{ margin: 0, fontWeight: 500 }}>{isUploadingPhotos ? "Uploading..." : "Drag & Drop photos here"}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>or click to browse from your device</p>
                                <label className="file-upload-label" style={{ opacity: isUploadingPhotos ? 0.5 : 1 }}>
                                    Browse Photos
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhotos} />
                                </label>
                            </div>
                            
                            {formData.photos && formData.photos.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                    {formData.photos.map((url, i) => (
                                        <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={url} alt={`Upload ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button 
                                                onClick={() => handleRemovePhoto(i)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
                                            >x</button>
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                    className={`pricing-card ${selectedPlan === 'basic' ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan('basic')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3>Basic (2 Months)</h3>
                                    <div className="pricing-price">
                                        {pricing.symbol}{pricing.plan2mo}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}> total</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ Access Limited Profiles</li>
                                        <li>✓ Customer Support</li>
                                        <li>✓ Advanced Filters</li>
                                    </ul>
                                </div>
                                <div
                                    className={`pricing-card ${selectedPlan === 'premium' ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan('premium')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem', borderRadius: '4px', marginBottom: '0.5rem', display: 'inline-block' }}>MOST POPULAR</div>
                                    <h3>Premium (3 Months)</h3>
                                    <div className="pricing-price">
                                        {pricing.symbol}{pricing.plan3mo}
                                        <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}> total</span>
                                    </div>
                                    <ul className="pricing-features">
                                        <li>✓ Access Unlimited Profiles</li>
                                        <li>✓ Enhanced Trust Badge</li>
                                        <li>✓ Customer Support</li>
                                        <li>✓ Advanced Filters</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="button-group split" style={{ marginTop: '2.5rem' }}>
                                <button className="btn-back" onClick={prevStep}>Back</button>
                                <button className="btn-done" onClick={handleCheckout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={detecting}>
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
