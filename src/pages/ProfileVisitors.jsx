import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    User, 
    Heart, 
    Bell, 
    Eye, 
    Clock, 
    Lock,
    Loader2,
    ChevronRight,
    Search,
    Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy,
} from 'firebase/firestore';
import './ProfileVisitors.css';

const ProfileVisitors = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Dev tier override (consistent with other pages)
    const isGodMode = user?.role === 'admin';
    const [devOverride, setDevOverride] = useState(() => localStorage.getItem('devTierOverride'));
    const planTier = user?.plan === 'premium' ? 'premium' : user?.plan === 'basic' ? 'basic' : 'free';
    const effectiveTier = (isGodMode && devOverride) ? devOverride : planTier;
    const isFree = effectiveTier === 'free';

    const handleSetOverride = (t) => {
        const newVal = t === devOverride ? null : t;
        setDevOverride(newVal);
        if (newVal) localStorage.setItem('devTierOverride', newVal);
        else localStorage.removeItem('devTierOverride');
    };

    useEffect(() => {
        if (!user?.uid) return;

        const fetchVisitors = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'profile_views'),
                    where('ownerUid', '==', user.uid)
                );
                
                const snap = await getDocs(q);
                const list = snap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));
                
                setVisitors(list.sort((a,b) => b.timestamp - a.timestamp));
            } catch (err) {
                console.error('Error fetching visitors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitors();
    }, [user?.uid]);

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const now = new Date();
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const filteredVisitors = visitors.filter(v => {
        if (isFree) return true; // Can't search by name if they are obfuscated
        return v.viewerName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const renderVisitorItem = (v) => {
        // --- HARD SECURITY: Scrub real data from DOM for free users ---
        const profileId = `WU${v.viewerUid?.substring(0, 6).toUpperCase() || 'ANON'}`;
        const displayName = isFree ? profileId : v.viewerName;
        const displayPhoto = isFree 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=10&blur=100' 
            : v.viewerPhoto;

        return (
            <div key={v.id} className={`visitor-item ${isFree ? 'locked' : ''}`}>
                <div className="visitor-avatar-wrap" onClick={() => !isFree && navigate(`/profile/${v.viewerUid}`)}>
                    <img 
                        src={displayPhoto} 
                        alt={displayName} 
                        className="visitor-avatar" 
                        style={isFree ? { filter: 'blur(8px)' } : {}} 
                    />
                    {isFree && <div className="lock-badge"><Lock size={10} /></div>}
                </div>

                <div className="visitor-info">
                    <div className="visitor-top-row">
                        <h4>{displayName}</h4>
                        <span className="visit-time">
                            <Clock size={12} />
                            {timeAgo(v.timestamp)}
                        </span>
                    </div>
                    
                    <p className="visitor-desc">
                        {isFree 
                            ? "A user recently visited your profile. Upgrade to see their details." 
                            : "Visited your profile and viewed your details."}
                    </p>

                    <div className="visitor-actions">
                        {isFree ? (
                            <button className="visitor-btn upgrade" onClick={() => navigate('/membership')}>
                                👑 Reveal Visitor
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <button className="visitor-btn view" onClick={() => navigate(`/profile/${v.viewerUid}`)}>
                                    View Profile
                                    <ChevronRight size={14} />
                                </button>
                                {effectiveTier === 'premium' && (
                                    <span style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        ✨ Premium Insight
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="visitors-page">
            <div className="dashboard-container container">
                {/* Sidebar */}
                <aside className="dash-sidebar">
                    <nav className="dash-nav">
                        <button className="dash-nav-item" onClick={() => navigate('/dashboard')}>
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
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/shortlists')}>
                            <Star size={20} />
                            <span>Shortlists</span>
                        </button>
                    </nav>

                    <div className="dash-sidebar-upgrade active" onClick={() => navigate('/visitors')} style={{ cursor: 'pointer' }}>
                        <div className="upgrade-icon">👁️</div>
                        <p>Profile Visitors</p>
                        <span>{visitors.length} people viewed you</span>
                        <button onClick={(e) => { e.stopPropagation(); navigate(isFree ? '/membership' : '/visitors'); }}>
                            {isFree ? 'Upgrade Now' : 'View Visitors'}
                        </button>
                    </div>
                </aside>

                <main className="dash-main">
                    <div className="visitors-container">
                        <div className="visitors-header">
                            <div className="visitors-header-left">
                                <h1>Profile Visitors</h1>
                                <p className="visitors-subtitle">
                                    {isFree ? "See who's interested in your profile" : `Viewing with ${effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)} access`}
                                </p>
                            </div>
                            
                            {!isFree && (
                                <div className="visitors-search">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="visitors-content">
                            {loading ? (
                                <div className="visitors-loading">
                                    <Loader2 size={32} className="spin" />
                                    <p>Gathering your views...</p>
                                </div>
                            ) : visitors.length === 0 ? (
                                <div className="empty-visitors">
                                    <div className="empty-icon">👁️</div>
                                    <h3>No visitors yet</h3>
                                    <p>Share your profile or browse others to get more visibility!</p>
                                    <button onClick={() => navigate('/profiles')}>Browse Profiles</button>
                                </div>
                            ) : (
                                <div className="visitors-list">
                                    {filteredVisitors.map(v => renderVisitorItem(v))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Dev Tier Override */}
            {isGodMode && (
                <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>🧪 Dev Tier:</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {['free', 'basic', 'premium'].map(t => (
                            <button key={t} onClick={() => handleSetOverride(t)}
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
        </div>
    );
};

export default ProfileVisitors;
