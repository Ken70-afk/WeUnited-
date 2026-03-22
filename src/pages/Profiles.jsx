import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profiles.css';
import avatarPlaceholder1 from '../assets/hero_bg.png'; // Just using some existing assets as placeholders
import avatarPlaceholder2 from '../assets/profile_avatar.png';
import {
    Filter,
    MapPin,
    Briefcase,
    GraduationCap,
    Heart,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// Dynamic Profiles List fetched via Firestore

const Profiles = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profilesList, setProfilesList] = useState([]);
    const [connectedProfiles, setConnectedProfiles] = useState({});
    const [connectingId, setConnectingId] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { db } = await import('../firebase');
                const { collection, getDocs } = await import('firebase/firestore');
                
                const querySnapshot = await getDocs(collection(db, 'profiles'));
                const fetched = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id !== user?.uid) {
                        const p = doc.data();
                        
                        let parsedTags = [];
                        if (p.bioTags) {
                            parsedTags = typeof p.bioTags === 'string' 
                            ? p.bioTags.split(',').map(s=>s.trim()).filter(Boolean)
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
                            matchPercent: Math.floor(Math.random() * 20) + 80
                        });
                    }
                });
                setProfilesList(fetched);
            } catch (err) {
                console.error("Error fetching profiles", err);
            }
        };

        if (user) {
            fetchProfiles();
        }
    }, [user]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileFiltersOpen]);

    const [filters, setFilters] = useState({
        minAge: '',
        maxAge: '',
        religion: '',
        community: '',
        caste: '',
        location: ''
    });

    const handleConnectClick = (profileId) => {
        if (connectedProfiles[profileId] || connectingId === profileId) return;

        setConnectingId(profileId);

        // Simulate network request delay for the animation
        setTimeout(() => {
            setConnectedProfiles(prev => ({ ...prev, [profileId]: true }));
            setConnectingId(null);
        }, 800);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minAge: '',
            maxAge: '',
            religion: '',
            community: '',
            caste: '',
            location: ''
        });
    };

    const filteredProfiles = useMemo(() => {
        return profilesList.filter(profile => {
            if (filters.minAge && profile.age < parseInt(filters.minAge)) return false;
            if (filters.maxAge && profile.age > parseInt(filters.maxAge)) return false;

            if (filters.religion && !profile.religion.toLowerCase().includes(filters.religion.toLowerCase())) return false;

            if (filters.community && !profile.community.toLowerCase().includes(filters.community.toLowerCase())) return false;

            if (filters.caste && !profile.caste.toLowerCase().includes(filters.caste.toLowerCase())) return false;

            if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

            return true;
        });
    }, [filters, profilesList]);

    /* Shared filter fields JSX — used in both sidebar and drawer */
    const filterFields = (
        <>
            <div className="filter-group">
                <label className="filter-label">Age Range</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange}
                        className="filter-input" placeholder="Min Age" min="18" />
                    <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange}
                        className="filter-input" placeholder="Max Age" />
                </div>
            </div>
            <div className="filter-group">
                <label className="filter-label">Religion</label>
                <input type="text" name="religion" value={filters.religion} onChange={handleFilterChange}
                    className="filter-input" placeholder="Hindu, Muslim, Christian..." />
            </div>
            <div className="filter-group">
                <label className="filter-label">Community</label>
                <input type="text" name="community" value={filters.community} onChange={handleFilterChange}
                    className="filter-input" placeholder="Malayali, Tamil, Punjabi..." />
            </div>
            <div className="filter-group">
                <label className="filter-label">Caste</label>
                <input type="text" name="caste" value={filters.caste} onChange={handleFilterChange}
                    className="filter-input" placeholder="Nair, Brahmin, Sunni..." />
            </div>
            <div className="filter-group">
                <label className="filter-label">Location</label>
                <input type="text" name="location" value={filters.location} onChange={handleFilterChange}
                    className="filter-input" placeholder="City or Country..." />
            </div>
        </>
    );

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    return (
        <div className="profiles-page">
            <div className="profiles-container">
                {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
                <aside className="filters-sidebar">
                    <div className="filters-header">
                        <h2><Filter size={20} /> Filters</h2>
                        {activeFilterCount > 0 && (
                            <button className="btn-clear" onClick={clearFilters}>Clear all</button>
                        )}
                    </div>
                    {filterFields}
                </aside>

                {/* ── Mobile: floating FAB ── */}
                <button
                    className="filters-fab"
                    onClick={() => setMobileFiltersOpen(true)}
                    aria-label="Open filters"
                >
                    <Filter size={18} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="fab-badge">{activeFilterCount}</span>
                    )}
                </button>

                {/* ── Mobile: slide-up drawer backdrop ── */}
                {mobileFiltersOpen && (
                    <div
                        className="mobile-drawer-backdrop"
                        onClick={() => setMobileFiltersOpen(false)}
                    />
                )}

                {/* ── Mobile: slide-up drawer ── */}
                <div className={`mobile-filter-drawer ${mobileFiltersOpen ? 'open' : ''}`}>
                    <div className="drawer-handle" />
                    <div className="drawer-header">
                        <h3><Filter size={18} /> Filters</h3>
                        <button className="drawer-close" onClick={() => setMobileFiltersOpen(false)}>✕</button>
                    </div>
                    <div className="drawer-body">
                        {filterFields}
                    </div>
                    <div className="drawer-footer">
                        <button className="drawer-clear-btn" onClick={() => { clearFilters(); }}>Clear All</button>
                        <button className="drawer-apply-btn" onClick={() => setMobileFiltersOpen(false)}>Show {filteredProfiles.length} Results</button>
                    </div>
                </div>

                {/* Right Profile Grid */}
                < main className="profiles-content" >
                    <div className="profiles-header">
                        <h1>Profiles</h1>
                        <span className="profiles-count">{filteredProfiles.length} Profiles Found</span>
                    </div>

                    {
                        filteredProfiles.length > 0 ? (
                            <div className="match-grid">
                                {filteredProfiles.map((profile) => (
                                    <div key={profile.id} className="match-card" onClick={() => navigate(`/profile/${profile.id}`)}>
                                        <div className="match-cover">
                                            <img src={profile.photo} alt={profile.firstName} />
                                            <div className="match-percent">{profile.matchPercent}% Match</div>
                                            {profile.isVerified && (
                                                <div className="match-verified" title="Verified Profile">
                                                    <CheckCircle size={16} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="match-info">
                                            <div className="match-name-row">
                                                <h3 className="match-name">{profile.firstName} {profile.lastName} <span style={{ fontWeight: 'normal', color: '#6b7280' }}>({profile.age})</span></h3>
                                                <span className="match-id">{profile.id}</span>
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
                                        </div>

                                        <div className="match-actions">
                                            <button
                                                className={`btn-match-action btn-connect ${connectedProfiles[profile.id] ? 'connected' : connectingId === profile.id ? 'connecting' : 'primary'}`}
                                                style={{ width: '100%' }}
                                                onClick={(e) => { e.stopPropagation(); handleConnectClick(profile.id); }}
                                                disabled={connectedProfiles[profile.id]}
                                            >
                                                {connectedProfiles[profile.id] ? (
                                                    <>
                                                        <CheckCircle size={18} /> Request Sent
                                                    </>
                                                ) : connectingId === profile.id ? (
                                                    <>
                                                        <Heart size={18} className="heart-pop" fill="currentColor" /> Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Heart size={18} /> Connect
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <AlertCircle size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
                                <h2>No matches found</h2>
                                <p>Try adjusting your filters to broaden your search criteria.</p>
                                <button
                                    onClick={clearFilters}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )
                    }
                </main >
            </div >
        </div >
    );
};

export default Profiles;
