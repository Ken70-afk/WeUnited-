import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    MapPin, 
    Heart, 
    Briefcase, 
    GraduationCap, 
    ShieldCheck, 
    Calendar,
    ChevronLeft,
    Share2,
    CheckCircle2,
    Users,
    Gem,
    Star,
    Phone,
    Mail,
    Loader2,
    X,
    Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import './UserProfile.css';

const UserProfile = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('about');

    // Interest state
    const [interestStatus, setInterestStatus] = useState(null); // null | 'pending' | 'accepted' | 'declined'
    const [interestDocId, setInterestDocId] = useState(null);
    const [interestLoading, setInterestLoading] = useState(false);

    // Shortlist state
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [shortlistDocId, setShortlistDocId] = useState(null);
    const [shortlistLoading, setShortlistLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'profiles', uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setError('Profile not found');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        if (uid) fetchProfile();
    }, [uid]);

    // Fetch interest and shortlist status
    useEffect(() => {
        if (!currentUser?.uid || !uid || currentUser.uid === uid) return;

        const fetchStatus = async () => {
            try {
                // Check outbound interest (current user → this profile)
                const interestQ = query(
                    collection(db, 'interests'),
                    where('fromUid', '==', currentUser.uid),
                    where('toUid', '==', uid)
                );
                const interestSnap = await getDocs(interestQ);
                if (!interestSnap.empty) {
                    const d = interestSnap.docs[0];
                    setInterestStatus(d.data().status);
                    setInterestDocId(d.id);
                }

                // Check shortlist
                const shortlistQ = query(
                    collection(db, 'shortlists'),
                    where('uid', '==', currentUser.uid),
                    where('savedUid', '==', uid)
                );
                const shortlistSnap = await getDocs(shortlistQ);
                if (!shortlistSnap.empty) {
                    setIsShortlisted(true);
                    setShortlistDocId(shortlistSnap.docs[0].id);
                }
            } catch (err) {
                console.error('Error fetching interest/shortlist status:', err);
            }
        };

        fetchStatus();
    }, [currentUser, uid]);

    // Check inbound — did this profile already accept my interest?
    // Already captured via interestStatus === 'accepted'

    const handleSendInterest = async () => {
        if (!currentUser?.uid || currentUser.uid === uid) return;
        setInterestLoading(true);
        try {
            const newInterest = {
                fromUid: currentUser.uid,
                toUid: uid,
                fromName: [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || 'User',
                fromPhoto: currentUser.avatarPhoto || (currentUser.photos?.[0]) || '',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const ref = await addDoc(collection(db, 'interests'), newInterest);
            setInterestDocId(ref.id);
            setInterestStatus('pending');
            showToast('Interest sent! We\'ll notify them.');
        } catch (err) {
            console.error('Error sending interest:', err);
            showToast('Something went wrong. Try again.', 'error');
        } finally {
            setInterestLoading(false);
        }
    };

    const handleWithdrawInterest = async () => {
        if (!interestDocId) return;
        setInterestLoading(true);
        try {
            await deleteDoc(doc(db, 'interests', interestDocId));
            setInterestStatus(null);
            setInterestDocId(null);
            showToast('Interest withdrawn.');
        } catch (err) {
            console.error('Error withdrawing interest:', err);
            showToast('Something went wrong.', 'error');
        } finally {
            setInterestLoading(false);
        }
    };

    const handleShortlist = async () => {
        if (!currentUser?.uid || currentUser.uid === uid) return;
        setShortlistLoading(true);
        try {
            if (isShortlisted && shortlistDocId) {
                await deleteDoc(doc(db, 'shortlists', shortlistDocId));
                setIsShortlisted(false);
                setShortlistDocId(null);
                showToast('Removed from shortlist.');
            } else {
                const ref = await addDoc(collection(db, 'shortlists'), {
                    uid: currentUser.uid,
                    savedUid: uid,
                    savedName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
                    savedPhoto: (profile?.photos?.[0]) || profile?.avatarPhoto || '',
                    createdAt: serverTimestamp(),
                });
                setIsShortlisted(true);
                setShortlistDocId(ref.id);
                showToast('Added to shortlist ⭐');
            }
        } catch (err) {
            console.error('Error toggling shortlist:', err);
            showToast('Something went wrong.', 'error');
        } finally {
            setShortlistLoading(false);
        }
    };

    if (loading) return (
        <div className="profile-loading">
            <div className="loader"></div>
            <p>Gathering Profile Details...</p>
        </div>
    );

    if (error || !profile) return (
        <div className="profile-error">
            <h2>Oops!</h2>
            <p>{error || "We couldn't find this profile."}</p>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '?';
    const mainPhoto = (profile.photos && profile.photos.length > 0)
        ? profile.photos[0]
        : (profile.avatarPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600');

    const isOwnProfile = currentUser?.uid === uid;
    const isMatched = interestStatus === 'accepted';

    const renderInterestButton = () => {
        if (isOwnProfile) return null;
        if (interestLoading) return (
            <button className="action-btn-primary" disabled>
                <Loader2 size={20} className="spin" />
                <span>Please wait...</span>
            </button>
        );
        if (isMatched) return (
            <button className="action-btn-primary sent" disabled>
                <Check size={20} />
                <span>Matched! 🎉</span>
            </button>
        );
        if (interestStatus === 'pending') return (
            <button className="action-btn-primary pending" onClick={handleWithdrawInterest}>
                <Heart size={20} fill="white" />
                <span>Interest Sent · Withdraw</span>
            </button>
        );
        if (interestStatus === 'declined') return (
            <button className="action-btn-primary declined" disabled>
                <X size={20} />
                <span>Not a Match</span>
            </button>
        );
        return (
            <button className="action-btn-primary" onClick={handleSendInterest}>
                <Heart size={20} fill="none" />
                <span>Send Interest</span>
            </button>
        );
    };

    return (
        <div className="user-profile-page">
            {/* Toast */}
            {toast && (
                <div className={`up-toast ${toast.type}`}>
                    {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
                    {toast.message}
                </div>
            )}

            <div className="container profile-view-container">
                {/* Header Actions */}
                <div className="profile-view-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                        <span>Back</span>
                    </button>
                    <div className="header-right">
                        <button className="share-btn-round" title="Share Profile" onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('Profile link copied!');
                        }}>
                            <Share2 size={18} />
                        </button>
                        <button
                            className={`shortlist-btn-round ${isShortlisted ? 'shortlisted' : ''}`}
                            title={isShortlisted ? 'Remove from shortlist' : 'Shortlist'}
                            onClick={handleShortlist}
                            disabled={shortlistLoading || isOwnProfile}
                        >
                            <Star size={18} fill={isShortlisted ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                <div className="profile-main-grid">
                    {/* Left Column */}
                    <div className="profile-sidebar">
                        <div className="main-photo-card">
                            <img src={mainPhoto} alt={fullName} />
                            {profile.isIdVerified && (
                                <div className="verified-stamp">
                                    <ShieldCheck size={16} />
                                    <span>Verified</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="gallery-preview">
                            {profile.photos && profile.photos.slice(1, 4).map((img, idx) => (
                                <img key={idx} src={img} alt={`Gallery ${idx}`} />
                            ))}
                            {profile.photos && profile.photos.length > 4 && (
                                <div className="more-photos">+{profile.photos.length - 4}</div>
                            )}
                        </div>

                        <div className="profile-action-card">
                            <div className="trust-badge-header">
                                <div className="trust-badge-icon">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="trust-badge-info">
                                    <h4 className="trust-score-label">Profile Score: <span>85%</span></h4>
                                    <p className="trust-score-status">Highly matched & verified</p>
                                </div>
                            </div>
                            
                            <div className="action-card-divider"></div>
                            
                            <div className="action-card-btns">
                                {renderInterestButton()}
                                
                                <div className="action-card-secondary">
                                    <button
                                        className={`sec-action-btn-circle ${isShortlisted ? 'active' : ''}`}
                                        title={isShortlisted ? 'Remove from shortlist' : 'Shortlist'}
                                        onClick={handleShortlist}
                                        disabled={shortlistLoading || isOwnProfile}
                                    >
                                        <Star size={20} fill={isShortlisted ? 'currentColor' : 'none'} />
                                    </button>
                                    <button className="sec-action-btn-circle" title="Share Profile" onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                        showToast('Profile link copied!');
                                    }}>
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact reveal on match */}
                            {isMatched && (
                                <div className="contact-reveal">
                                    <p className="contact-reveal-label">🎉 You're matched! Contact details:</p>
                                    {profile.phone && (
                                        <a href={`tel:${profile.phone}`} className="contact-reveal-item">
                                            <Phone size={14} />
                                            <span>{profile.phone}</span>
                                        </a>
                                    )}
                                    {profile.email && (
                                        <a href={`mailto:${profile.email}`} className="contact-reveal-item">
                                            <Mail size={14} />
                                            <span>{profile.email}</span>
                                        </a>
                                    )}
                                    {!profile.phone && !profile.email && (
                                        <p className="no-contact">This user hasn't added contact details yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="profile-content">
                        <section className="profile-intro">
                            <div className="name-box">
                                <h1>{fullName}</h1>
                                <span className="profile-id">ID: {profile.uid?.slice(-8).toUpperCase() || 'WEU8273'}</span>
                            </div>
                            <div className="quick-info-row">
                                <div className="q-item"><Calendar size={16} /> {age} Years</div>
                                <div className="q-item"><MapPin size={16} /> {profile.location || 'Not Specified'}</div>
                                <div className="q-item"><Users size={16} /> {profile.community || 'Any'}</div>
                                <div className="q-item"><Gem size={16} /> {profile.religion || 'Any'}</div>
                            </div>
                        </section>

                        <nav className="profile-tabs">
                            <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button>
                            <button className={activeTab === 'background' ? 'active' : ''} onClick={() => setActiveTab('background')}>Background</button>
                            <button className={activeTab === 'family' ? 'active' : ''} onClick={() => setActiveTab('family')}>Family</button>
                            <button className={activeTab === 'partner' ? 'active' : ''} onClick={() => setActiveTab('partner')}>Expectations</button>
                        </nav>

                        <div className="tab-panel">
                            {activeTab === 'about' && (
                                <div className="tab-section animate-fade">
                                    <h3>About Me</h3>
                                    <p className="bio-text">
                                        {profile.aboutMe || `Hi! I'm ${profile.firstName || 'a user'} on WeUnited. Looking for someone who shares similar values.`}
                                    </p>
                                    
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="label">Height</span>
                                            <span className="value">{profile.height ? `${profile.height} ${profile.heightUnit || 'cm'}` : '--'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Weight</span>
                                            <span className="value">{profile.weight ? `${profile.weight} ${profile.weightUnit || 'kg'}` : '--'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Community</span>
                                            <span className="value">{profile.community || '--'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Religion</span>
                                            <span className="value">{profile.religion || '--'}</span>
                                        </div>
                                        {profile.hobbies && (
                                            <div className="detail-item full">
                                                <span className="label">Hobbies & Interests</span>
                                                <span className="value">{profile.hobbies}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'background' && (
                                <div className="tab-section animate-fade">
                                    <div className="sub-section">
                                        <div className="sub-header">
                                            <GraduationCap size={20} />
                                            <h3>Education</h3>
                                        </div>
                                        <p className="sub-value">{profile.qualification || '--'}</p>
                                    </div>
                                    <div className="sub-section">
                                        <div className="sub-header">
                                            <Briefcase size={20} />
                                            <h3>Profession</h3>
                                        </div>
                                        <p className="sub-value">{profile.job || '--'}</p>
                                        {profile.income && <p className="sub-detail">Income: {profile.income}</p>}
                                    </div>
                                    <div className="sub-section">
                                        <div className="sub-header">
                                            <MapPin size={20} />
                                            <h3>Current Location</h3>
                                        </div>
                                        <p className="sub-value">{profile.location || '--'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="tab-section animate-fade">
                                    <h3>Family Details</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item full">
                                            <span className="label">Family Type</span>
                                            <span className="value">{profile.familyType || '-'}</span>
                                        </div>
                                        <div className="detail-item full">
                                            <span className="label">Family Values</span>
                                            <span className="value">{profile.familyValues || '-'}</span>
                                        </div>
                                        <div className="detail-item full">
                                            <span className="label">Family Status</span>
                                            <span className="value">{profile.familyStatus || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Father's Occupation</span>
                                            <span className="value">{profile.fatherOccupation || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Mother's Occupation</span>
                                            <span className="value">{profile.motherOccupation || '-'}</span>
                                        </div>
                                        {(profile.brothers !== undefined || profile.sisters !== undefined) && (
                                            <div className="detail-item">
                                                <span className="label">Siblings</span>
                                                <span className="value">
                                                    {[
                                                        profile.brothers !== undefined && profile.brothers !== '' ? `${profile.brothers} Brother${profile.brothers !== '1' ? 's' : ''}` : null,
                                                        profile.sisters !== undefined && profile.sisters !== '' ? `${profile.sisters} Sister${profile.sisters !== '1' ? 's' : ''}` : null,
                                                    ].filter(Boolean).join(', ') || '-'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'partner' && (() => {
                                const prefTags = [
                                    (profile.prefAgeMin && profile.prefAgeMax) ? `Age: ${profile.prefAgeMin}–${profile.prefAgeMax}` : null,
                                    (profile.prefHeightMin && profile.prefHeightMax) ? `Height: ${profile.prefHeightMin}–${profile.prefHeightMax} cm` : null,
                                    profile.prefMaritalStatus && profile.prefMaritalStatus !== 'Any' ? `Status: ${profile.prefMaritalStatus}` : null,
                                    profile.prefReligion && profile.prefReligion !== 'Any' ? `Religion: ${profile.prefReligion}` : null,
                                    profile.prefQualification && profile.prefQualification !== 'Any' ? `Education: ${profile.prefQualification}` : null,
                                    profile.prefProfession && profile.prefProfession !== 'Any' ? `Profession: ${profile.prefProfession}` : null,
                                    profile.prefLocation ? `Location: ${profile.prefLocation}` : null,
                                    profile.prefDiet && profile.prefDiet !== 'Any' ? `Diet: ${profile.prefDiet}` : null,
                                    profile.prefSmoking && profile.prefSmoking !== 'Any' ? `Smoking: ${profile.prefSmoking}` : null,
                                    profile.prefDrinking && profile.prefDrinking !== 'Any' ? `Drinking: ${profile.prefDrinking}` : null,
                                ].filter(Boolean);

                                return (
                                    <div className="tab-section animate-fade">
                                        <h3>Partner Expectations</h3>
                                        {profile.partnerDescription ? (
                                            <p className="bio-text">"{profile.partnerDescription}"</p>
                                        ) : (
                                            <p className="bio-text" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                No partner description added yet.
                                            </p>
                                        )}
                                        {prefTags.length > 0 && (
                                            <div className="expectation-tags">
                                                {prefTags.map((tag, i) => (
                                                    <span key={i} className="tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Similar Profiles */}
                        <div className="similar-profiles-mini">
                            <div className="mini-header">
                                <h3>Similar Recommendations</h3>
                                <button onClick={() => navigate('/profiles')}>View More</button>
                            </div>
                            <div className="mini-list">
                                <div className="mini-profile-circ"></div>
                                <div className="mini-profile-circ"></div>
                                <div className="mini-profile-circ"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
