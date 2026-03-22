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
    Loader2
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
    const [actionLoading, setActionLoading] = useState(null); // id being acted on
    const [toast, setToast] = useState(null);

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

            setInterests(inboundList);
            setAccepted(acceptedList);
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
                        </button>
                        <button className="dash-nav-item active" onClick={() => navigate('/notifications')}>
                            <Bell size={20} />
                            <span>Notifications</span>
                            {interests.length > 0 && (
                                <span className="nav-badge">{interests.length}</span>
                            )}
                        </button>
                    </nav>

                    <div className="dash-sidebar-upgrade">
                        <div className="upgrade-icon">👑</div>
                        <p>Upgrade to Premium</p>
                        <span>See who visited your profile</span>
                        <button onClick={() => navigate('/membership')}>Upgrade Now</button>
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
                            ) : !hasAny ? (
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
                                                {interest.fromPhoto ? (
                                                    <img src={interest.fromPhoto} alt={interest.fromName} className="notif-avatar" />
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
                                                    <strong>{interest.fromName || 'Someone'}</strong> sent you an interest request!
                                                </p>
                                                <div className="notif-action-row">
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
                                                    Your interest was accepted by <strong>{interest.toName || 'a user'}</strong>. Contact details are now unlocked.
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
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Notifications;
