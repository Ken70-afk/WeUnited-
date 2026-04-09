import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Users,
    Heart,
    Bell,
    User,
    Search,
    Check,
    X,
    MapPin,
    Gem,
    Loader2,
    ChevronRight,
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
    deleteDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import './Matches.css';

const Matches = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(() => {
        if (tabFromUrl && ['received', 'sent', 'mutual'].includes(tabFromUrl)) return tabFromUrl;
        return 'received';
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [pendingInbound, setPendingInbound] = useState(0);

    const [received, setReceived]   = useState([]); // inbound pending
    const [sent, setSent]           = useState([]); // outbound interests
    const [mutual, setMutual]       = useState([]); // accepted both ways
    const [viewCount, setViewCount] = useState(0);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const calculateAge = (dob) => {
        if (!dob) return null;
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    // Helper: enrich an interest doc with the other user's profile
    const enrichWithProfile = async (interestDoc, profileUid) => {
        try {
            const profileSnap = await getDoc(doc(db, 'profiles', profileUid));
            if (!profileSnap.exists()) return null;
            const p = profileSnap.data();
            return {
                interestId: interestDoc.id,
                ...interestDoc.data(),
                profile: {
                    uid: profileUid,
                    firstName: p.firstName || '',
                    lastName: p.lastName || '',
                    photo: (p.photos?.[0]) || p.avatarPhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
                    age: calculateAge(p.dob),
                    religion: p.religion || '',
                    community: p.community || '',
                    location: p.location || '',
                    qualification: p.qualification || '',
                    job: p.job || '',
                    maritalStatus: p.maritalStatus || '',
                }
            };
        } catch { return null; }
    };

    const fetchData = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            // 1. Inbound pending interests (someone sent ME interest)
            const inboundQ = query(
                collection(db, 'interests'),
                where('toUid', '==', user.uid),
                where('status', '==', 'pending')
            );
            const inboundSnap = await getDocs(inboundQ);
            const receivedEnriched = (await Promise.all(
                inboundSnap.docs.map(d => enrichWithProfile(d, d.data().fromUid))
            )).filter(Boolean);

            // 1b. Inbound accepted interests (matches)
            const inboundAcceptedQ = query(
                collection(db, 'interests'),
                where('toUid', '==', user.uid),
                where('status', '==', 'accepted')
            );
            const inboundAcceptedSnap = await getDocs(inboundAcceptedQ);
            const inboundAcceptedEnriched = (await Promise.all(
                inboundAcceptedSnap.docs.map(d => enrichWithProfile(d, d.data().fromUid))
            )).filter(Boolean);

            // 2. Outbound interests (I sent to others)
            const outboundQ = query(
                collection(db, 'interests'),
                where('fromUid', '==', user.uid)
            );
            const outboundSnap = await getDocs(outboundQ);
            const sentEnriched = (await Promise.all(
                outboundSnap.docs.map(d => enrichWithProfile(d, d.data().toUid))
            )).filter(Boolean);

            // 3. Mutual = outbound accepted + inbound accepted
            const mutualEnriched = [
                ...sentEnriched.filter(i => i.status === 'accepted'),
                ...inboundAcceptedEnriched
            ];

            // 4. Fetch Profile Views Count
            const viewsQ = query(collection(db, 'profile_views'), where('ownerUid', '==', user.uid));
            const viewsSnap = await getDocs(viewsQ);
            setViewCount(viewsSnap.size);

            setReceived(receivedEnriched);
            setSent(sentEnriched.filter(i => i.status !== 'accepted')); // exclude accepted from "sent" tab
            setMutual(mutualEnriched);
            setPendingInbound(receivedEnriched.length);
        } catch (err) {
            console.error('Error fetching matches:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [user, navigate, fetchData]);

    const handleAccept = async (interestId) => {
        setActionLoading(interestId);
        try {
            await updateDoc(doc(db, 'interests', interestId), { status: 'accepted' });
            const item = received.find(r => r.interestId === interestId);
            setReceived(prev => prev.filter(r => r.interestId !== interestId));
            if (item) setMutual(prev => [...prev, { ...item, status: 'accepted' }]);
            showToast('Interest accepted! You\'re now matched 🎉');
        } catch (err) {
            showToast('Something went wrong. Try again.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (interestId) => {
        setActionLoading(interestId);
        try {
            await updateDoc(doc(db, 'interests', interestId), { status: 'declined' });
            setReceived(prev => prev.filter(r => r.interestId !== interestId));
            showToast('Interest declined.');
        } catch (err) {
            showToast('Something went wrong.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleWithdraw = async (interestId) => {
        setActionLoading(interestId);
        try {
            await deleteDoc(doc(db, 'interests', interestId));
            setSent(prev => prev.filter(r => r.interestId !== interestId));
            showToast('Interest withdrawn.');
        } catch (err) {
            showToast('Something went wrong.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const timeAgo = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        const diff = Math.floor((Date.now() - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const planTier       = user?.plan === 'premium' ? 'premium' : user?.plan === 'basic' ? 'basic' : 'free';
    const isGodMode      = user?.role === 'admin';
    const [devOverride, setDevOverride] = useState(() => localStorage.getItem('devTierOverride'));
    const effectiveTier    = (isGodMode && devOverride) ? devOverride : planTier;
    const effectiveFree    = effectiveTier === 'free';
    const isFree           = effectiveFree;
    const effectiveBasic   = effectiveTier === 'basic';
    const effectivePremium = effectiveTier === 'premium';
    // In Matches, basic/premium both see all matched profiles — blur only for free
    const showBlurForItem  = () => effectiveFree;

    const handleSetOverride = (t) => {
        const newVal = t === devOverride ? null : t;
        setDevOverride(newVal);
        if (newVal) localStorage.setItem('devTierOverride', newVal);
        else localStorage.removeItem('devTierOverride');
    };

    const currentList = { received, sent, mutual }[activeTab];
    const filtered = currentList.filter(i => {
        const name = `${i.profile.firstName} ${i.profile.lastName}`.toLowerCase();
        const pid = (i.profile.profileId || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || pid.includes(searchQuery.toLowerCase());
    });

    const renderMatchItem = (item) => {
        const { profile, interestId, createdAt, status } = item;
        const profileIdDisplay = profile.profileId || `WU${profile.uid?.substring(0, 6).toUpperCase()}`;
        const isFree = effectiveFree;
        
        // --- HARD SECURITY: Scrub real data from DOM for free users ---
        const displayName = isFree ? profileIdDisplay : `${profile.firstName} ${profile.lastName}`.trim();
        const displayPhoto = isFree 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=10&blur=100' 
            : profile.photo;

        const isActing = actionLoading === interestId;
        const tags = [
            profile.age ? `${profile.age} yrs` : null,
            profile.religion,
            profile.location,
            profile.qualification,
        ].filter(Boolean);

        // Determine border/status color
        let statusClass = 'pending';
        if (activeTab === 'mutual') statusClass = 'mutual';
        if (status === 'accepted' && activeTab === 'sent') statusClass = 'mutual';
        if (status === 'declined') statusClass = 'declined';

        return (
            <div key={interestId} className={`dash-matches-item ${statusClass}`}>
                <div className="matches-item-icon" onClick={() => !isFree && navigate(`/profile/${profile.uid}`)} style={{ cursor: isFree ? 'default' : 'pointer' }}>
                    <img src={displayPhoto} alt={displayName} className="matches-item-avatar" style={isFree ? { filter: 'blur(8px)' } : {}} />
                </div>

                <div className="matches-item-info">
                    <div className="matches-item-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h4>{displayName}</h4>
                            {activeTab === 'mutual' && !isFree && <span className="mutual-tag">✓ Matched</span>}
                        </div>
                        <span className="matches-item-time">{timeAgo(createdAt)}</span>
                    </div>

                    <div className="matches-item-details">
                        {isFree ? (
                            <p className="matches-item-desc">
                                Upgrade to view full details and connect with this match.
                            </p>
                        ) : (
                            <p className="matches-item-desc">
                                {tags.join(' • ')}
                            </p>
                        )}
                    </div>

                    <div className="matches-item-actions">
                        {isFree ? (
                            <button className="matches-btn upgrade" onClick={() => navigate('/membership')}>
                                ✨ Unlock Profile
                            </button>
                        ) : (
                            <>
                                {activeTab === 'received' && (
                                    <>
                                        <button className="matches-btn accept" onClick={() => handleAccept(interestId)} disabled={isActing}>
                                            {isActing ? <Loader2 size={14} className="mc-spin" /> : <Check size={14} />}
                                            Accept
                                        </button>
                                        <button className="matches-btn decline" onClick={() => handleDecline(interestId)} disabled={isActing}>
                                            <X size={14} />
                                            Decline
                                        </button>
                                    </>
                                )}
                                {activeTab === 'sent' && status === 'pending' && (
                                    <button className="matches-btn withdraw" onClick={() => handleWithdraw(interestId)} disabled={isActing}>
                                        <X size={14} />
                                        Withdraw
                                    </button>
                                )}
                                {(activeTab === 'mutual' || (activeTab === 'sent' && status === 'accepted')) && (
                                    <button className="matches-btn view" onClick={() => navigate(`/profile/${profile.uid}`)}>
                                        View Profile
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="matches-page">
            {toast && (
                <div className={`up-toast ${toast.type || ''}`}>
                    {toast.type === 'error' ? <X size={16}/> : <Check size={16}/>}
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
                        <button className="dash-nav-item active" onClick={() => navigate('/matches')}>
                            <Heart size={20} />
                            <span>Matches</span>
                            {mutual.length > 0 && <span className="nav-badge">{mutual.length}</span>}
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {pendingInbound > 0 && <span className="nav-badge">{pendingInbound}</span>}
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

                {/* Main */}
                <main className="dash-main">
                    <div className="matches-container">

                        {/* Header */}
                        <div className="matches-header">
                            <div className="matches-header-left">
                                <h1>My Matches</h1>
                                <p className="matches-subtitle">Manage your interests and connections</p>
                            </div>
                            <div className="matches-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by name…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* DEV ONLY — remove before production */}
                        {isGodMode && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', padding: '0.5rem 0.75rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107', fontSize: '0.8rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#856404' }}>🧪 Dev tier:</span>
                                {['free', 'basic', 'premium'].map(t => (
                                    <button key={t} onClick={() => handleSetOverride(t)}
                                        style={{ padding: '2px 10px', borderRadius: '20px', border: '1px solid #856404', background: effectiveTier === t ? '#856404' : 'transparent', color: effectiveTier === t ? '#fff' : '#856404', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
                                        {t}{!devOverride && t === planTier ? ' (actual)' : devOverride === t ? ' ✓' : ''}
                                    </button>
                                ))}
                                {devOverride && <span style={{ color: '#856404' }}>overriding actual: <b>{planTier}</b></span>}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="matches-tabs">
                            {[
                                { key: 'received', label: 'Interests Received', count: received.length },
                                { key: 'sent',     label: 'Interests Sent',     count: sent.length },
                                { key: 'mutual',   label: 'Mutual Matches',     count: mutual.length },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`match-tab ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                                >
                                    {tab.label}
                                    {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="matches-content">
                            {loading ? (
                                <div className="matches-loading">
                                    <Loader2 size={32} className="mc-spin" />
                                    <p>Loading your matches…</p>
                                </div>
                            ) : filtered.length > 0 ? (
                                <div className="matches-list">
                                    {filtered.map(item => renderMatchItem(item))}
                                </div>
                            ) : (
                                <div className="empty-matches">
                                    <div className="empty-icon">
                                        {activeTab === 'mutual' ? '🎉' : '💌'}
                                    </div>
                                    <h3>
                                        {activeTab === 'received' && 'No interests received yet'}
                                        {activeTab === 'sent' && 'You haven\'t sent any interests'}
                                        {activeTab === 'mutual' && 'No mutual matches yet'}
                                    </h3>
                                    <p>
                                        {activeTab === 'mutual'
                                            ? 'When someone accepts your interest, they\'ll appear here.'
                                            : 'Find profiles you like and send them an interest!'}
                                    </p>
                                    <button onClick={() => navigate('/profiles')}>Browse Profiles</button>
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

export default Matches;
