import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profiles.css';
import avatarPlaceholder1 from '../assets/hero_bg.png';
import avatarPlaceholder2 from '../assets/profile_avatar.png';
import {
    Filter,
    MapPin,
    Briefcase,
    GraduationCap,
    Heart,
    CheckCircle,
    AlertCircle,
    Star
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

const Profiles = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profilesList, setProfilesList] = useState([]);
    const [connectedProfiles, setConnectedProfiles] = useState({});
    const [connectingId, setConnectingId] = useState(null);
    const [shortlistedProfiles, setShortlistedProfiles] = useState({});
    const [shortlistDocs, setShortlistDocs] = useState({});
    const [shortlistingId, setShortlistingId] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Derive plan tier from Firestore profile field
    const planTier = user?.plan === 'premium' ? 'premium' : user?.plan === 'basic' ? 'basic' : 'free';
    const isGodMode = user?.role === 'admin';

    // DEV: local override for testing tiers without touching Firestore
    const [devOverride, setDevOverride] = useState(() => localStorage.getItem('devTierOverride')); // null | 'free' | 'basic' | 'premium'
    const effectiveTier = (isGodMode && devOverride) ? devOverride : planTier;
    const effectiveFree = effectiveTier === 'free';
    const effectiveBasic = effectiveTier === 'basic';
    const effectivePremium = effectiveTier === 'premium';

    const handleSetDevOverride = (t) => {
        const newVal = t === devOverride ? null : t;
        setDevOverride(newVal);
        if (newVal) localStorage.setItem('devTierOverride', newVal);
        else localStorage.removeItem('devTierOverride');
    };

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'profiles'));
                const fetched = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id !== user?.uid) {
                        const p = doc.data();
                        
                        // Hide admins and suspended users from public feeds
                        if (p.role === 'admin' || p.status === 'suspended') return;

                        let parsedTags = [];
                        if (p.bioTags) {
                            parsedTags = typeof p.bioTags === 'string'
                                ? p.bioTags.split(',').map(s => s.trim()).filter(Boolean)
                                : (Array.isArray(p.bioTags) ? p.bioTags : []);
                        }

                        let computedAge = 25;
                        if (p.dob) {
                            const today = new Date();
                            const birthDate = new Date(p.dob);
                            computedAge = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                computedAge--;
                            }
                        }

                        fetched.push({
                            id: doc.id,
                            profileId: p.profileId || `WU${doc.id.substring(0, 6).toUpperCase()}`,
                            firstName: p.firstName || 'Unknown',
                            lastName: p.lastName || '',
                            age: computedAge,
                            height: `${p.height || '--'} ${p.heightUnit || 'cm'}`,
                            location: p.location || 'Unknown',
                            community: p.community || 'Unknown',
                            religion: p.religion || 'Unknown',
                            caste: p.caste || '-',
                            profession: p.job || 'Professional',
                            income: p.income || 'Not specified',
                            qualification: p.qualification || 'Not specified',
                            bioTags: parsedTags,
                            photo: (p.photos && p.photos.length > 0) ? p.photos[0] : (p.avatarPhoto || p.coverPhoto || avatarPlaceholder1),
                            isVerified: p.isIdVerified || false,
                            matchPercent: Math.floor(Math.random() * 20) + 80,
                            gender: (p.gender || '').toLowerCase(),
                            maritalStatus: p.maritalStatus || '',
                            heightRaw: parseFloat(p.height) || 0,
                            heightUnit: p.heightUnit || 'cm',
                            hasPhoto: !!(p.photos && p.photos.length > 0)
                        });
                    }
                });
                setProfilesList(fetched);

                // Fetch current user's outbound interests
                const intQ = query(collection(db, 'interests'), where('fromUid', '==', user.uid));
                const intSnap = await getDocs(intQ);
                const connectedMap = {};
                intSnap.forEach(d => { connectedMap[d.data().toUid] = true; });
                setConnectedProfiles(connectedMap);

                // Fetch current user's shortlists
                const shortQ = query(collection(db, 'shortlists'), where('uid', '==', user.uid));
                const shortSnap = await getDocs(shortQ);
                const shortMap = {};
                const shortIds = {};
                shortSnap.forEach(d => {
                    shortMap[d.data().savedUid] = true;
                    shortIds[d.data().savedUid] = d.id;
                });
                setShortlistedProfiles(shortMap);
                setShortlistDocs(shortIds);
            } catch (err) {
                console.error('Error fetching profiles', err);
            }
        };

        if (user) fetchProfiles();
    }, [user]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileFiltersOpen]);

    const [filters, setFilters] = useState({
        minAge: '', maxAge: '', religion: '', community: '', caste: '', location: '',
        profession: '', qualification: '', income: '',
        minHeight: '', maxHeight: '', maritalStatus: '',
        verifiedOnly: false, withPhotoOnly: false
    });

    const handleConnectClick = async (profileId) => {
        if (connectedProfiles[profileId] || connectingId === profileId) return;
        setConnectingId(profileId);

        try {
            const newInterest = {
                fromUid: user.uid,
                toUid: profileId,
                fromName: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User',
                fromPhoto: user.avatarPhoto || (user.photos?.[0]) || '',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await addDoc(collection(db, 'interests'), newInterest);
            setConnectedProfiles(prev => ({ ...prev, [profileId]: true }));
        } catch (error) {
            console.error('Error sending interest:', error);
            alert('Failed to send interest.');
        } finally {
            setConnectingId(null);
        }
    };

    const handleShortlistClick = async (profileId) => {
        if (shortlistingId === profileId) return;
        setShortlistingId(profileId);

        try {
            if (shortlistedProfiles[profileId]) {
                const docId = shortlistDocs[profileId];
                if (docId) {
                    await deleteDoc(doc(db, 'shortlists', docId));
                    setShortlistedProfiles(prev => ({ ...prev, [profileId]: false }));
                    setShortlistDocs(prev => {
                        const copy = { ...prev };
                        delete copy[profileId];
                        return copy;
                    });
                }
            } else {
                const targetProfile = profilesList.find(p => p.id === profileId);
                const ref = await addDoc(collection(db, 'shortlists'), {
                    uid: user.uid,
                    savedUid: profileId,
                    savedName: targetProfile?.firstName || 'User',
                    savedPhoto: targetProfile?.photo || '',
                    createdAt: serverTimestamp(),
                });
                setShortlistedProfiles(prev => ({ ...prev, [profileId]: true }));
                setShortlistDocs(prev => ({ ...prev, [profileId]: ref.id }));
            }
        } catch (error) {
            console.error('Error toggling shortlist:', error);
        } finally {
            setShortlistingId(null);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const clearFilters = () => {
        setFilters({
            minAge: '', maxAge: '', religion: '', community: '', caste: '', location: '',
            profession: '', qualification: '', income: '',
            minHeight: '', maxHeight: '', maritalStatus: '',
            verifiedOnly: false, withPhotoOnly: false
        });
    };

    const filteredProfiles = useMemo(() => {
        // Gender-based filtering: show opposite gender by default
        const userGender = (user?.gender || '').toLowerCase();
        const userPreference = (user?.prefGender || user?.partnerPreference || user?.lookingFor || '').toLowerCase();

        return profilesList.filter(profile => {
            // Gender filter: show opposite gender by default
            // Skip only if user gender is 'any'/'other'/empty, or partnerPreference is explicitly 'any'
            const skipGenderFilter = !userGender || userGender === 'any' || userGender === 'other' || userPreference === 'any';
            if (!skipGenderFilter) {
                if (userGender === 'male' && profile.gender !== 'female') return false;
                if (userGender === 'female' && profile.gender !== 'male') return false;
            }

            if (filters.minAge && profile.age < parseInt(filters.minAge)) return false;
            if (filters.maxAge && profile.age > parseInt(filters.maxAge)) return false;
            if (filters.religion && !profile.religion.toLowerCase().includes(filters.religion.toLowerCase())) return false;
            if (filters.community && !profile.community.toLowerCase().includes(filters.community.toLowerCase())) return false;
            if (filters.caste && !profile.caste.toLowerCase().includes(filters.caste.toLowerCase())) return false;
            if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.profession && !profile.profession.toLowerCase().includes(filters.profession.toLowerCase())) return false;
            if (filters.qualification && !profile.qualification.toLowerCase().includes(filters.qualification.toLowerCase())) return false;
            if (filters.income && !profile.income.toLowerCase().includes(filters.income.toLowerCase())) return false;
            if (filters.maritalStatus && !profile.maritalStatus.toLowerCase().includes(filters.maritalStatus.toLowerCase())) return false;
            if (filters.minHeight && profile.heightRaw && profile.heightRaw < parseFloat(filters.minHeight)) return false;
            if (filters.maxHeight && profile.heightRaw && profile.heightRaw > parseFloat(filters.maxHeight)) return false;
            if (filters.verifiedOnly && !profile.isVerified) return false;
            if (filters.withPhotoOnly && !profile.hasPhoto) return false;
            return true;
        });
    }, [filters, profilesList, user]);

    // Plan-based quota: basic = 60%, free = all visible but blurred, premium = all unlocked
    const BASIC_QUOTA = Math.ceil(filteredProfiles.length * 0.6);
    const visibleCount = effectiveBasic ? BASIC_QUOTA : filteredProfiles.length;
    const allDisplayed = filteredProfiles; // always render all; blur/lock is visual

    const filterFields = (
        <>
            {/* FREE TIER: Age + Religion + Community */}
            <div className="filter-group">
                <label className="filter-label">Age Range</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange} className="filter-input" placeholder="Min Age" min="18" />
                    <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} className="filter-input" placeholder="Max Age" />
                </div>
            </div>
            <div className="filter-group">
                <label className="filter-label">Religion</label>
                <input type="text" name="religion" value={filters.religion} onChange={handleFilterChange} className="filter-input" placeholder="Hindu, Muslim, Christian..." />
            </div>
            <div className="filter-group">
                <label className="filter-label">Community</label>
                <input type="text" name="community" value={filters.community} onChange={handleFilterChange} className="filter-input" placeholder="Malayali, Tamil, Punjabi..." />
            </div>

            {/* BASIC TIER: + Caste, Location, Profession, Qualification */}
            {(effectiveBasic || effectivePremium) && (
                <>
                    <div className="filter-tier-divider">
                        <span>Basic Filters</span>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Caste</label>
                        <input type="text" name="caste" value={filters.caste} onChange={handleFilterChange} className="filter-input" placeholder="Nair, Brahmin, Sunni..." />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Location</label>
                        <input type="text" name="location" value={filters.location} onChange={handleFilterChange} className="filter-input" placeholder="City or Country..." />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Profession</label>
                        <input type="text" name="profession" value={filters.profession} onChange={handleFilterChange} className="filter-input" placeholder="Doctor, Engineer..." />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Qualification</label>
                        <input type="text" name="qualification" value={filters.qualification} onChange={handleFilterChange} className="filter-input" placeholder="Bachelors, Masters..." />
                    </div>
                </>
            )}

            {/* PREMIUM TIER: + Height, Income, Marital Status, Verified Only, Photo Only */}
            {effectivePremium && (
                <>
                    <div className="filter-tier-divider premium">
                        <span>✨ Premium Filters</span>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Height Range (cm)</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" name="minHeight" value={filters.minHeight} onChange={handleFilterChange} className="filter-input" placeholder="Min" />
                            <input type="number" name="maxHeight" value={filters.maxHeight} onChange={handleFilterChange} className="filter-input" placeholder="Max" />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Annual Income</label>
                        <select name="income" value={filters.income} onChange={handleFilterChange} className="filter-input" style={{ cursor: 'pointer' }}>
                            <option value="">Any</option>
                            <option value="0-50k">0 - 50k</option>
                            <option value="50k-100k">50k - 100k</option>
                            <option value="100k-200k">100k - 200k</option>
                            <option value="200k+">200k+</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Marital Status</label>
                        <select name="maritalStatus" value={filters.maritalStatus} onChange={handleFilterChange} className="filter-input" style={{ cursor: 'pointer' }}>
                            <option value="">Any</option>
                            <option value="Unmarried">Unmarried</option>
                            <option value="Legally Separated">Legally Separated</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-toggle">
                            <input type="checkbox" name="verifiedOnly" checked={filters.verifiedOnly} onChange={handleFilterChange} />
                            <span className="toggle-slider"></span>
                            <span className="toggle-label">Verified Profiles Only</span>
                        </label>
                    </div>
                    <div className="filter-group">
                        <label className="filter-toggle">
                            <input type="checkbox" name="withPhotoOnly" checked={filters.withPhotoOnly} onChange={handleFilterChange} />
                            <span className="toggle-slider"></span>
                            <span className="toggle-label">With Photo Only</span>
                        </label>
                    </div>
                </>
            )}

            {/* Upgrade prompt for free users */}
            {effectiveFree && (
                <div className="filter-upgrade-prompt">
                    <span>🔒</span>
                    <p>Upgrade to Basic for more filters</p>
                    <button onClick={() => navigate('/membership')}>Upgrade</button>
                </div>
            )}
            {effectiveBasic && (
                <div className="filter-upgrade-prompt premium-prompt">
                    <span>✨</span>
                    <p>Go Premium for ultimate filters</p>
                    <button onClick={() => navigate('/membership')}>Upgrade</button>
                </div>
            )}
        </>
    );

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="profiles-page">
            <div className="profiles-container">
                {/* Desktop sidebar */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h2><Filter size={20} /> Filters</h2>
                        {activeFilterCount > 0 && (
                            <button className="btn-clear" onClick={clearFilters}>Clear all</button>
                        )}
                    </div>
                    {filterFields}
                </aside>

                {/* Mobile FAB */}
                <button className="filters-fab" onClick={() => setMobileFiltersOpen(true)} aria-label="Open filters">
                    <Filter size={18} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && <span className="fab-badge">{activeFilterCount}</span>}
                </button>

                {/* Mobile drawer backdrop */}
                {mobileFiltersOpen && (
                    <div className="mobile-drawer-backdrop" onClick={() => setMobileFiltersOpen(false)} />
                )}

                {/* Mobile drawer */}
                <div className={`mobile-filter-drawer ${mobileFiltersOpen ? 'open' : ''}`}>
                    <div className="drawer-handle" />
                    <div className="drawer-header">
                        <h3><Filter size={18} /> Filters</h3>
                        <button className="drawer-close" onClick={() => setMobileFiltersOpen(false)}>✕</button>
                    </div>
                    <div className="drawer-body">{filterFields}</div>
                    <div className="drawer-footer">
                        <button className="drawer-clear-btn" onClick={() => { clearFilters(); }}>Clear All</button>
                        <button className="drawer-apply-btn" onClick={() => setMobileFiltersOpen(false)}>Show {filteredProfiles.length} Results</button>
                    </div>
                </div>

                {/* Right Profile Grid */}
                <main className="profiles-content">
                    <div className="profiles-header">
                        <h1>Profiles</h1>
                        <span className="profiles-count">{filteredProfiles.length} Profiles Found</span>
                    </div>

                    {/* ── DEV ONLY: tier switcher — remove before production ── */}
                    {isGodMode && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', padding: '0.5rem 0.75rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107', fontSize: '0.8rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: '#856404' }}>🧪 Dev tier:</span>
                            {['free', 'basic', 'premium'].map(t => (
                                <button key={t} onClick={() => handleSetDevOverride(t)}
                                    style={{ padding: '2px 10px', borderRadius: '20px', border: '1px solid #856404', background: effectiveTier === t ? '#856404' : 'transparent', color: effectiveTier === t ? '#fff' : '#856404', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
                                    {t}{!devOverride && t === planTier ? ' (actual)' : devOverride === t ? ' ✓' : ''}
                                </button>
                            ))}
                            {devOverride && <span style={{ color: '#856404' }}>overriding actual: <b>{planTier}</b></span>}
                        </div>
                    )}

                    {filteredProfiles.length > 0 ? (
                        <div className="match-grid">
                            {allDisplayed.map((profile, idx) => {
                                const isLocked = effectiveBasic && idx >= BASIC_QUOTA;
                                const showBlur = effectiveFree || isLocked;
                                const displayName = showBlur ? profile.profileId : `${profile.firstName} ${profile.lastName}`.trim();

                                return (
                                    <div
                                        key={profile.id}
                                        className="match-card"
                                        onClick={() => navigate(`/profile/${profile.id}`)}
                                        style={{ cursor: 'pointer', position: 'relative' }}
                                    >
                                        {/* Photo */}
                                        <div className="match-cover" style={{ position: 'relative', overflow: 'hidden' }}>
                                            <img
                                                src={profile.photo}
                                                alt="profile"
                                            />
                                            <div className="match-percent">{profile.matchPercent}% Match</div>
                                            {profile.isVerified && (
                                                <div className="match-verified" title="Verified Profile">
                                                    <CheckCircle size={16} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="match-info">
                                            <div className="match-name-row">
                                                <h3 className="match-name" style={showBlur ? { userSelect: 'none' } : {}}>
                                                    {displayName}
                                                    <span style={{ fontWeight: 'normal', color: '#6b7280', marginLeft: '6px' }}>({profile.age})</span>
                                                </h3>
                                                {!showBlur && <span className="match-id">{profile.profileId}</span>}
                                            </div>

                                            <div className="match-subtitle">
                                                {profile.height} · {profile.community}, {profile.religion}, {profile.caste}
                                            </div>

                                            <div className="match-details-grid">
                                                <div className="match-detail-item">
                                                    <Briefcase size={14} className="match-detail-icon" />
                                                    <span>{profile.profession}</span>
                                                </div>
                                                <div className="match-detail-item">
                                                    <GraduationCap size={14} className="match-detail-icon" />
                                                    <span>{profile.qualification}</span>
                                                </div>
                                                <div className="match-detail-item" style={{ gridColumn: '1 / -1' }}>
                                                    <MapPin size={14} className="match-detail-icon" />
                                                    <span>{profile.location}</span>
                                                </div>
                                            </div>

                                            <div className="match-tags">
                                                {profile.bioTags.map(tag => (
                                                    <span key={tag} className="match-tag">{tag}</span>
                                                ))}
                                            </div>

                                            {/* CTA */}
                                            <div className="match-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    className={`btn-match-action btn-connect ${connectedProfiles[profile.id] ? 'connected' : connectingId === profile.id ? 'connecting' : 'primary'}`}
                                                    style={{ flex: 1 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (showBlur) {
                                                            navigate('/membership');
                                                        } else {
                                                            handleConnectClick(profile.id);
                                                        }
                                                    }}
                                                    disabled={connectedProfiles[profile.id] || connectingId === profile.id}
                                                >
                                                    {connectedProfiles[profile.id] ? (
                                                        <><CheckCircle size={18} /> Sent</>
                                                    ) : connectingId === profile.id ? (
                                                        <><Heart size={18} className="heart-pop" fill="currentColor" />...</>
                                                    ) : (
                                                        <><Heart size={18} /> Connect</>
                                                    )}
                                                </button>

                                                {!showBlur && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShortlistClick(profile.id);
                                                        }}
                                                        disabled={shortlistingId === profile.id}
                                                        style={{
                                                            width: '46px', height: '44px', flexShrink: 0,
                                                            borderRadius: '50px', border: '1px solid #e2e8f0',
                                                            background: shortlistedProfiles[profile.id] ? '#fffbeb' : 'white',
                                                            color: shortlistedProfiles[profile.id] ? '#f59e0b' : '#64748b',
                                                            borderColor: shortlistedProfiles[profile.id] ? '#f59e0b' : '#e2e8f0',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                            opacity: shortlistingId === profile.id ? 0.6 : 1
                                                        }}
                                                        title="Shortlist"
                                                    >
                                                        <Star size={20} fill={shortlistedProfiles[profile.id] ? 'currentColor' : 'none'} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-results">
                            <AlertCircle size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                            <h2>No matches found</h2>
                            <p>Try adjusting your filters to broaden your search criteria.</p>
                            <button
                                onClick={clearFilters}
                                style={{
                                    marginTop: '1rem', padding: '0.75rem 1.5rem',
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '8px',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profiles;
