import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Heart,
    Bell,
    User,
    CheckCircle,
    X,
    Check,
    Loader2,
    Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    orderBy
} from 'firebase/firestore';
import './Notifications.css';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [interests, setInterests] = useState([]); // Inbound pending interests
    const [accepted, setAccepted] = useState([]);   // Interests I sent that got accepted
    const [visitors, setVisitors] = useState([]);   // Profile views
    const [matchesCount, setMatchesCount] = useState(0); // Total mutual matches
    const [viewCount, setViewCount] = useState(0);
    const [actionLoading, setActionLoading] = useState(null); // id being acted on
    const [toast, setToast] = useState(null);

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

    const fetchData = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            // 1. Inbound pending interests (someone sent ME an interest)
            const inboundQ = query(
                collection(db, 'interests'),
                where('toUid', '==', user.uid),
                where('status', '==', 'pending')
            );
            const inboundSnap = await getDocs(inboundQ);
            const inboundList = inboundSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. Interests I sent that got accepted
            const acceptedQ = query(
                collection(db, 'interests'),
                where('fromUid', '==', user.uid),
                where('status', '==', 'accepted')
            );
            const acceptedSnap = await getDocs(acceptedQ);
            const acceptedList = acceptedSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 3. Interests sent to ME that I accepted
            const inboundAcceptedQ = query(
                collection(db, 'interests'),
                where('toUid', '==', user.uid),
                where('status', '==', 'accepted')
            );
            const inboundAcceptedSnap = await getDocs(inboundAcceptedQ);

            // 4. Fetch Profile Views
            const viewsQ = query(collection(db, 'profile_views'), where('ownerUid', '==', user.uid));
            const viewsSnap = await getDocs(viewsQ);
            setViewCount(viewsSnap.size);

            const visitorsList = viewsSnap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            
            setInterests(inboundList);
            setAccepted(acceptedList);
            setVisitors(visitorsList.sort((a,b) => b.timestamp - a.timestamp));
            setMatchesCount(acceptedList.length + inboundAcceptedSnap.size);
        } catch (err) {
            console.error('Error fetching interests:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [user, navigate, fetchData]);

    const handleAccept = async (interestId, fromUid) => {
        setActionLoading(interestId);
        try {
            await updateDoc(doc(db, 'interests', interestId), {
                status: 'accepted',
            });
            setInterests(prev => prev.filter(i => i.id !== interestId));
            showToast('Interest accepted! Contact details are now visible to both.');
        } catch (err) {
            console.error('Error accepting interest:', err);
            showToast('Something went wrong.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (interestId) => {
        setActionLoading(interestId);
        try {
            await updateDoc(doc(db, 'interests', interestId), {
                status: 'declined',
            });
            setInterests(prev => prev.filter(i => i.id !== interestId));
            showToast('Interest declined.');
        } catch (err) {
            console.error('Error declining interest:', err);
            showToast('Something went wrong.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

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

    const hasAny = interests.length > 0 || accepted.length > 0;

    return (
        <div className="notifications-page">
            {toast && (
                <div className={`up-toast ${toast.type || ''}`}>
                    {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
                    {toast.msg}
                </div>
            )}

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
                            {matchesCount > 0 && (
                                <span className="nav-badge">{matchesCount}</span>
                            )}
                        </button>
                        <button className="dash-nav-item active" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {interests.length > 0 && (
                                <span className="nav-badge">{interests.length}</span>
                            )}
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/shortlists')}>
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
                    <div className="notif-container">
                        <div className="notif-header">
                            <div>
                                <h1>Notifications</h1>
                                <p>Stay updated with your latest activities</p>
                            </div>
                        </div>

                        <div className="notif-content">
                            {loading ? (
                                <div className="loading-state">
                                    <Loader2 size={32} className="notif-spin" />
                                    <p>Loading notifications...</p>
                                </div>
                            ) : (!hasAny && visitors.length === 0) ? (
                                <div className="empty-notif">
                                    <div className="empty-icon">🔔</div>
                                    <h3>No notifications yet</h3>
                                    <p>We'll notify you when someone interacts with your profile!</p>
                                    <button onClick={() => navigate('/profiles')}>Browse Profiles</button>
                                </div>
                            ) : (
                                <div className="notif-list">
                                    {/* Pending inbound interests */}
                                    {interests.map(interest => (
                                        <div key={interest.id} className="notif-item unread interest-card">
                                            <div className="notif-icon" style={{ backgroundColor: '#fff0ec' }}>
                                                {interest.fromPhoto && !isFree ? (
                                                    <img src={interest.fromPhoto} alt={interest.fromName} className="notif-avatar" />
                                                ) : isFree ? (
                                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=10&blur=100" alt="blurred" className="notif-avatar" style={{ filter: 'blur(6px)' }} />
                                                ) : (
                                                    <Heart size={18} color="#f97316" />
                                                )}
                                            </div>
                                            <div className="notif-info">
                                                <div className="notif-title-row">
                                                    <h4>New Interest</h4>
                                                    <span className="notif-time">{timeAgo(interest.createdAt)}</span>
                                                </div>
                                                <p>
                                                    <strong>{isFree ? `WU${interest.fromUid?.substring(0,6).toUpperCase()}` : (interest.fromName || 'Someone')}</strong> sent you an interest request!
                                                </p>
                                                <div className="notif-action-row">
                                                    {isFree ? (
                                                        <button
                                                            className="notif-btn upgrade"
                                                            onClick={() => navigate('/membership')}
                                                            style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '50px', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: 'white', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        >
                                                            ✨ Unlock to Reply
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="notif-btn accept"
                                                                onClick={() => handleAccept(interest.id, interest.fromUid)}
                                                                disabled={actionLoading === interest.id}
                                                            >
                                                                {actionLoading === interest.id ? (
                                                                    <Loader2 size={14} className="notif-spin" />
                                                                ) : (
                                                                    <Check size={14} />
                                                                )}
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="notif-btn decline"
                                                                onClick={() => handleDecline(interest.id)}
                                                                disabled={actionLoading === interest.id}
                                                            >
                                                                <X size={14} />
                                                                Decline
                                                            </button>
                                                            <button
                                                                className="notif-btn view"
                                                                onClick={() => navigate(`/profile/${interest.fromUid}`)}
                                                            >
                                                                View Profile
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Accepted interests (sent by me) */}
                                    {accepted.map(interest => (
                                        <div key={interest.id} className="notif-item read">
                                            <div className="notif-icon" style={{ backgroundColor: '#eefbf3' }}>
                                                <CheckCircle size={18} color="#10b981" />
                                            </div>
                                            <div className="notif-info">
                                                <div className="notif-title-row">
                                                    <h4>Interest Accepted 🎉</h4>
                                                    <span className="notif-time">{timeAgo(interest.updatedAt || interest.createdAt)}</span>
                                                </div>
                                                <p>
                                                    Your interest was accepted by <strong>{isFree ? `WU${interest.toUid?.substring(0,6).toUpperCase()}` : (interest.toName || 'a user')}</strong>. Contact details are now unlocked.
                                                </p>
                                                <div className="notif-action-row">
                                                    <button
                                                        className="notif-btn view"
                                                        onClick={() => navigate(`/profile/${interest.toUid}`)}
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Profile Visitors */}
                                    {visitors.map(v => (
                                        <div key={v.id} className="notif-item read" style={{ backgroundColor: isFree ? '#fdf4ff' : 'white' }}>
                                            <div className="notif-icon" style={{ padding: 0, overflow: 'hidden', border: isFree ? 'none' : '2px solid #e2e8f0', width: 40, height: 40 }}>
                                                {isFree ? (
                                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=10&blur=100" alt="blurred" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src={v.viewerPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=10&blur=100'} alt={v.viewerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            <div className="notif-info">
                                                <div className="notif-title-row">
                                                    <h4>Profile Visitor</h4>
                                                    <span className="notif-time">{timeAgo(v.timestamp)}</span>
                                                </div>
                                                <p>
                                                    <strong>{isFree ? `WU${v.viewerUid?.substring(0,6).toUpperCase() || 'ANON'}` : (v.viewerName || 'Someone')}</strong> visited your profile.
                                                </p>
                                                <div className="notif-action-row">
                                                    <button
                                                        className="notif-btn view"
                                                        onClick={() => navigate(isFree ? '/membership' : `/profile/${v.viewerUid}`)}
                                                        style={{ color: isFree ? '#a855f7' : '' }}
                                                    >
                                                        {isFree ? 'Unlock to view' : 'View Profile'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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

export default Notifications;
