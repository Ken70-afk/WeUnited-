import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, MapPin, Briefcase, BookOpen, Heart, X, CheckCircle, Search } from 'lucide-react';
import './Dashboard.css';

// Mock Data for the feed
const MOCK_MATCHES = [
    {
        id: 1,
        name: 'Priya Sharma',
        age: 27,
        location: 'New York, USA',
        profession: 'Data Scientist at Tech Corp',
        education: 'MS in Computer Science',
        religion: 'Hindu',
        motherTongue: 'Hindi',
        matchScore: 92,
        verified: true,
        photoUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['Vegetarian', 'Never Married', 'Loves Travel']
    },
    {
        id: 2,
        name: 'Aisha Patel',
        age: 26,
        location: 'London, UK',
        profession: 'Investment Banker',
        education: 'MBA Strategy',
        religion: 'Hindu',
        motherTongue: 'Gujarati',
        matchScore: 88,
        verified: true,
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['Fitness Enthusiast', 'Family Oriented', 'Read Books']
    },
    {
        id: 3,
        name: 'Mehvish Khan',
        age: 29,
        location: 'Dubai, UAE',
        profession: 'Architect',
        education: 'B.Arch',
        religion: 'Muslim',
        motherTongue: 'Urdu',
        matchScore: 85,
        verified: false,
        photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['Art Lover', 'Halal', 'Creative']
    },
    {
        id: 4,
        name: 'Sara Singh',
        age: 25,
        location: 'Toronto, Canada',
        profession: 'UI/UX Designer',
        education: 'BFA Design',
        religion: 'Sikh',
        motherTongue: 'Punjabi',
        matchScore: 81,
        verified: true,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        tags: ['Dog Lover', 'Foodie', 'Outgoing']
    }
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [matches, setMatches] = useState(MOCK_MATCHES);
    const [filterReligion, setFilterReligion] = useState('All');

    useEffect(() => {
        const savedData = localStorage.getItem('onboardingData');
        if (savedData) {
            setUserData(JSON.parse(savedData));
        } else {
            // Uncomment next line if you want to strictly require onboarding
            // navigate('/');
        }
    }, [navigate]);

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setFilterReligion(value);
        if (value === 'All') {
            setMatches(MOCK_MATCHES);
        } else {
            setMatches(MOCK_MATCHES.filter(m => m.religion === value));
        }
    };

    const handleAction = (id, action) => {
        // In a real app, this would hit an API. For now, just remove from UI
        setMatches(matches.filter(m => m.id !== id));
        if (action === 'like') {
            // Optional: Show a subtle toast notification
            console.log(`Liked profile ${id}`);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">

                {/* Left Sidebar - Filters */}
                <aside className="filter-sidebar animate-fade-in-up">
                    <h3><Filter size={20} /> Match Filters</h3>

                    <div className="filter-group">
                        <label className="filter-label">Religion</label>
                        <select className="filter-select" value={filterReligion} onChange={handleFilterChange}>
                            <option value="All">All Religions</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Muslim">Muslim</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Christian">Christian</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Age Range</label>
                        <div className="filter-range">
                            <input type="number" placeholder="Min" defaultValue="23" min="18" max="60" />
                            <span>-</span>
                            <input type="number" placeholder="Max" defaultValue="35" min="18" max="60" />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Location</label>
                        <select className="filter-select">
                            <option value="any">Anywhere</option>
                            <option value="usa">USA</option>
                            <option value="uk">UK</option>
                            <option value="canada">Canada</option>
                            <option value="india">India</option>
                        </select>
                    </div>

                    <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} /> Apply Filters
                    </button>
                </aside>

                {/* Main Feed Activity */}
                <main className="dashboard-feed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="feed-header">
                        <h2>Your Daily Matches</h2>
                        <span className="feed-stats">{matches.length} profiles found</span>
                    </div>

                    {matches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px' }}>
                            <Search size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: '#4b5563', margin: '0 0 0.5rem 0' }}>No matches found</h3>
                            <p style={{ color: '#6b7280', margin: 0 }}>Try adjusting your filters to see more profiles.</p>
                        </div>
                    ) : (
                        <div className="matches-grid">
                            {matches.map(match => (
                                <div key={match.id} className="match-card">
                                    <div className="match-photo">
                                        <img src={match.photoUrl} alt={match.name} loading="lazy" />
                                        <div className="match-overlay">
                                            <div>
                                                <h3 className="match-name-age">
                                                    {match.name}, {match.age}
                                                    {match.verified && <CheckCircle size={18} className="verified-badge" fill="currentColor" color="white" />}
                                                </h3>
                                            </div>
                                            <div className="match-match-score">
                                                {match.matchScore}% Match
                                            </div>
                                        </div>
                                    </div>
                                    <div className="match-details">
                                        <div className="match-info-row">
                                            <MapPin size={16} />
                                            <span>{match.location}</span>
                                        </div>
                                        <div className="match-info-row">
                                            <Briefcase size={16} />
                                            <span>{match.profession}</span>
                                        </div>
                                        <div className="match-info-row">
                                            <BookOpen size={16} />
                                            <span>{match.education}</span>
                                        </div>
                                        <div className="match-tags">
                                            {match.tags.map(tag => (
                                                <span key={tag} className="match-tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="match-actions">
                                        <button className="action-btn btn-skip" onClick={() => handleAction(match.id, 'skip')}>
                                            <X size={18} /> Skip
                                        </button>
                                        <button className="action-btn btn-like" onClick={() => handleAction(match.id, 'like')}>
                                            <Heart size={18} /> Connect
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
};

export default Dashboard;
