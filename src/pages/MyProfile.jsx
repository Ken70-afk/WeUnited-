import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
    const [userData, setUserData] = useState({
        firstName: 'Abhinav',
        middleName: '',
        lastName: 'Ranjith',
        gender: 'Male',
        dob: '1995-08-14',
        height: '5 ft 10 in',
        weight: '75 kg',
        bioTags: 'Fitness, Travel, Coding',
        community: 'Malayali',
        religion: 'Hindu',
        caste: 'Nair',
        email: 'abhinav@example.com',
        phone: '+1 234 567 8900',
        qualification: 'Masters in Computer Science',
        job: 'Software Engineer',
        income: '$100k - $200k',
        location: 'New York, USA',
        familyInfo: '',
        hobbies: '',
        photos: []
    });

    const [expandedSection, setExpandedSection] = useState('primary');
    const [editingSection, setEditingSection] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Photo States
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [avatarPhoto, setAvatarPhoto] = useState(null);

    useEffect(() => {
        // Load data from localStorage if available (simulating logged in user)
        const savedData = localStorage.getItem('profileDataFull');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        } else {
            // Fallback to basic onboarding data if available
            const savedOnboarding = localStorage.getItem('onboardingData');
            if (savedOnboarding) {
                const ob = JSON.parse(savedOnboarding);
                setUserData(prev => ({ ...prev, ...ob }));
            }
        }

        const savedPhotos = localStorage.getItem('userPhotos');
        if (savedPhotos) {
            setUserData(prev => ({ ...prev, photos: JSON.parse(savedPhotos) }));
        }

        const savedCover = localStorage.getItem('profileCover');
        if (savedCover) setCoverPhoto(savedCover);

        const savedAvatar = localStorage.getItem('profileAvatar');
        if (savedAvatar) setAvatarPhoto(savedAvatar);
    }, []);

    const handleAccordionClick = (section) => {
        if (editingSection) return; // Prevent collapse while editing
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleEditClick = (e, section) => {
        e.stopPropagation();
        setEditFormData(userData);
        setEditingSection(section);
        setExpandedSection(section); // Ensure it's open
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
    };

    const handleSaveEdit = () => {
        // Enforce max 10 tags
        let tags = editFormData.bioTags || '';
        const tagsArr = tags.split(',').map(t => t.trim()).filter(t => t);
        if (tagsArr.length > 10) {
            alert('Maximum 10 Bio Tags allowed.');
            return;
        }

        setUserData(editFormData);
        localStorage.setItem('profileDataFull', JSON.stringify(editFormData));
        if (editFormData.photos) {
            localStorage.setItem('userPhotos', JSON.stringify(editFormData.photos));
        }
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
        if (age < 0 || age > 120) return 'Invalid';
        return age;
    };

    const renderBioTags = (tagsStr) => {
        if (!tagsStr) return '-';
        const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
        return (
            <div className="bio-tags-container">
                {tags.map((tag, idx) => (
                    <span key={idx} className="bio-tag">{tag}</span>
                ))}
            </div>
        );
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

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = [];
        let loadedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPhotos.push(reader.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    setEditFormData(prev => ({
                        ...prev,
                        photos: [...(prev.photos || []), ...newPhotos]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveGalleryPhoto = (index) => {
        setEditFormData(prev => ({
            ...prev,
            photos: (prev.photos || []).filter((_, i) => i !== index)
        }));
    };

    const AccordionItem = ({ id, title, icon, children }) => {
        const isExpanded = expandedSection === id;
        const isEditing = editingSection === id;

        return (
            <div className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                <div className="accordion-header" onClick={() => handleAccordionClick(id)}>
                    <div className="accordion-title">
                        {icon}
                        <span>{title}</span>
                    </div>
                    <div className="accordion-actions">
                        {isExpanded && !isEditing && (
                            <button className="btn-edit-text" onClick={(e) => handleEditClick(e, id)}>Edit</button>
                        )}
                        {isEditing && (
                            <div className="edit-actions" onClick={e => e.stopPropagation()}>
                                <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                                <button className="btn-save" onClick={handleSaveEdit}>Save</button>
                            </div>
                        )}
                        {!isEditing && (
                            isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />
                        )}
                    </div>
                </div>
                {isExpanded && (
                    <div className="accordion-content">
                        {children(isEditing)}
                    </div>
                )}
            </div>
        );
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
                        <h2>{[userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ') || 'User'}</h2>
                        <div className="profile-user-id">Profile ID: WU948275</div>
                        <div className="profile-user-meta">
                            {userData.dob ? `${calculateAge(userData.dob)} yrs, ` : ''}
                            {userData.religion ? `${userData.religion}, ` : ''}
                            {userData.job || 'Professional'}
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
                            ID Proof Verified
                        </div>
                        <div className="badge-item verified" style={{ marginLeft: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Mobile Verified
                        </div>
                    </div>
                </div>

                {/* Right Content Area - Accordions */}
                <div className="profile-content">
                    <div className="accordion-container animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

                        <AccordionItem
                            id="primary"
                            title="Primary Information"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group">
                                        <label className="info-label">First Name <span className="req">*Required</span></label>
                                        <input type="text" name="firstName" value={editFormData.firstName || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Middle Name <span className="opt">(Optional)</span></label>
                                        <input type="text" name="middleName" value={editFormData.middleName || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Last Name <span className="req">*Required</span></label>
                                        <input type="text" name="lastName" value={editFormData.lastName || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Date of Birth (Age) <span className="req">*Required</span></label>
                                        <input type="date" name="dob" value={editFormData.dob || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Height <span className="req">*Required</span></label>
                                        <input type="text" name="height" value={editFormData.height || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. 5 ft 10 in" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Weight <span className="req">*Required</span></label>
                                        <input type="text" name="weight" value={editFormData.weight || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. 75 kg" />
                                    </div>
                                    <div className="ob-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="info-label">Bio (Up to 10 Tags) <span className="req">*Required</span></label>
                                        <input type="text" name="bioTags" value={editFormData.bioTags || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. Fitness, Travel, Animal Lover" />
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>Comma separated</span>
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Gender <span className="opt">(Optional)</span></label>
                                        <select name="gender" value={editFormData.gender || ''} onChange={handleInputChange} className="ob-select">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="info-label">Name</span>
                                        <span className="info-value">{[userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ') || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Age / DOB</span>
                                        <span className="info-value">{(userData.dob ? calculateAge(userData.dob) + ' yrs' : '-') + ' (' + (userData.dob || '-') + ')'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Height</span>
                                        <span className="info-value">{userData.height || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Weight</span>
                                        <span className="info-value">{userData.weight || '-'}</span>
                                    </div>
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="info-label">Bio Tags</span>
                                        {renderBioTags(userData.bioTags)}
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Gender</span>
                                        <span className="info-value">{userData.gender || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="photos"
                            title="My Photos"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="gallery-editing-container">
                                    <div className="gallery-grid">
                                        {(editFormData.photos || []).map((photo, index) => (
                                            <div key={index} className="gallery-item editing">
                                                <img src={photo} alt={`Gallery ${index}`} />
                                                <button className="remove-photo-btn" onClick={() => handleRemoveGalleryPhoto(index)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="gallery-upload-card">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            <span>Add Photo</span>
                                            <input type="file" multiple accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                    <p className="photo-help-text">You can upload multiple photos. Click the "X" on a photo to remove it.</p>
                                </div>
                            ) : (
                                <div className="gallery-view-container">
                                    {(userData.photos && userData.photos.length > 0) ? (
                                        <div className="gallery-grid">
                                            {userData.photos.map((photo, index) => (
                                                <div key={index} className="gallery-item">
                                                    <img src={photo} alt={`Gallery ${index}`} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-gallery">
                                            <div className="empty-icon">📸</div>
                                            <p>No photos uploaded yet. Add photos to get more engagement!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="religion"
                            title="Religious Information"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group">
                                        <label className="info-label">Community <span className="opt">(Optional)</span></label>
                                        <input type="text" name="community" value={editFormData.community || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. Malayali, NRIs, Whites..." />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Religion <span className="opt">(Optional)</span></label>
                                        <input type="text" name="religion" value={editFormData.religion || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. Hindu, Muslim..." />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Caste <span className="opt">(Optional)</span></label>
                                        <input type="text" name="caste" value={editFormData.caste || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. Nair, Ezhava, RC..." />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Community</span>
                                        <span className="info-value">{userData.community || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Religion</span>
                                        <span className="info-value">{userData.religion || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Caste</span>
                                        <span className="info-value">{userData.caste || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="education"
                            title="Education & Profession"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group">
                                        <label className="info-label">Qualification <span className="req">*Required</span></label>
                                        <input type="text" name="qualification" value={editFormData.qualification || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Job / Profession <span className="req">*Required</span></label>
                                        <input type="text" name="job" value={editFormData.job || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Annual Income <span className="opt">(Optional)</span></label>
                                        <input type="text" name="income" value={editFormData.income || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Qualification</span>
                                        <span className="info-value">{userData.qualification || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Job / Profession</span>
                                        <span className="info-value">{userData.job || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Annual Income</span>
                                        <span className="info-value">{userData.income || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="location"
                            title="Location Information"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="info-label">Place (Current) <span className="req">*Required</span></label>
                                        <input type="text" name="location" value={editFormData.location || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. New York, USA" />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="info-label">Current Place</span>
                                        <span className="info-value">{userData.location || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="contact"
                            title="Contact Information"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group">
                                        <label className="info-label">Email <span className="opt">(Optional)</span></label>
                                        <input type="email" name="email" value={editFormData.email || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                    <div className="ob-form-group">
                                        <label className="info-label">Phone <span className="opt">(Optional)</span></label>
                                        <input type="tel" name="phone" value={editFormData.phone || ''} onChange={handleInputChange} className="ob-input" />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{userData.email || '-'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{userData.phone || '-'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="family"
                            title="Family Information"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="info-label">Family Details <span className="opt">(Optional)</span></label>
                                        <textarea name="familyInfo" value={editFormData.familyInfo || ''} onChange={handleInputChange} className="ob-input" rows="3" placeholder="Tell us about your family..."></textarea>
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="info-label">Family Details</span>
                                        <span className="info-value">{userData.familyInfo || 'Not specified'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                        <AccordionItem
                            id="hobbies"
                            title="Hobbies & Interests"
                            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>}
                        >
                            {(isEditing) => isEditing ? (
                                <div className="info-grid">
                                    <div className="ob-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="info-label">Hobbies <span className="opt">(Optional)</span></label>
                                        <input type="text" name="hobbies" value={editFormData.hobbies || ''} onChange={handleInputChange} className="ob-input" placeholder="e.g. Reading, Traveling, Cooking" />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <span className="info-label">Hobbies</span>
                                        <span className="info-value">{userData.hobbies || 'Not specified'}</span>
                                    </div>
                                </div>
                            )}
                        </AccordionItem>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
