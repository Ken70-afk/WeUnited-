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
    ChevronRight,
    Image,
    Share2,
    CheckCircle2,
    Users,
    Gem,
    Star,
    Phone,
    Mail,
    Loader2,
    X,
    Check,
    Lock,
    AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
    doc,
    getDoc,
    addDoc,
    setDoc,
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
    const [isMutualMatch, setIsMutualMatch] = useState(false);

    // Shortlist state
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [shortlistDocId, setShortlistDocId] = useState(null);
    const [shortlistLoading, setShortlistLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    // Similar profiles state
    const [similarProfiles, setSimilarProfiles] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);

    // Dev tier override
    const [devOverride, setDevOverride] = useState(() => localStorage.getItem('devTierOverride'));

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Report state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportNotes, setReportNotes] = useState('');
    const [reportLoading, setReportLoading] = useState(false);

    const openLightbox = (index) => {
        if (isFreeUser || !profile.photos || profile.photos.length === 0) return;
        setCurrentPhotoIndex(index);
        setLightboxOpen(true);
    };

    const nextPhoto = (e) => {
        if (e) e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    };

    const prevPhoto = (e) => {
        if (e) e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    };

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

    // Track profile visit
    useEffect(() => {
        if (!uid || !currentUser?.uid || uid === currentUser.uid) return;

        const trackVisit = async () => {
            try {
                // Use a composite ID to track "latest" visit per unique pair, or just addDoc for history.
                // The user said "See who visited", so a unique list of visitors is usually intended.
                const visitId = `${currentUser.uid}_${uid}`;
                const visitRef = doc(db, 'profile_views', visitId);
                
                await setDoc(visitRef, {
                    viewerUid: currentUser.uid,
                    viewerName: `${currentUser.firstName || 'User'} ${currentUser.lastName || ''}`.trim(),
                    viewerPhoto: currentUser.avatarPhoto || (currentUser.photos?.[0]) || '',
                    ownerUid: uid,
                    timestamp: serverTimestamp()
                }, { merge: true });
            } catch (err) {
                console.error('Error tracking profile visit:', err);
            }
        };

        trackVisit();
    }, [uid, currentUser]);

    // Fetch similar profiles
    useEffect(() => {
        if (!profile || !profile.gender || !uid) return;

        const fetchSimilar = async () => {
            setSimilarLoading(true);
            try {
                const q = query(
                    collection(db, 'profiles'),
                    where('gender', '==', profile.gender)
                );
                const snap = await getDocs(q);
                let candidates = [];
                snap.forEach(doc => {
                    if (doc.id !== uid && doc.id !== currentUser?.uid) {
                        const data = doc.data();
                        if (data.role === 'admin' || data.status === 'suspended') return;
                        candidates.push({ uid: doc.id, ...data });
                    }
                });

                // Algorithm: Religion > Caste > Community
                const scored = candidates.map(c => {
                    let score = 0;
                    if (c.religion && profile.religion && c.religion === profile.religion) score += 1000;
                    if (c.caste && profile.caste && c.caste === profile.caste) score += 100;
                    if (c.community && profile.community && c.community === profile.community) score += 10;

                    if (c.dob && profile.dob) {
                        const ageC = new Date().getFullYear() - new Date(c.dob).getFullYear();
                        const ageP = new Date().getFullYear() - new Date(profile.dob).getFullYear();
                        const diff = Math.abs(ageC - ageP);
                        score -= diff;
                    }

                    return { ...c, simScore: score };
                });

                // Keep only those with at least some similarity bonus
                const filteredScored = scored.filter(c => c.simScore > 0);
                filteredScored.sort((a, b) => b.simScore - a.simScore);
                setSimilarProfiles(filteredScored.slice(0, 3));
            } catch (err) {
                console.error("Error fetching similar profiles:", err);
            } finally {
                setSimilarLoading(false);
            }
        };

        fetchSimilar();
    }, [profile?.gender, profile?.religion, profile?.caste, profile?.community, uid, currentUser?.uid]);

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
                
                let foundOutbound = false;
                if (!interestSnap.empty) {
                    const d = interestSnap.docs[0];
                    setInterestStatus(d.data().status);
                    setInterestDocId(d.id);
                    foundOutbound = true;
                    if (d.data().status === 'accepted') setIsMutualMatch(true);
                }

                // Check inbound interest (this profile → current user)
                const inboundQ = query(
                    collection(db, 'interests'),
                    where('fromUid', '==', uid),
                    where('toUid', '==', currentUser.uid)
                );
                const inboundSnap = await getDocs(inboundQ);
                if (!inboundSnap.empty) {
                    const d = inboundSnap.docs[0];
                    // If inbound exists and is accepted, it's mutual
                    if (d.data().status === 'accepted') {
                        setIsMutualMatch(true);
                        // If we didn't have an outbound status yet, use the inbound status for the UI buttons
                        if (!foundOutbound) setInterestStatus('accepted');
                    }
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

    const handleReportUser = async () => {
        if (!currentUser?.uid || currentUser.uid === uid || !reportReason) return;
        setReportLoading(true);
        try {
            await addDoc(collection(db, 'reports'), {
                reportedUid: uid,
                reportedName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
                reporterUid: currentUser.uid,
                reporterName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
                reason: reportReason,
                notes: reportNotes,
                status: 'pending', // pending, reviewed, ignored, warned, suspended
                createdAt: serverTimestamp(),
            });
            setIsReportModalOpen(false);
            setReportReason('');
            setReportNotes('');
            showToast('Report submitted successfully. Our team will review it shortly.');
        } catch (err) {
            console.error('Error submitting report:', err);
            showToast('Failed to submit report. Please try again.', 'error');
        } finally {
            setReportLoading(false);
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

    const isOwnProfile = currentUser?.uid === uid;
    const planTier = currentUser?.plan === 'premium' ? 'premium' : currentUser?.plan === 'basic' ? 'basic' : 'free';
    const isGodMode = currentUser?.role === 'admin';
    const effectiveTier = (isGodMode && devOverride) ? devOverride : planTier;
    const isFreeUser = !isOwnProfile && effectiveTier === 'free';
    const profileIdDisplay = profile.profileId || `WU${uid.substring(0, 6).toUpperCase()}`;
    const fullName = isFreeUser ? profileIdDisplay : `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const age = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '?';
    const mainPhoto = (profile.photos && profile.photos.length > 0)
        ? profile.photos[0]
        : (profile.avatarPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600');

    const calculateCompletion = (p) => {
        if (!p) return 0;
        let score = 0;
        if (p.firstName) score += 5;
        if (p.lastName) score += 5;
        if (p.dob) score += 10;
        if (p.gender) score += 5;
        if (p.height) score += 5;
        if (p.weight) score += 5;
        if (p.aboutMe) score += 10;
        if (p.community) score += 5;
        if (p.religion) score += 5;
        if (p.qualification) score += 5;
        if (p.job) score += 5;
        if (p.location) score += 5;
        if (p.hobbies) score += 5;
        if (p.email || p.phone) score += 5;

        const photoCount = p.photos ? p.photos.length : 0;
        if (photoCount === 1) score += 10;
        else if (photoCount === 2) score += 15;
        else if (photoCount >= 3) score += 20;

        return Math.min(score, 100);
    };

    const completionScore = calculateCompletion(profile);

    const getProfileStatusText = () => {
        const isVerified = profile.verified === true || profile.isVerified === true;

        let matchesPrefs = false;
        const prefs = currentUser?.partnerPreferences || currentUser?.partnerPref;
        if (prefs) {
            const matchesReligion = !prefs.religion || prefs.religion === 'Any' || prefs.religion === profile.religion;
            const matchesCommunity = !prefs.community || prefs.community === 'Any' || prefs.community === profile.community;

            // Age match
            let matchesAge = true;
            if (prefs.ageRange && age !== '?' && typeof age === 'number') {
                const [min, max] = prefs.ageRange.split('-').map(n => parseInt(n));
                if (min && max) {
                    if (age < min || age > max) matchesAge = false;
                }
            }

            if (matchesReligion && matchesCommunity && matchesAge) {
                matchesPrefs = true;
            }
        }

        if (isVerified && matchesPrefs) return "Highly matched & verified";
        if (isVerified) return "Verified Profile";
        if (matchesPrefs) return "Highly matched to your preferences";
        if (completionScore >= 80) return "High profile completion";
        return "Profile details completed";
    };

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
                        {!isFreeUser && (
                            <button
                                className={`shortlist-btn-round ${isShortlisted ? 'shortlisted' : ''}`}
                                title={isShortlisted ? 'Remove from shortlist' : 'Shortlist'}
                                onClick={handleShortlist}
                                disabled={shortlistLoading || isOwnProfile}
                            >
                                <Star size={18} fill={isShortlisted ? 'currentColor' : 'none'} />
                            </button>
                        )}
                        {!isOwnProfile && (
                            <button className="share-btn-round" title="Report Profile" onClick={() => setIsReportModalOpen(true)} style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
                                <AlertTriangle size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="profile-main-grid">
                    {/* Left Column */}
                    <div className="profile-sidebar">
                        <div className="main-photo-card">
                            <img src={mainPhoto} alt={fullName} />
                        </div>

                        {profile.photos && profile.photos.length > 1 && (
                            <button className="sec-action-btn" onClick={() => setActiveTab('gallery')} style={{ width: '90%', marginTop: '0.5rem', padding: '1rem', marginLeft: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <Image size={18} /> View All {profile.photos.length} Photos
                            </button>
                        )}

                        <div className="profile-action-card" style={{ marginTop: '0.05rem' }}>
                            <div className="trust-badge-header">
                                <div className="trust-badge-icon">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="trust-badge-info">
                                    <h4 className="trust-score-label">Profile Score: <span>{completionScore}%</span></h4>
                                    <p className="trust-score-status">{getProfileStatusText()}</p>
                                </div>
                            </div>

                            <div className="action-card-divider"></div>

                            <div className="action-card-btns">
                                {isFreeUser ? (
                                    <button
                                        className="action-btn-primary"
                                        onClick={() => navigate('/membership')}
                                    >
                                        <span>✨ Upgrade to Connect</span>
                                    </button>
                                ) : (
                                    renderInterestButton()
                                )}

                                <div className="action-card-secondary">
                                    {!isFreeUser && (
                                        <button
                                            className={`sec-action-btn-circle ${isShortlisted ? 'active' : ''}`}
                                            title={isShortlisted ? 'Remove from shortlist' : 'Shortlist'}
                                            onClick={handleShortlist}
                                            disabled={shortlistLoading || isOwnProfile}
                                        >
                                            <Star size={20} fill={isShortlisted ? 'currentColor' : 'none'} />
                                        </button>
                                    )}
                                    <button className="sec-action-btn-circle" title="Share Profile" onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                        showToast('Profile link copied!');
                                    }}>
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact reveal on match */}
                            {isMatched && !isFreeUser && (
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
                            {isMatched && isFreeUser && (
                                <div className="contact-reveal" style={{ textAlign: 'center', background: '#fdf4ff', borderColor: '#e9d5ff' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🔒</div>
                                    <p style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>Contacts are Locked</p>
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 8px' }}>You matched! Upgrade to a Basic or Premium plan to view contact details.</p>
                                    <button onClick={() => navigate('/membership')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                                        🔓 Upgrade to Unlock
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="profile-content">
                        <section className="profile-intro">
                            <div className="name-box">
                                <h1 style={isFreeUser ? { userSelect: 'none' } : {}}>{fullName}</h1>
                                <span className="profile-id">ID: {profile.uid?.slice(-8).toUpperCase() || 'WEU8273'}</span>
                            </div>
                            {isFreeUser && (
                                <div style={{ background: 'linear-gradient(135deg,#762a7b18,#a855f718)', border: '1px solid #a855f7', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#762a7b' }}>🔒 Upgrade to Basic or Premium to view their Gallery and Connect.</p>
                                    <button onClick={() => navigate('/membership')} style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg,#762a7b,#a855f7)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                                        View Plans
                                    </button>
                                </div>
                            )}
                            <div className="quick-info-row">
                                <div className="q-item"><Calendar size={16} /> {age} Years</div>
                                <div className="q-item"><MapPin size={16} /> {profile.location || 'Not Specified'}</div>
                                <div className="q-item"><Users size={16} /> {profile.community || 'Any'}</div>
                                <div className="q-item"><Gem size={16} /> {profile.religion || 'Any'}</div>
                            </div>
                        </section>

                        <nav className="profile-tabs">
                            <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button>
                            <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Gallery</button>
                            <button className={activeTab === 'background' ? 'active' : ''} onClick={() => setActiveTab('background')}>Background</button>
                            <button className={activeTab === 'family' ? 'active' : ''} onClick={() => setActiveTab('family')}>Family</button>
                            <button className={activeTab === 'partner' ? 'active' : ''} onClick={() => setActiveTab('partner')}>Expectations</button>
                        </nav>

                        <div className="tab-panel">
                            {activeTab === 'gallery' && (
                                <div className="tab-section animate-fade">
                                    <h3>Photo Gallery</h3>
                                    {(!profile.photos || profile.photos.length === 0) ? (
                                        <p style={{ color: '#64748b' }}>No photos available.</p>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                                {profile.photos.map((img, idx) => {
                                                    // Security: Do NOT embed the real Firebase photo URL in the DOM for free tier users
                                                    const displayImg = isFreeUser 
                                                        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=10&blur=100' 
                                                        : img;
                                                        
                                                    return (
                                                        <div key={idx} onClick={() => openLightbox(idx)} style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', cursor: isFreeUser ? 'default' : 'pointer', background: '#f1f5f9' }}>
                                                            <img 
                                                                src={displayImg} 
                                                                alt={isFreeUser ? "Restricted Photo" : `Gallery ${idx}`} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isFreeUser ? 'blur(16px)' : 'none', transition: 'transform 0.3s' }} 
                                                                className={!isFreeUser ? 'gallery-img-hover' : ''} 
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {isFreeUser && (
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', borderRadius: '16px', zIndex: 10 }}>
                                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '400px' }}>
                                                        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🔒</span>
                                                        <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: '0.5rem' }}>Upgrade to View Gallery</h4>
                                                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Premium and Basic members get full access to user photos.</p>
                                                        <button onClick={() => navigate('/membership')} className="action-btn-primary" style={{ margin: '0 auto', maxWidth: '200px' }}>View Plans</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

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

                                    {/* --- Contact Information Unlock Section --- */}
                                    <div className="contact-unlock-section" style={{ marginTop: '2.5rem' }}>
                                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)' }}>Contact Information</h3>
                                        {isMutualMatch && !isFreeUser ? (
                                            <div className="contact-card unlocked animate-fade">
                                                <div className="contact-item">
                                                    <div className="contact-icon email">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div className="contact-details">
                                                        <span className="contact-label">Email Address</span>
                                                        <span className="contact-value">{profile.email || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="contact-item">
                                                    <div className="contact-icon phone">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div className="contact-details">
                                                        <span className="contact-label">Phone Number</span>
                                                        <span className="contact-value">{profile.phone || '+1 234 567 890'}</span>
                                                    </div>
                                                </div>
                                                <div className="contact-badge">
                                                    <ShieldCheck size={14} />
                                                    Unlocked via mutual connection
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="contact-card locked">
                                                <div className="lock-overlay">
                                                    <div className="lock-icon-bg">
                                                        <Lock size={28} />
                                                    </div>
                                                    <h4>Contacts are Locked</h4>
                                                    <p>{isFreeUser && isMutualMatch 
                                                        ? 'You matched! Upgrade to a Basic or Premium plan to view contact details.' 
                                                        : 'Connect and accept each other\'s interests to unlock contact details.'}</p>
                                                    <button 
                                                        className="sec-action-btn" 
                                                        onClick={() => {
                                                            if (isFreeUser) {
                                                                navigate('/membership');
                                                            } else {
                                                                const el = document.querySelector('.action-card-btns');
                                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                            }
                                                        }}
                                                        style={{ 
                                                            marginTop: '1rem', 
                                                            background: isFreeUser ? 'var(--primary)' : 'white', 
                                                            color: isFreeUser ? 'white' : 'var(--primary)', 
                                                            border: '1px solid #e9d5ff',
                                                            padding: '0.6rem 1.2rem',
                                                            borderRadius: '50px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {isFreeUser 
                                                            ? '👑 Upgrade to Unlock' 
                                                            : interestStatus === 'pending' ? 'Waiting for Response' : 'Send Interest to Unlock'}
                                                    </button>
                                                </div>
                                                <div className="contact-item-blurred">
                                                    <div className="contact-icon-blurred"></div>
                                                    <div className="contact-details-blurred">
                                                        <div className="blur-line short"></div>
                                                        <div className="blur-line long"></div>
                                                    </div>
                                                </div>
                                                <div className="contact-item-blurred">
                                                    <div className="contact-icon-blurred"></div>
                                                    <div className="contact-details-blurred">
                                                        <div className="blur-line short"></div>
                                                        <div className="blur-line long"></div>
                                                    </div>
                                                </div>
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
                                    profile.prefGender && profile.prefGender !== 'Any' ? `Looking For: ${profile.prefGender}` : null,
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
                                {similarLoading ? (
                                    <>
                                        <div className="mini-profile-circ" style={{ animation: 'pulse 1.5s infinite', background: '#e2e8f0' }}></div>
                                        <div className="mini-profile-circ" style={{ animation: 'pulse 1.5s infinite', background: '#e2e8f0', animationDelay: '0.2s' }}></div>
                                        <div className="mini-profile-circ" style={{ animation: 'pulse 1.5s infinite', background: '#e2e8f0', animationDelay: '0.4s' }}></div>
                                    </>
                                ) : similarProfiles.length > 0 ? (
                                    similarProfiles.map(sim => (
                                        <div
                                            key={sim.uid}
                                            className="mini-profile-circ"
                                            title={`${sim.firstName || ''} ${sim.lastName || ''} (${sim.religion || ''} / ${sim.caste || ''})`.trim()}
                                            onClick={() => {
                                                navigate(`/profile/${sim.uid}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <img src={(sim.photos && sim.photos[0]) || sim.avatarPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'} alt="sim" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No highly similar profiles found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && profile.photos && profile.photos.length > 0 && !isFreeUser && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100001, transition: 'background 0.2s' }} className="lightbox-nav-btn">
                        <X size={24} />
                    </button>

                    <button onClick={prevPhoto} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100001, backdropFilter: 'blur(4px)', transition: 'background 0.2s' }} className="lightbox-nav-btn">
                        <ChevronLeft size={30} />
                    </button>

                    <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}>
                        <img src={profile.photos[currentPhotoIndex]} alt="Gallery Full" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }} />
                        <div style={{ position: 'absolute', bottom: '-30px', left: '0', right: '0', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>
                            {currentPhotoIndex + 1} of {profile.photos.length}
                        </div>
                    </div>

                    <button onClick={nextPhoto} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100001, backdropFilter: 'blur(4px)', transition: 'background 0.2s' }} className="lightbox-nav-btn">
                        <ChevronRight size={30} />
                    </button>
                </div>
            )}

            {/* Dev Tier Override */}
            {isGodMode && (
                <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>🧪 Dev Tier:</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {['free', 'basic', 'premium'].map(t => (
                            <button key={t} onClick={() => setDevOverride(t === devOverride ? null : t)}
                                style={{
                                    padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', textTransform: 'capitalize',
                                    background: effectiveTier === t ? 'var(--primary)' : '#f3f4f6',
                                    color: effectiveTier === t ? 'white' : '#374151',
                                    border: 'none', cursor: 'pointer'
                                }}>
                                {t}{!devOverride && t === planTier ? ' (actual)' : devOverride === t ? ' ✓' : ''}
                            </button>
                        ))}
                    </div>
                    {devOverride && <span style={{ color: '#856404', display: 'block', marginTop: '4px', fontSize: '11px' }}>overriding actual: <b>{planTier}</b></span>}
                </div>
            )}

            {/* Report Modal */}
            {isReportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={20} color="#ef4444" />
                            Report User
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                            Please let us know why you are reporting this user. Your report will be kept strictly anonymous.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[
                                'Fake Profile',
                                'Inappropriate Content',
                                'Harassment / Abusive Behavior',
                                'Spam / Suspicious Activity',
                                'Other'
                            ].map((reason) => (
                                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input 
                                        type="radio" 
                                        name="reportReason" 
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {reason}
                                </label>
                            ))}
                        </div>

                        {reportReason === 'Other' && (
                            <textarea
                                placeholder="Please provide more details..."
                                value={reportNotes}
                                onChange={(e) => setReportNotes(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1.5rem', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            />
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => { setIsReportModalOpen(false); setReportReason(''); setReportNotes(''); }}
                                style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReportUser}
                                disabled={!reportReason || reportLoading}
                                style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: (!reportReason || reportLoading) ? 'not-allowed' : 'pointer', opacity: (!reportReason || reportLoading) ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {reportLoading ? <Loader2 size={16} className="spin" /> : null}
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
