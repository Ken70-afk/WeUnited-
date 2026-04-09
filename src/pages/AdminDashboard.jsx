import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { 
    LayoutDashboard, Users, CheckSquare, Settings, LogOut, Search, UserCheck, 
    Trash2, Eye, ShieldAlert, Image as ImageIcon, AlertTriangle, CheckCircle2,
    Ban, Shield, X, Check
} from 'lucide-react';
import './AdminDashboard.css';
import logoImg from '../assets/logo.png';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [usersList, setUsersList] = useState([]);
    const [reportsList, setReportsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stats State
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        verified: 0,
        premium: 0,
        pendingIdentity: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        fetchAdminData();
    }, [user, navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Fetch users
            const profilesSnap = await getDocs(collection(db, 'profiles'));
            const loadedUsers = [];
            let total = 0, active = 0, verified = 0, premium = 0, pendingIdentity = 0;
            
            const now = new Date();

            profilesSnap.forEach(docSnap => {
                const data = docSnap.data();
                const uid = docSnap.id;
                loadedUsers.push({ uid, ...data });

                total++;
                if (data.isIdVerified) verified++;
                if (data.plan === 'premium' || data.plan === 'basic') premium++;
                if (data.idVerificationStatus === 'pending') pendingIdentity++;

                // Active User Logic (last 30 days)
                let lastActiveDate = null;
                if (data.lastLogin?.toDate) lastActiveDate = data.lastLogin.toDate();
                else if (data.updatedAt?.toDate) lastActiveDate = data.updatedAt.toDate();
                else if (data.createdAt?.toDate) lastActiveDate = data.createdAt.toDate();

                if (lastActiveDate) {
                    const daysSinceActive = (now - lastActiveDate) / (1000 * 60 * 60 * 24);
                    if (daysSinceActive <= 30) active++;
                }
            });

            // Fetch reports
            const reportsSnap = await getDocs(collection(db, 'reports'));
            const loadedReports = [];
            reportsSnap.forEach(rSnap => {
                loadedReports.push({ id: rSnap.id, ...rSnap.data() });
            });

            setUsersList(loadedUsers);
            setReportsList(loadedReports);
            setStats({ total, active, verified, premium, pendingIdentity });

        } catch (error) {
            console.error("Error fetching admin data: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    // --- Actions ---

    const suspendUser = async (uid, currentStatus) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
        
        try {
            await updateDoc(doc(db, 'profiles', uid), { status: newStatus });
            setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    const approveIdentity = async (uid) => {
        if (!window.confirm("Approve this identity document?")) return;
        try {
            await updateDoc(doc(db, 'profiles', uid), {
                idVerificationStatus: 'approved',
                isIdVerified: true
            });
            setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, idVerificationStatus: 'approved', isIdVerified: true } : u));
            setStats(prev => ({ ...prev, pendingIdentity: prev.pendingIdentity - 1, verified: prev.verified + 1 }));
        } catch (err) {
            console.error("Error approving identity:", err);
        }
    };

    const rejectIdentity = async (uid) => {
        if (!window.confirm("Reject this identity document?")) return;
        try {
            await updateDoc(doc(db, 'profiles', uid), {
                idVerificationStatus: 'rejected',
                isIdVerified: false
            });
            setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, idVerificationStatus: 'rejected' } : u));
            setStats(prev => ({ ...prev, pendingIdentity: prev.pendingIdentity - 1 }));
        } catch (err) {
            console.error("Error rejecting identity:", err);
        }
    };

    const deletePhoto = async (uid, photoUrl, isAvatar = false) => {
        if (!window.confirm("Delete this photo? This cannot be undone.")) return;
        try {
            const userRef = doc(db, 'profiles', uid);
            const userProfile = usersList.find(u => u.uid === uid);
            if (!userProfile) return;

            if (isAvatar) {
                await updateDoc(userRef, { avatarPhoto: null });
                setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, avatarPhoto: null } : u));
            } else {
                const newPhotos = (userProfile.photos || []).filter(p => p !== photoUrl);
                await updateDoc(userRef, { photos: newPhotos });
                setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, photos: newPhotos } : u));
            }

            // Attempt to delete from storage if it's a firebase storage URL
            if (photoUrl.includes('firebasestorage')) {
                // The URL is fully encoded, extracting the path is complex, usually we just let it orphan or parse it
                // For simplicity, we just remove the reference in Firestore.
            }
        } catch (err) {
            console.error("Error deleting photo:", err);
        }
    };

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            await updateDoc(doc(db, 'reports', reportId), { status: newStatus });
            setReportsList(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        } catch (err) {
            console.error("Error updating report:", err);
        }
    };

    // --- Renders ---

    const filteredUsers = usersList.filter(u => {
        const query = searchQuery.toLowerCase();
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        return fullName.includes(query) || (u.uid && u.uid.toLowerCase().includes(query)) || (u.email && u.email.toLowerCase().includes(query));
    });

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <img src={logoImg} alt="WeUnited Logo" className="admin-sidebar-logo" />
                    <h2>WeUnited Admin</h2>
                </div>
                
                <nav className="admin-nav">
                    <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={20} /> Users
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                        <CheckSquare size={20} /> Identity Approvals
                        {stats.pendingIdentity > 0 && <span className="admin-badge">{stats.pendingIdentity}</span>}
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                        <ImageIcon size={20} /> Content Moderation
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        <ShieldAlert size={20} /> Reports & Abuse
                        {reportsList.filter(r => r.status === 'pending').length > 0 && 
                            <span className="admin-badge error">{reportsList.filter(r => r.status === 'pending').length}</span>
                        }
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                        <Settings size={20} /> Settings
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-profile-mini">
                        <div className="admin-avatar-mini">{user.firstName?.charAt(0) || 'A'}</div>
                        <div className="admin-info-mini">
                            <span className="admin-name">{user.firstName} {user.lastName}</span>
                            <span className="admin-role">Super Admin</span>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-search-bar">
                        <Search size={18} color="#9ca3af" />
                        <input 
                            type="text" 
                            placeholder="Search users by name, email or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="admin-header-actions">
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Admin God Mode Enabled</span>
                    </div>
                </header>

                <div className="admin-content-inner">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                            <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="admin-page-title">
                                {activeTab === 'dashboard' && 'Dashboard Overview'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'approvals' && 'Pending Identity Approvals'}
                                {activeTab === 'moderation' && 'Content Moderation'}
                                {activeTab === 'reports' && 'Reports & Abuse Management'}
                                {activeTab === 'settings' && 'Platform Settings'}
                            </h1>

                            {/* DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <>
                                    <div className="admin-stats-grid">
                                        <div className="admin-stat-card">
                                            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                                <Users size={24} />
                                            </div>
                                            <div className="stat-details">
                                                <h3>Total Users</h3>
                                                <p className="stat-number">{stats.total}</p>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon" style={{ backgroundColor: '#dcfce3', color: '#16a34a' }}>
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <div className="stat-details">
                                                <h3>Active Users (30d)</h3>
                                                <p className="stat-number">{stats.active}</p>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                                <Shield size={24} />
                                            </div>
                                            <div className="stat-details">
                                                <h3>Verified Users</h3>
                                                <p className="stat-number">{stats.verified}</p>
                                                <span className="stat-trend neutral">{Math.round((stats.verified / Math.max(stats.total, 1)) * 100)}% of total</span>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                                                <LayoutDashboard size={24} />
                                            </div>
                                            <div className="stat-details">
                                                <h3>Premium Plans</h3>
                                                <p className="stat-number">{stats.premium}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="admin-table-container mt-6">
                                        <div className="admin-table-header">
                                            <h2>Recently Joined</h2>
                                            <button className="admin-btn-secondary" onClick={() => setActiveTab('users')}>View All Users</button>
                                        </div>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Plan</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usersList.slice(0, 5).map(u => (
                                                    <tr key={u.uid}>
                                                        <td className="font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                                                        <td>{u.email}</td>
                                                        <td><span className={`membership-badge ${u.plan || 'free'}`}>{u.plan || 'free'}</span></td>
                                                        <td>
                                                            {u.status === 'suspended' ? <span className="status-badge suspended">Suspended</span> : <span className="status-badge verified">Active</span>}
                                                        </td>
                                                        <td>
                                                            <div className="admin-action-buttons">
                                                                <button className="action-btn view" title="View Profile" onClick={() => navigate(`/profile/${u.uid}`)}>
                                                                    <Eye size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Profile ID</th>
                                                <th>Name</th>
                                                <th>Plan</th>
                                                <th>Verified</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(u => (
                                                <tr key={u.uid} style={{ opacity: u.status === 'suspended' ? 0.6 : 1 }}>
                                                    <td className="text-gray-500 text-sm font-mono">{u.uid.substring(0, 8)}...</td>
                                                    <td className="font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                                                    <td><span className={`membership-badge ${u.plan || 'free'}`}>{u.plan || 'free'}</span></td>
                                                    <td>{u.isIdVerified ? '✅ Yes' : '❌ No'}</td>
                                                    <td>
                                                        <span className={`status-badge ${u.status === 'suspended' ? 'pending' : 'verified'}`}>
                                                            {u.status === 'suspended' ? 'Suspended' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="admin-action-buttons">
                                                            <button className="action-btn view" title="View Profile" onClick={() => navigate(`/profile/${u.uid}`)}><Eye size={16} /></button>
                                                            <button className={`action-btn ${u.status === 'suspended' ? 'verify' : 'delete'}`} title={u.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'} onClick={() => suspendUser(u.uid, u.status)}>
                                                                {u.status === 'suspended' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* APPROVALS TAB */}
                            {activeTab === 'approvals' && (
                                <div className="approvals-grid">
                                    {usersList.filter(u => u.idVerificationStatus === 'pending').length === 0 ? (
                                        <div className="empty-state">No pending identity approvals.</div>
                                    ) : (
                                        usersList.filter(u => u.idVerificationStatus === 'pending').map(u => (
                                            <div className="admin-card" key={u.uid}>
                                                <h3 className="mb-2">{u.firstName} {u.lastName}</h3>
                                                <p className="text-sm text-gray-500 mb-4">Profile ID: {u.uid}</p>
                                                {u.idDocumentUrl ? (
                                                    <div className="doc-preview">
                                                        <img src={u.idDocumentUrl} alt="ID Document" style={{ width: '100%', height: '200px', objectFit: 'contain', background: '#f3f4f6', borderRadius: '8px' }} />
                                                    </div>
                                                ) : (
                                                    <div className="doc-preview missing">No document URL found</div>
                                                )}
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => approveIdentity(u.uid)} className="admin-btn-primary bg-green-600 hoverColor-green-700 flex-1 flex center gap-2"><Check size={16}/> Approve</button>
                                                    <button onClick={() => rejectIdentity(u.uid)} className="admin-btn-secondary text-red-600 flex-1 flex center gap-2"><X size={16}/> Reject</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* MODERATION TAB */}
                            {activeTab === 'moderation' && (
                                <div className="moderation-view">
                                    <p className="mb-4 text-gray-600">Review user photos. Delete anything inappropriate.</p>
                                    <div className="photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {usersList.map(u => {
                                            const photos = [];
                                            if (u.avatarPhoto) photos.push({ url: u.avatarPhoto, type: 'Avatar', uid: u.uid, name: u.firstName });
                                            if (u.photos && u.photos.length > 0) {
                                                u.photos.forEach(p => photos.push({ url: p, type: 'Gallery', uid: u.uid, name: u.firstName }));
                                            }
                                            return photos;
                                        }).flat().map((p, idx) => (
                                            <div key={idx} className="mod-photo-card" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                                <img src={p.url} alt="User Photo" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '8px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px' }}>{p.name} • {p.type}</span>
                                                    <button onClick={() => deletePhoto(p.uid, p.url, p.type === 'Avatar')} title="Delete Photo" style={{ background: '#ef4444', border: 'none', color: 'white', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* REPORTS TAB */}
                            {activeTab === 'reports' && (
                                <div className="admin-table-container">
                                    {reportsList.length === 0 ? (
                                        <div className="empty-state">No reports submitted.</div>
                                    ) : (
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Reported User</th>
                                                    <th>Reported By</th>
                                                    <th>Reason</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportsList.sort((a,b) => b.createdAt - a.createdAt).map(r => {
                                                    const dateStr = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'N/A';
                                                    return (
                                                        <tr key={r.id}>
                                                            <td className="text-gray-500 text-sm">{dateStr}</td>
                                                            <td className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/profile/${r.reportedUid}`)}>{r.reportedName}</td>
                                                            <td className="text-gray-500">{r.reporterName}</td>
                                                            <td>
                                                                <span className="font-medium block">{r.reason}</span>
                                                                {r.notes && <span className="text-xs text-gray-400 block mt-1">{r.notes.substring(0,30)}...</span>}
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge ${r.status === 'pending' ? 'pending' : (r.status === 'ignored' || r.status === 'warned') ? 'verified' : 'suspended'}`}>
                                                                    {r.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <select 
                                                                    value={r.status} 
                                                                    onChange={(e) => updateReportStatus(r.id, e.target.value)}
                                                                    className="admin-select-small"
                                                                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="investigating">Investigating</option>
                                                                    <option value="ignored">Ignore</option>
                                                                    <option value="warned">Warned</option>
                                                                    <option value="suspended">Suspended Target</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="admin-placeholder-state">
                                    <p>Global platform settings, maintenance modes, and metadata keys will reside here.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
