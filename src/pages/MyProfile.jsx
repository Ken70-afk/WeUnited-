import React, { useState, useEffect } from 'react';
import './MyProfile.css';

const MyProfile = () => {
    const [userData, setUserData] = useState({
        fullName: 'Abhinav Ranjith',
        gender: 'Male',
        dob: '1995-08-14',
        religion: 'Hindu',
        email: 'abhinav@example.com',
        education: 'Masters / Postgrad',
        profession: 'Software/IT Engineer',
        income: '$100k - $200k',
        prefAgeMin: '24',
        prefAgeMax: '30',
        prefLanguage: 'English',
        prefLocation: 'New York',
        prefCommunity: 'Does not matter'
    });

    const [editingSection, setEditingSection] = useState(null); // 'basic', 'career', or 'preferences'
    const [editFormData, setEditFormData] = useState({});

    // Photo States
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [avatarPhoto, setAvatarPhoto] = useState(null);

    useEffect(() => {
        // Load data from localStorage if available (simulating logged in user)
        const savedData = localStorage.getItem('onboardingData');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        }

        const savedCover = localStorage.getItem('profileCover');
        if (savedCover) setCoverPhoto(savedCover);

        const savedAvatar = localStorage.getItem('profileAvatar');
        if (savedAvatar) setAvatarPhoto(savedAvatar);
    }, []);

    const handleEditClick = (section) => {
        setEditFormData(userData); // clone current data into edit state
        setEditingSection(section);
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
    };

    const handleSaveEdit = () => {
        setUserData(editFormData);
        localStorage.setItem('onboardingData', JSON.stringify(editFormData));
        setEditingSection(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const calculateAge = (dobString) => {
        if (!dobString) return '';
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 0 || age > 120) return 'Invalid'; // Prevent negative or absurd ages
        return age;
    };

    const handlePhotoUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                if (type === 'cover') {
                    setCoverPhoto(base64String);
                    localStorage.setItem('profileCover', base64String);
                } else if (type === 'avatar') {
                    setAvatarPhoto(base64String);
                    localStorage.setItem('profileAvatar', base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">

                {/* Left Sidebar - High Level Overview */}
                <div className="profile-sidebar animate-fade-in-up">
                    <div className="profile-cover" style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                        <label className="edit-cover-btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            Edit Cover
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} style={{ display: 'none' }} />
                        </label>
                    </div>

                    <div className="profile-avatar-wrapper">
                        {avatarPhoto ? (
                            <img src={avatarPhoto} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        )}
                        <label className="edit-avatar-btn" style={{ cursor: 'pointer', margin: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'avatar')} style={{ display: 'none' }} />
                        </label>
                    </div>

                    <div className="profile-user-info">
                        <h2>{userData.fullName || 'User'}</h2>
                        <div className="profile-user-id">Profile ID: WU948275</div>
                        <div className="profile-user-meta">
                            {userData.dob ? `${calculateAge(userData.dob)} yrs, ` : ''}
                            {userData.religion ? `${userData.religion}, ` : ''}
                            {userData.profession || 'Professional'}
                        </div>

                        <div className="profile-completion">
                            <div className="completion-header">
                                <span>Profile Completion</span>
                                <span className="completion-val">65%</span>
                            </div>
                            <div className="completion-bar-bg">
                                <div className="completion-bar-fill" style={{ width: '65%' }}></div>
                            </div>
                            <p className="completion-hint">Add 3 photos to reach 80%</p>
                        </div>
                    </div>

                    <div className="profile-badges">
                        <div className="badge-item verified">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Phone Verified
                        </div>
                        <div className="badge-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            Premium
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="profile-content">

                    {/* Basic Info Section */}
                    <div className="profile-section" style={{ animationDelay: '0.1s' }}>
                        <div className="profile-section-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Basic Information
                            </h3>
                            {editingSection === 'basic' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-edit" onClick={handleCancelEdit} style={{ color: '#6b7280' }}>Cancel</button>
                                    <button className="btn-edit" onClick={handleSaveEdit} style={{ background: 'var(--primary)', color: 'white' }}>Save</button>
                                </div>
                            ) : (
                                <button className="btn-edit" onClick={() => handleEditClick('basic')}>Edit</button>
                            )}
                        </div>
                        {editingSection === 'basic' ? (
                            <div className="info-grid" style={{ gap: '1rem' }}>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Full Name</label>
                                    <input type="text" name="fullName" value={editFormData.fullName || ''} onChange={handleInputChange} className="ob-input" />
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Email</label>
                                    <input type="email" name="email" value={editFormData.email || ''} onChange={handleInputChange} className="ob-input" />
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Date of Birth</label>
                                    <input type="date" name="dob" value={editFormData.dob || ''} onChange={handleInputChange} className="ob-input" />
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Gender</label>
                                    <select name="gender" value={editFormData.gender || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Religion</label>
                                    <select name="religion" value={editFormData.religion || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="Hindu">Hindu</option>
                                        <option value="Muslim">Muslim</option>
                                        <option value="Christian">Christian</option>
                                        <option value="Sikh">Sikh</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Full Name</span>
                                    <span className="info-value">{userData.fullName || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{userData.email || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Gender / DOB</span>
                                    <span className="info-value">{(userData.gender || '-') + ' / ' + (userData.dob || '-')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Religion</span>
                                    <span className="info-value">{userData.religion || '-'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Professional Section */}
                    <div className="profile-section" style={{ animationDelay: '0.2s' }}>
                        <div className="profile-section-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                Career & Education
                            </h3>
                            {editingSection === 'career' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-edit" onClick={handleCancelEdit} style={{ color: '#6b7280' }}>Cancel</button>
                                    <button className="btn-edit" onClick={handleSaveEdit} style={{ background: 'var(--primary)', color: 'white' }}>Save</button>
                                </div>
                            ) : (
                                <button className="btn-edit" onClick={() => handleEditClick('career')}>Edit</button>
                            )}
                        </div>
                        {editingSection === 'career' ? (
                            <div className="info-grid" style={{ gap: '1rem' }}>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Highest Education</label>
                                    <select name="education" value={editFormData.education || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="Bachelors">Bachelors / Undergrad</option>
                                        <option value="Masters">Masters / Postgrad</option>
                                        <option value="Doctorate">Doctorate / PhD</option>
                                        <option value="HighSchool">High School</option>
                                    </select>
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Current Profession</label>
                                    <select name="profession" value={editFormData.profession || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="Engineer">Software/IT Engineer</option>
                                        <option value="Doctor">Doctor/Medical</option>
                                        <option value="Business">Business/Entrepreneur</option>
                                        <option value="Education">Education/Teaching</option>
                                        <option value="Finance">Finance/Banking</option>
                                        <option value="Other">Other Professional</option>
                                    </select>
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Annual Income</label>
                                    <select name="income" value={editFormData.income || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="0-50k">Less than $50k</option>
                                        <option value="50k-100k">$50k - $100k</option>
                                        <option value="100k-200k">$100k - $200k</option>
                                        <option value="200k+">$200k+</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Highest Education</span>
                                    <span className="info-value">{userData.education || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Current Profession</span>
                                    <span className="info-value">{userData.profession || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Annual Income</span>
                                    <span className="info-value">{userData.income || '-'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Partner Preferences Section */}
                    <div className="profile-section" style={{ animationDelay: '0.3s' }}>
                        <div className="profile-section-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                Partner Preferences
                            </h3>
                            {editingSection === 'preferences' ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-edit" onClick={handleCancelEdit} style={{ color: '#6b7280' }}>Cancel</button>
                                    <button className="btn-edit" onClick={handleSaveEdit} style={{ background: 'var(--primary)', color: 'white' }}>Save</button>
                                </div>
                            ) : (
                                <button className="btn-edit" onClick={() => handleEditClick('preferences')}>Edit</button>
                            )}
                        </div>
                        {editingSection === 'preferences' ? (
                            <div className="info-grid" style={{ gap: '1rem' }}>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Age Range</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="number" name="prefAgeMin" value={editFormData.prefAgeMin || ''} onChange={handleInputChange} className="ob-input" style={{ padding: '0.5rem' }} />
                                        <span style={{ color: '#6b7280' }}>to</span>
                                        <input type="number" name="prefAgeMax" value={editFormData.prefAgeMax || ''} onChange={handleInputChange} className="ob-input" style={{ padding: '0.5rem' }} />
                                    </div>
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Preferred Location</label>
                                    <input type="text" name="prefLocation" value={editFormData.prefLocation || ''} onChange={handleInputChange} className="ob-input" placeholder="Anywhere" />
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Mother Tongue</label>
                                    <select name="prefLanguage" value={editFormData.prefLanguage || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Tamil">Tamil</option>
                                        <option value="Telugu">Telugu</option>
                                        <option value="Bengali">Bengali</option>
                                    </select>
                                </div>
                                <div className="ob-form-group" style={{ marginBottom: 0 }}>
                                    <label className="info-label">Community</label>
                                    <select name="prefCommunity" value={editFormData.prefCommunity || ''} onChange={handleInputChange} className="ob-select">
                                        <option value="Does not matter">Does not matter</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Muslim">Muslim</option>
                                        <option value="Christian">Christian</option>
                                        <option value="Sikh">Sikh</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Age Range</span>
                                    <span className="info-value">{userData.prefAgeMin} - {userData.prefAgeMax} yrs</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Preferred Location</span>
                                    <span className="info-value">{userData.prefLocation || 'Anywhere'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Mother Tongue</span>
                                    <span className="info-value">{userData.prefLanguage || 'Does not matter'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Community</span>
                                    <span className="info-value">{userData.prefCommunity || 'Does not matter'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="profile-section" style={{ animationDelay: '0.4s' }}>
                        <div className="profile-section-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                Verification & Trust
                            </h3>
                        </div>
                        <div className="trust-badges-grid">
                            <div className="trust-card active">
                                <div className="trust-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </div>
                                <div className="trust-details">
                                    <h4>Phone Number</h4>
                                    <p>Verified on May 10, 2023</p>
                                </div>
                            </div>
                            <div className="trust-card">
                                <div className="trust-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <div className="trust-details">
                                    <h4>Government ID</h4>
                                    <p>Not Verified</p>
                                    <div className="trust-action">Verify Now &rarr;</div>
                                </div>
                            </div>
                            <div className="trust-card">
                                <div className="trust-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5.5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                                </div>
                                <div className="trust-details">
                                    <h4>Profile Photo Liveness</h4>
                                    <p>Not Verified</p>
                                    <div className="trust-action">Take Selfie &rarr;</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    <div className="profile-section" style={{ animationDelay: '0.5s' }}>
                        <div className="profile-section-header">
                            <h3>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                Photo Gallery (0/5)
                            </h3>
                        </div>
                        <div className="photo-gallery">
                            <div className="photo-add">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Add Photo</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MyProfile;
