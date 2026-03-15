import React, { useState, useMemo, useEffect } from 'react';
import './Profiles.css';
import avatarPlaceholder1 from '../assets/hero_bg.png'; // Just using some existing assets as placeholders
import avatarPlaceholder2 from '../assets/profile_avatar.png';
import {
    Filter,
    MapPin,
    Briefcase,
    GraduationCap,
    Heart,
    MessageCircle,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const MOCK_PROFILES = [
    {
        id: 'WU8471', firstName: 'Priya', lastName: 'Sharma', age: 26, height: '5 ft 4 in',
        location: 'New York, USA', community: 'Hindi', religion: 'Hindu', caste: 'Brahmin',
        profession: 'Software Engineer', income: '$100k - $200k', qualification: 'MS in Computer Science',
        bioTags: ['Travel', 'Cooking', 'Fitness'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 88
    },
    {
        id: 'WU9123', firstName: 'Aisha', lastName: 'Khan', age: 28, height: '5 ft 6 in',
        location: 'London, UK', community: 'Urdu', religion: 'Muslim', caste: 'Sunni',
        profession: 'Doctor', income: '$100k - $200k', qualification: 'MBBS, MD',
        bioTags: ['Reading', 'Art', 'Volunteering'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 92
    },
    {
        id: 'WU7564', firstName: 'Neha', lastName: 'Patel', age: 25, height: '5 ft 2 in',
        location: 'Chicago, USA', community: 'Gujarati', religion: 'Hindu', caste: 'Patidar',
        profession: 'Marketing Manager', income: '$50k - $100k', qualification: 'MBA',
        bioTags: ['Photography', 'Music', 'Hiking'], photo: avatarPlaceholder2, isVerified: false, matchPercent: 75
    },
    {
        id: 'WU3341', firstName: 'Riya', lastName: 'Menon', age: 27, height: '5 ft 5 in',
        location: 'Dubai, UAE', community: 'Malayali', religion: 'Hindu', caste: 'Nair',
        profession: 'Architect', income: '$100k - $200k', qualification: 'B.Arch',
        bioTags: ['Design', 'Yoga', 'Coffee'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 85
    },
    {
        id: 'WU5622', firstName: 'Sarah', lastName: 'Thomas', age: 29, height: '5 ft 7 in',
        location: 'Toronto, Canada', community: 'Malayali', religion: 'Christian', caste: 'Orthodox',
        profession: 'Data Analyst', income: '$100k - $200k', qualification: 'MSc Data Science',
        bioTags: ['Tech', 'Board Games', 'Pets'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 81
    },
    {
        id: 'WU2290', firstName: 'Sneha', lastName: 'Reddy', age: 24, height: '5 ft 3 in',
        location: 'Houston, USA', community: 'Telugu', religion: 'Hindu', caste: 'Reddy',
        profession: 'Business Analyst', income: '$50k - $100k', qualification: 'BBA',
        bioTags: ['Dancing', 'Movies', 'Foodie'], photo: avatarPlaceholder1, isVerified: false, matchPercent: 79
    },
    {
        id: 'WU1122', firstName: 'Kiran', lastName: 'Rao', age: 31, height: '5 ft 10 in',
        location: 'San Francisco, USA', community: 'Kannada', religion: 'Hindu', caste: 'Brahmin',
        profession: 'Product Manager', income: '$150k+', qualification: 'MBA',
        bioTags: ['Startups', 'Cycling', 'Books'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 95
    },
    {
        id: 'WU4455', firstName: 'Fatima', lastName: 'Ali', age: 26, height: '5 ft 4 in',
        location: 'Sydney, Australia', community: 'Punjabi', religion: 'Muslim', caste: 'Shia',
        profession: 'Graphic Designer', income: '$50k - $100k', qualification: 'BFA',
        bioTags: ['Art', 'Museums', 'Travel'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 82
    },
    {
        id: 'WU7788', firstName: 'Anita', lastName: 'Desai', age: 29, height: '5 ft 1 in',
        location: 'Mumbai, India', community: 'Marathi', religion: 'Hindu', caste: 'Maratha',
        profession: 'Chartered Accountant', income: '$50k - $100k', qualification: 'CA',
        bioTags: ['Finance', 'Yoga', 'Baking'], photo: avatarPlaceholder2, isVerified: false, matchPercent: 77
    },
    {
        id: 'WU9900', firstName: 'Simran', lastName: 'Kaur', age: 27, height: '5 ft 6 in',
        location: 'Vancouver, Canada', community: 'Punjabi', religion: 'Sikh', caste: 'Jat',
        profession: 'Pharmacist', income: '$100k - $200k', qualification: 'Pharm.D',
        bioTags: ['Outdoors', 'Dogs', 'Running'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 89
    },
    {
        id: 'WU6633', firstName: 'Pooja', lastName: 'Iyer', age: 25, height: '5 ft 5 in',
        location: 'Bengaluru, India', community: 'Tamil', religion: 'Hindu', caste: 'Brahmin',
        profession: 'HR Executive', income: 'Below $50k', qualification: 'MBA HR',
        bioTags: ['Singing', 'Painting', 'Travel'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 84
    },
    {
        id: 'WU8844', firstName: 'Maria', lastName: 'Joseph', age: 30, height: '5 ft 3 in',
        location: 'Kochi, India', community: 'Malayali', religion: 'Christian', caste: 'Catholic',
        profession: 'Teacher', income: 'Below $50k', qualification: 'B.Ed',
        bioTags: ['Kids', 'Gardening', 'Reading'], photo: avatarPlaceholder1, isVerified: false, matchPercent: 71
    },
    {
        id: 'WU2211', firstName: 'Divya', lastName: 'Nair', age: 28, height: '5 ft 7 in',
        location: 'Seattle, USA', community: 'Malayali', religion: 'Hindu', caste: 'Nair',
        profession: 'Software Engineer', income: '$150k+', qualification: 'MS in CS',
        bioTags: ['Gaming', 'Trekking', 'Tech'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 91
    },
    {
        id: 'WU5566', firstName: 'Zoya', lastName: 'Ahmed', age: 24, height: '5 ft 4 in',
        location: 'Birmingham, UK', community: 'Bengali', religion: 'Muslim', caste: 'Sunni',
        profession: 'Journalist', income: '$50k - $100k', qualification: 'MA Journalism',
        bioTags: ['Writing', 'Politics', 'Coffee'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 86
    },
    {
        id: 'WU1234', firstName: 'Ananya', lastName: 'Singh', age: 29, height: '5 ft 5 in',
        location: 'Delhi, India', community: 'Hindi', religion: 'Hindu', caste: 'Rajput',
        profession: 'Interior Designer', income: '$50k - $100k', qualification: 'B.Des',
        bioTags: ['Decor', 'Fashion', 'Art'], photo: avatarPlaceholder2, isVerified: false, matchPercent: 78
    },
    {
        id: 'WU8765', firstName: 'Meera', lastName: 'Krishnan', age: 26, height: '5 ft 2 in',
        location: 'Chennai, India', community: 'Tamil', religion: 'Hindu', caste: 'Chettiar',
        profession: 'Financial Analyst', income: '$50k - $100k', qualification: 'MBA Finance',
        bioTags: ['Numbers', 'Classical Music', 'Books'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 83
    },
    {
        id: 'WU3456', firstName: 'Jasmine', lastName: 'Kaur', age: 28, height: '5 ft 6 in',
        location: 'Calgary, Canada', community: 'Punjabi', religion: 'Sikh', caste: 'Khatri',
        profession: 'Dentist', income: '$100k - $200k', qualification: 'DDS',
        bioTags: ['Health', 'Fitness', 'Travel'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 88
    },
    {
        id: 'WU7890', firstName: 'Swati', lastName: 'Bose', age: 27, height: '5 ft 4 in',
        location: 'Kolkata, India', community: 'Bengali', religion: 'Hindu', caste: 'Brahmin',
        profession: 'Professor', income: '$50k - $100k', qualification: 'PhD Literature',
        bioTags: ['Poetry', 'Theatre', 'Foodie'], photo: avatarPlaceholder1, isVerified: false, matchPercent: 76
    },
    {
        id: 'WU2345', firstName: 'Aarthi', lastName: 'Pillai', age: 25, height: '5 ft 3 in',
        location: 'Trivandrum, India', community: 'Malayali', religion: 'Hindu', caste: 'Pillai',
        profession: 'Clinical Psychologist', income: '$50k - $100k', qualification: 'M.Phil',
        bioTags: ['Mental Health', 'Yoga', 'Reading'], photo: avatarPlaceholder2, isVerified: true, matchPercent: 80
    },
    {
        id: 'WU6789', firstName: 'Sana', lastName: 'Sheikh', age: 29, height: '5 ft 5 in',
        location: 'Auckland, NZ', community: 'Gujarati', religion: 'Muslim', caste: 'Sunni',
        profession: 'Entrepreneur', income: '$150k+', qualification: 'BSc Business',
        bioTags: ['Startups', 'Networking', 'Travel'], photo: avatarPlaceholder1, isVerified: true, matchPercent: 94
    }
];

const Profiles = () => {
    const [connectedProfiles, setConnectedProfiles] = useState({});
    const [connectingId, setConnectingId] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        return MOCK_PROFILES.filter(profile => {
            if (filters.minAge && profile.age < parseInt(filters.minAge)) return false;
            if (filters.maxAge && profile.age > parseInt(filters.maxAge)) return false;

            if (filters.religion && !profile.religion.toLowerCase().includes(filters.religion.toLowerCase())) return false;

            if (filters.community && !profile.community.toLowerCase().includes(filters.community.toLowerCase())) return false;

            if (filters.caste && !profile.caste.toLowerCase().includes(filters.caste.toLowerCase())) return false;

            if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) return false;

            return true;
        });
    }, [filters]);

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
                        <h1>Your Matches</h1>
                        <span className="profiles-count">{filteredProfiles.length} Profiles Found</span>
                    </div>

                    {
                        filteredProfiles.length > 0 ? (
                            <div className="match-grid">
                                {filteredProfiles.map((profile) => (
                                    <div key={profile.id} className="match-card">
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
                                                onClick={() => handleConnectClick(profile.id)}
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
