import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    User,
    Heart,
    Bell,
    Star,
    Clock,
    Loader2,
    ChevronRight,
    Search,
    Trash2,
    MapPin,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
} from 'firebase/firestore';
import './Shortlists.css';

const Shortlists = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [shortlists, setShortlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewCount, setViewCount] = useState(0);
    const [toast, setToast] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    // Dev tier override
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

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchShortlists = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'shortlists'),
                where('uid', '==', user.uid)
            );
            const snap = await getDocs(q);
            const items = [];

            for (const d of snap.docs) {
                const data = d.data();
                // Enrich with fresh profile data
                try {
                    const profileSnap = await getDoc(doc(db, 'profiles', data.savedUid));
                    if (profileSnap.exists()) {
                        const p = profileSnap.data();
                        items.push({
                            id: d.id,
                            ...data,
                            profile: {
                                uid: data.savedUid,
                                firstName: p.firstName || '',
                                lastName: p.lastName || '',
                                photo: (p.photos?.[0]) || p.avatarPhoto || '',
                                age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : null,
                                religion: p.religion || '',
                                community: p.community || '',
                                location: p.location || '',
                                qualification: p.qualification || '',
                                job: p.job || '',
                            }
                        });
                    }
                } catch { /* skip if profile not found */ }
            }

            setShortlists(items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

            // Also fetch view count for sidebar
            const viewsQ = query(collection(db, 'profile_views'), where('ownerUid', '==', user.uid));
            const viewsSnap = await getDocs(viewsQ);
            setViewCount(viewsSnap.size);
        } catch (err) {
            console.error('Error fetching shortlists:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchShortlists();
    }, [user, navigate, fetchShortlists]);

    const handleRemove = async (shortlistId) => {
        setRemovingId(shortlistId);
        try {
            await deleteDoc(doc(db, 'shortlists', shortlistId));
            setShortlists(prev => prev.filter(s => s.id !== shortlistId));
            showToast('Removed from shortlist.');
        } catch (err) {
            console.error('Error removing shortlist:', err);
            showToast('Something went wrong.', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const timeAgo = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diff = Math.floor((Date.now() - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const filtered = shortlists.filter(s => {
        const name = `${s.profile?.firstName} ${s.profile?.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="shortlists-page">
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
                        <button className="dash-nav-item active" onClick={() => navigate('/shortlists')}>
                            <Star size={20} />
                            <span>Shortlists</span>
                        </button>
                    </nav>

                    <div className="dash-sidebar-upgrade active" onClick={() => navigate('/visitors')} style={{ cursor: 'pointer' }}>
                        <div className="upgrade-icon">👁️</div>
                        <p>Profile Visitors</p>
                        <span>{viewCount} people viewed you</span>
                        <button onClick={(e) => { e.stopPropagation(); navigate(isFree ? '/membership' : '/visitors'); }}>
                            {isFree ? 'Upgrade Now' : 'View Visitors'}
                        </button>
                    </div>
                </aside>

                <main className="dash-main">
                    <div className="shortlists-container">
                        <div className="shortlists-header">
                            <div className="shortlists-header-left">
                                <h1>My Shortlist</h1>
                                <p className="shortlists-subtitle">
                                    {isFree 
                                        ? 'Upgrade to Basic or Premium to shortlist profiles' 
                                        : `${shortlists.length} profile${shortlists.length !== 1 ? 's' : ''} saved`}
                                </p>
                            </div>

                            {!isFree && (
                                <div className="shortlists-search">
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

                        {isFree ? (
                            <div className="shortlist-upgrade-wall">
                                <div className="upgrade-wall-icon">⭐</div>
                                <h3>Shortlists are a Premium Feature</h3>
                                <p>Save profiles you're interested in and revisit them anytime. Upgrade to Basic or Premium to unlock shortlisting.</p>
                                <button className="upgrade-wall-btn" onClick={() => navigate('/membership')}>
                                    👑 Upgrade Now
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="shortlists-loading">
                                <Loader2 size={32} className="spin-icon" />
                                <p>Loading your shortlists...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="empty-shortlists">
                                <div className="empty-icon">⭐</div>
                                <h3>{searchQuery ? 'No matches found' : 'No shortlisted profiles yet'}</h3>
                                <p>{searchQuery ? 'Try a different search term.' : 'Browse profiles and save the ones you like!'}</p>
                                <button onClick={() => navigate('/profiles')}>Browse Profiles</button>
                            </div>
                        ) : (
                            <div className="shortlists-grid">
                                {filtered.map(item => (
                                    <div key={item.id} className="shortlist-card">
                                        <div className="shortlist-card-photo" onClick={() => navigate(`/profile/${item.profile.uid}`)}>
                                            <img
                                                src={item.profile.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop'}
                                                alt={item.profile.firstName}
                                            />
                                            <div className="shortlist-card-overlay">
                                                <span>View Profile</span>
                                            </div>
                                        </div>
                                        <div className="shortlist-card-body">
                                            <div className="shortlist-card-name-row">
                                                <h4>{item.profile.firstName} {item.profile.lastName}</h4>
                                                {item.profile.age && <span className="shortlist-age">{item.profile.age} yrs</span>}
                                            </div>
                                            {(item.profile.location || item.profile.religion) && (
                                                <div className="shortlist-card-details">
                                                    {item.profile.location && (
                                                        <span><MapPin size={12} /> {item.profile.location}</span>
                                                    )}
                                                    {item.profile.religion && (
                                                        <span>• {item.profile.religion}</span>
                                                    )}
                                                </div>
                                            )}
                                            {item.profile.job && (
                                                <p className="shortlist-card-job">{item.profile.job}</p>
                                            )}
                                            <div className="shortlist-card-meta">
                                                <span className="shortlist-saved-time">
                                                    <Clock size={12} /> Saved {timeAgo(item.createdAt)}
                                                </span>
                                            </div>
                                            <div className="shortlist-card-actions">
                                                <button className="shortlist-action-btn view" onClick={() => navigate(`/profile/${item.profile.uid}`)}>
                                                    View Profile
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button
                                                    className="shortlist-action-btn remove"
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={removingId === item.id}
                                                >
                                                    {removingId === item.id ? (
                                                        <Loader2 size={14} className="spin-icon" />
                                                    ) : (
                                                        <Trash2 size={14} />
                                                    )}
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast-msg ${toast.type}`}>
                    {toast.msg}
                    <button onClick={() => setToast(null)}><X size={14} /></button>
                </div>
            )}

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

export default Shortlists;
