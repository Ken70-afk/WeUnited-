import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    // Derived or Default values
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User Name';
    const profileId = user.profileId || `CM${Math.floor(1000000 + Math.random() * 9000000)}`;

    const calculateCompletion = () => {
        let score = 0;
        if (user.firstName) score += 5;
        if (user.lastName) score += 5;
        if (user.dob) score += 10;
        if (user.gender) score += 5;
        if (user.height) score += 5;
        if (user.weight) score += 5;
        if (user.bioTags) score += 10;
        if (user.community) score += 5;
        if (user.religion) score += 5;
        if (user.qualification) score += 5;
        if (user.job) score += 5;
        if (user.location) score += 5;
        if (user.hobbies) score += 5;
        if (user.email || user.phone) score += 5;
        
        const photoCount = user.photos ? user.photos.length : 0;
        if (photoCount === 1) score += 10;
        else if (photoCount === 2) score += 15;
        else if (photoCount >= 3) score += 20;

        return Math.min(score, 100);
    };
    
    const completionScore = calculateCompletion();

    // Mock data for profiles
    const mockMatches = [
        { id: 'CM1224536', name: 'Anu Joseph', age: 26, height: '165cm', religion: 'Syrian Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
        { id: 'CM1221493', name: 'Oshin Tresa Fran...', age: 28, height: '174cm', religion: 'Syrian Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
        { id: 'CM1204899', name: 'Jiya S', age: 25, height: '160cm', religion: 'Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop' },
        { id: 'CM1283744', name: 'Sarah M', age: 27, height: '168cm', religion: 'Orthodox', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop' },
    ];

    const mutualMatches = [
        { id: 'CM1224307', name: 'Elizabeth Maria...', age: 28, height: '169cm', religion: 'Syrian Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop' },
        { id: 'CM1223569', name: 'Alna Sabu', age: 25, height: '165cm', religion: 'Jacobite', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop' },
        { id: 'CM1214002', name: 'Sini S', age: 24, height: '162cm', religion: 'Orthodox', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
    ];

    const newProfiles = [
        { id: 'CM1229988', name: 'Grace T', age: 26, height: '160cm', religion: 'Roman Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
        { id: 'CM1230111', name: 'Maria K', age: 23, height: '158cm', religion: 'Syrian Catholic', status: 'Unmarried', photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop' },
    ];

    const renderCarousel = (title, data) => (
        <div className="dash-carousel-section">
            <div className="dash-carousel-header">
                <h3>{title}</h3>
                <button className="dash-see-all">See All</button>
            </div>
            <div className="dash-carousel">
                {data.map((match, idx) => (
                    <div key={idx} className="dash-match-card">
                        <div className="dash-match-photo">
                            <img src={match.photo} alt={match.name} loading="lazy" />
                        </div>
                        <div className="dash-match-info">
                            <h4>{match.name}</h4>
                            <p className="dash-match-id">{match.id} <span className="online-dot"></span></p>
                            <p className="dash-match-details">
                                {match.age}Yrs, {match.height}, {match.religion}, {match.status}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-container container">
                
                {/* Top Profile Card */}
                <div className="dash-top-card">
                    <div className="dash-card-header">
                        <div className="dash-avatar">
                            {user.photos && user.photos.length > 0 ? (
                                <img src={user.photos[0]} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder">{fullName.charAt(0)}</div>
                            )}
                        </div>
                        <div className="dash-user-info">
                            <h2>{fullName.toUpperCase()}</h2>
                            <p className="dash-pid">{profileId}</p>
                            <p className="dash-membership">Diamond Membership</p>
                        </div>
                        <button className="dash-share-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                    </div>
                    <div className="dash-card-dates">
                        <span>Added Date: 20/08/2025</span>
                        <span>Expiry Date: 20/08/2026</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="dash-stats-row">
                    <div className="dash-stat-box" style={{ backgroundColor: '#fff0ec' }}>
                        <h3>0</h3>
                        <p>Interest<br/>Message</p>
                    </div>
                    <div className="dash-stat-box" style={{ backgroundColor: '#eef6fc' }}>
                        <h3 style={{ color: '#3b82f6' }}>7</h3>
                        <p>Interest<br/>Accepted</p>
                    </div>
                    <div className="dash-stat-box" style={{ backgroundColor: '#fbe9eb' }}>
                        <h3 style={{ color: '#ef4444' }}>646</h3>
                        <p>Profile<br/>Views</p>
                    </div>
                    <div className="dash-stat-box" style={{ backgroundColor: '#eefbf3' }}>
                        <h3 style={{ color: '#10b981' }}>7</h3>
                        <p>Contact<br/>Views</p>
                    </div>
                </div>

                {/* New Matches Carousel */}
                {renderCarousel('New Matches', mockMatches)}

                {/* Profile Completeness Banner */}
                <div className="dash-completeness-banner" style={{ marginTop: '1rem' }}>
                    <div className="dash-comp-circle">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="circle"
                                strokeDasharray={`${completionScore}, 100`}
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">{completionScore}%</text>
                        </svg>
                    </div>
                    <div className="dash-comp-text">
                        <h4>Ensure Profile Completeness</h4>
                        <button className="dash-comp-btn" onClick={() => navigate('/profile')}>Update to Complete Now</button>
                    </div>
                </div>

                {/* Mutual Matches Carousel */}
                {renderCarousel('Mutual Matches', mutualMatches)}

                {/* Newly Joined Profiles */}
                {renderCarousel('Newly Joined Profiles', newProfiles)}

            </div>
        </div>
    );
};

export default Dashboard;
