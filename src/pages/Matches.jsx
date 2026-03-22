import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const [activeTab, setActiveTab] = useState('received');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [pendingInbound, setPendingInbound] = useState(0);

    const [received, setReceived]   = useState([]); // inbound pending
    const [sent, setSent]           = useState([]); // outbound interests
    const [mutual, setMutual]       = useState([]); // accepted both ways

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

            // 2. Outbound interests (I sent to others)
            const outboundQ = query(
                collection(db, 'interests'),
                where('fromUid', '==', user.uid)
            );
            const outboundSnap = await getDocs(outboundQ);
            const sentEnriched = (await Promise.all(
                outboundSnap.docs.map(d => enrichWithProfile(d, d.data().toUid))
            )).filter(Boolean);

            // 3. Mutual = outbound that got ACCEPTED
            const mutualEnriched = sentEnriched.filter(i => i.status === 'accepted');

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

    const currentList = { received, sent, mutual }[activeTab];
    const filtered = currentList.filter(i => {
        const name = `${i.profile.firstName} ${i.profile.lastName}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const renderCard = (item) => {
        const { profile, interestId, createdAt, status } = item;
        const name = `${profile.firstName} ${profile.lastName}`.trim();
        const isActing = actionLoading === interestId;
        const tags = [
            profile.age ? `${profile.age} yrs` : null,
            profile.religion,
            profile.location,
            profile.qualification,
        ].filter(Boolean);

        return (
            <div key={interestId} className={`match-card ${activeTab === 'mutual' ? 'match-card--mutual' : ''}`}>
                <div className="match-card-photo" onClick={() => navigate(`/profile/${profile.uid}`)}>
                    <img src={profile.photo} alt={name} loading="lazy" />
                    {activeTab === 'mutual' && (
                        <div className="mutual-badge">
                            <Heart size={12} fill="white" />
                            Matched
                        </div>
                    )}
                </div>

                <div className="match-card-body" onClick={() => navigate(`/profile/${profile.uid}`)}>
                    <div className="match-card-top">
                        <h3>{name}</h3>
                        <span className="match-time">{timeAgo(createdAt)}</span>
                    </div>
                    <div className="match-card-tags">
                        {tags.map((t, i) => <span key={i} className="mc-tag">{t}</span>)}
                    </div>
                    {activeTab === 'mutual' && (
                        <p className="mutual-hint">
                            🎉 Contact details are now unlocked. View profile to connect.
                        </p>
                    )}
                    {activeTab === 'sent' && (
                        <span className={`status-chip ${status}`}>
                            {status === 'pending' ? '⏳ Awaiting Response' : status === 'declined' ? '✕ Declined' : '✓ Accepted'}
                        </span>
                    )}
                </div>

                <div className="match-card-actions" onClick={e => e.stopPropagation()}>
                    {activeTab === 'received' && (
                        <>
                            <button
                                className="mc-btn accept"
                                onClick={() => handleAccept(interestId)}
                                disabled={isActing}
                                title="Accept"
                            >
                                {isActing ? <Loader2 size={18} className="mc-spin" /> : <Check size={18} />}
                                <span>Accept</span>
                            </button>
                            <button
                                className="mc-btn decline"
                                onClick={() => handleDecline(interestId)}
                                disabled={isActing}
                                title="Decline"
                            >
                                <X size={18} />
                            </button>
                        </>
                    )}
                    {activeTab === 'sent' && status === 'pending' && (
                        <button
                            className="mc-btn withdraw"
                            onClick={() => handleWithdraw(interestId)}
                            disabled={isActing}
                        >
                            {isActing ? <Loader2 size={16} className="mc-spin" /> : <X size={16} />}
                            <span>Withdraw</span>
                        </button>
                    )}
                    {activeTab === 'mutual' && (
                        <button
                            className="mc-btn view"
                            onClick={() => navigate(`/profile/${profile.uid}`)}
                        >
                            <ChevronRight size={18} />
                            <span>View</span>
                        </button>
                    )}
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
                            {pendingInbound > 0 && <span className="nav-badge">{pendingInbound}</span>}
                        </button>
                        <button className="dash-nav-item" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
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
                                    {filtered.map(item => renderCard(item))}
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
        </div>
    );
};

export default Matches;
