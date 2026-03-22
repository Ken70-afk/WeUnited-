import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Heart, 
    Bell, 
    Settings, 
    CreditCard, 
    Users, 
    ShieldCheck, 
    ChevronRight,
    Share2,
    Calendar,
    Eye,
    Contact2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        if (user.aboutMe) score += 10;
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

    const [mockMatches, setMockMatches] = useState([]);
    const [mutualMatches, setMutualMatches] = useState([]);
    const [newProfiles, setNewProfiles] = useState([]);
    const [interestsSent, setInterestsSent] = useState(0);
    const [interestsAccepted, setInterestsAccepted] = useState(0);
    const [pendingInbound, setPendingInbound] = useState(0); // badge count
    const [recentActivity, setRecentActivity] = useState([]);

    const calculateAgeFromDob = (dobString) => {
        if (!dobString) return '';
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const { db } = await import('../firebase');
                const { collection, getDocs } = await import('firebase/firestore');
                // Fetch profiles
                const querySnapshot = await getDocs(collection(db, 'profiles'));
                const profilesList = [];
                querySnapshot.forEach((doc) => {
                    // Make sure not to include the current user
                    if (doc.id !== user?.uid) {
                        profilesList.push({ id: doc.id, ...doc.data() });
                    }
                });

                // Format them so the Dashboard cards render correctly
                const formattedList = profilesList.map(p => ({
                    id: p.uid || p.id,
                    name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'User',
                    age: calculateAgeFromDob(p.dob) || '25',
                    height: `${p.height || '--'}${p.heightUnit || 'cm'}`,
                    religion: p.religion || p.community || 'Unknown',
                    status: 'Unmarried',
                    photo: (p.photos && p.photos.length > 0) ? p.photos[0] : (p.avatarPhoto || p.coverPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop')
                }));

                // In lieu of a full recommendation algorithm, split them randomly or sequentially for UI mapping
                setMockMatches(formattedList.slice(0, 4));
                setMutualMatches(formattedList.slice(4, 7));
                setNewProfiles(formattedList.slice(7, 9));

            } catch (err) {
                console.error("Error fetching matches", err);
            }
        };

        if (user) {
            fetchProfiles();
        }
    }, [user]);

    // Fetch real interest counts
    useEffect(() => {
        if (!user?.uid) return;
        const fetchInterestStats = async () => {
            try {
                // Sent by me
                const sentQ = query(collection(db, 'interests'), where('fromUid', '==', user.uid));
                const sentSnap = await getDocs(sentQ);
                const sentDocs = sentSnap.docs.map(d => d.data());
                setInterestsSent(sentDocs.length);
                setInterestsAccepted(sentDocs.filter(d => d.status === 'accepted').length);

                // Inbound pending (badge)
                const inboundQ = query(
                    collection(db, 'interests'),
                    where('toUid', '==', user.uid),
                    where('status', '==', 'pending')
                );
                const inboundSnap = await getDocs(inboundQ);
                setPendingInbound(inboundSnap.size);

                // Recent activity feed — last 3 interest events
                const allMyQ = query(collection(db, 'interests'), where('fromUid', '==', user.uid));
                const allMySnap = await getDocs(allMyQ);
                const allInboundQ = query(collection(db, 'interests'), where('toUid', '==', user.uid));
                const allInboundSnap = await getDocs(allInboundQ);

                const feedItems = [
                    ...allMySnap.docs.map(d => ({ ...d.data(), dir: 'out' })),
                    ...allInboundSnap.docs.map(d => ({ ...d.data(), dir: 'in' })),
                ]
                .sort((a, b) => {
                    const ta = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
                    const tb = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
                    return tb - ta;
                })
                .slice(0, 3)
                .map(item => {
                    const ts = item.updatedAt || item.createdAt;
                    const date = ts?.toDate ? ts.toDate() : new Date();
                    const diff = Math.floor((Date.now() - date) / 1000);
                    const ago = diff < 60 ? 'Just now' : diff < 3600 ? `${Math.floor(diff/60)}m ago` : diff < 86400 ? `${Math.floor(diff/3600)}h ago` : `${Math.floor(diff/86400)}d ago`;

                    if (item.dir === 'out' && item.status === 'accepted') {
                        return { text: <>Interest accepted by <strong>{item.toName || 'a user'}</strong></>, time: ago };
                    } else if (item.dir === 'out') {
                        return { text: <>You sent interest to <strong>{item.toName || 'a user'}</strong></>, time: ago };
                    } else {
                        return { text: <><strong>{item.fromName || 'Someone'}</strong> sent you an interest</>, time: ago };
                    }
                });

                setRecentActivity(feedItems);
            } catch (err) {
                console.error('Error fetching interest stats:', err);
            }
        };
        fetchInterestStats();
    }, [user]);

    const renderCarousel = (title, data) => (
        <div className="dash-carousel-section">
            <div className="dash-carousel-header">
                <h3>{title}</h3>
                <button className="dash-see-all" onClick={() => navigate(title.toLowerCase().includes('match') ? '/matches' : '/profiles')}>See All</button>
            </div>
            <div className="dash-carousel">
                {/* ... */}
                {data.map((match, idx) => (
                    <div key={idx} className="dash-match-card" onClick={() => navigate(`/profile/${match.id}`)}>
                        <div className="dash-match-photo">
                            <img src={match.photo} alt={match.name} loading="lazy" />
                            <div className="dash-card-overlay">
                                <span>View Profile</span>
                            </div>
                        </div>
                        <div className="dash-match-info">
                            <div className="dash-match-name-row">
                                <h4>{match.name}</h4>
                                <div className="online-status">
                                    <span className="online-dot"></span>
                                    <span>Online</span>
                                </div>
                            </div>
                            <div className="dash-match-stats">
                                <span className="stat-tag">{match.age} yrs</span>
                                <span className="stat-tag">{match.height}</span>
                            </div>
                            <div className="dash-match-meta">
                                <div className="meta-item">
                                    <Users size={12} />
                                    <span>{match.religion}</span>
                                </div>
                                <div className="meta-item">
                                    <ShieldCheck size={12} />
                                    <span>{match.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-container container">
                
                {/* Fixed Sidebar */}
                <aside className="dash-sidebar">
                    <nav className="dash-nav">
                        <button className="dash-nav-item active" onClick={() => navigate('/dashboard')}>
                            <Users size={20} />
                            <span>My Dashboard</span>
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/profiles')}>
                            <User size={20} />
                            <span>Profiles</span>
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/matches')}>
                            <Heart size={20} />
                            <span>Matches</span>
                            <span className="nav-badge">7</span>
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {pendingInbound > 0 && (
                                <span className="nav-badge">{pendingInbound}</span>
                            )}
                        </button>
                    </nav>

                    <div className="dash-sidebar-upsell">
                        <button className="upsell-handle">
                            <span>👑</span>
                            <span className="upsell-handle-label">Assisted Matchmaking</span>
                        </button>
                        <div className="upsell-reveal">
                            <h4>Want Assisted Matchmaking?</h4>
                            <p>Get a dedicated Relationship Manager to handpick the best matches for you.</p>
                            <button onClick={() => navigate('/membership')}>Learn More About Assisted Services</button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dash-main">
                    {/* Top Profile Card - REDESIGNED */}
                    <div className="dash-top-card-new">
                        <div className="dash-cover-photo">
                            {user.coverPhoto ? <img src={user.coverPhoto} alt="Cover" /> : <div className="cover-placeholder"></div>}
                        </div>
                        <div className="dash-profile-brief">
                            <div className="dash-avatar-large">
                                {user.avatarPhoto || (user.photos && user.photos.length > 0) ? (
                                    <img src={user.avatarPhoto || user.photos[0]} alt="Avatar" />
                                ) : (
                                    <div className="avatar-placeholder">{fullName.charAt(0)}</div>
                                )}
                                {user.isIdVerified && <div className="verified-badge"><ShieldCheck size={14} /></div>}
                            </div>
                            <div className="dash-user-headline">
                                <div className="name-row">
                                    <h2>{fullName.toUpperCase()}</h2>
                                    <span className="membership-tag">Diamond</span>
                                </div>
                                <p className="dash-pid">{profileId} • {user.email}</p>
                            </div>
                            <div className="dash-header-actions">
                                <button className="dash-action-btn glass" onClick={() => navigate('/profile')}>Edit Profile</button>
                                <button className="dash-share-btn-new">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="dash-two-col">
                        <div className="dash-left-col">
                            {/* Stats Row */}
                            <div className="dash-stats-grid">
                                <div className="dash-stat-tile" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
                                    <div className="stat-icon" style={{ backgroundColor: '#fff0ec' }}><Users size={20} color="#f97316" /></div>
                                    <div className="stat-info">
                                        <h3>{interestsSent}</h3>
                                        <p>Interests Sent</p>
                                    </div>
                                    <ChevronRight size={16} className="stat-arrow" />
                                </div>
                                <div className="dash-stat-tile" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
                                    <div className="stat-icon" style={{ backgroundColor: '#eef2ff' }}><Heart size={20} color="#6366f1" /></div>
                                    <div className="stat-info">
                                        <h3>{interestsAccepted}</h3>
                                        <p>Interests Accepted</p>
                                    </div>
                                    <ChevronRight size={16} className="stat-arrow" />
                                </div>
                                <div className="dash-stat-tile">
                                    <div className="stat-icon" style={{ backgroundColor: '#fef2f2' }}><Eye size={20} color="#ef4444" /></div>
                                    <div className="stat-info">
                                        <h3>—</h3>
                                        <p>Profile Views</p>
                                    </div>
                                    <ChevronRight size={16} className="stat-arrow" />
                                </div>
                                <div className="dash-stat-tile">
                                    <div className="stat-icon" style={{ backgroundColor: '#f0fdf4' }}><Contact2 size={20} color="#22c55e" /></div>
                                    <div className="stat-info">
                                        <h3>{interestsAccepted}</h3>
                                        <p>Contact Unlocked</p>
                                    </div>
                                    <ChevronRight size={16} className="stat-arrow" />
                                </div>
                            </div>

                            {/* Carousels */}
                            {renderCarousel('Daily Recommendations', mockMatches)}
                            
                            {/* Completeness Banner */}
                            <div className="dash-completeness-banner">
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
                                    <h4>Profile Strength: {completionScore < 50 ? 'Weak' : completionScore < 80 ? 'Good' : 'Excellent'}</h4>
                                    <p>Profiles with 90%+ completion get 10x more interests.</p>
                                    <button className="dash-comp-btn" onClick={() => navigate('/profile')}>Complete Now →</button>
                                </div>
                            </div>

                            {/* Mutual Matches */}
                            {renderCarousel('Mutual Matches', mutualMatches)}
                        </div>

                        <div className="dash-right-col">
                            {/* Activity Feed */}
                            <div className="dash-side-card">
                                <div className="side-card-header">
                                    <h3>Activity Feed</h3>
                                    <Bell size={16} />
                                </div>
                                <div className="activity-list">
                                    {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                                        <div key={idx} className="activity-item">
                                            <div className="activity-dot"></div>
                                            <div className="activity-text">
                                                <p>{item.text}</p>
                                                <span>{item.time}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="activity-item">
                                            <div className="activity-dot inactive"></div>
                                            <div className="activity-text">
                                                <p>No recent activity yet</p>
                                                <span>Send some interests to get started!</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button className="side-card-footer" onClick={() => navigate('/notifications')}>View All</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
