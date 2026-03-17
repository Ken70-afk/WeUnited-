import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CheckSquare, Settings, LogOut, Search, UserCheck, Trash2, Eye } from 'lucide-react';
import './AdminDashboard.css';
import logoImg from '../assets/logo.png';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        // Enforce Admin Role
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    if (!user || user.role !== 'admin') return null;

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const mockAdminUsers = [
        { id: 'CM100342', name: 'John Doe', membership: 'Diamond', status: 'Verified', joined: '2025-08-10' },
        { id: 'CM100561', name: 'Alina Smith', membership: 'Gold', status: 'Pending', joined: '2025-08-14' },
        { id: 'CM100789', name: 'Robert C.', membership: 'Free', status: 'Pending', joined: '2025-08-15' },
        { id: 'CM100902', name: 'Elena V.', membership: 'Diamond', status: 'Verified', joined: '2025-08-18' },
        { id: 'CM101011', name: 'David Lee', membership: 'Gold', status: 'Verified', joined: '2025-08-20' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <img src={logoImg} alt="WeUnited Logo" className="admin-sidebar-logo" />
                    <h2>WeUnited Admin</h2>
                </div>
                
                <nav className="admin-nav">
                    <button 
                        className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={20} /> Dashboard Overview
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={20} /> User Management
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approvals')}
                    >
                        <CheckSquare size={20} /> Identity Approvals
                    </button>
                    <button 
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <Settings size={20} /> Platform Settings
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-profile-mini">
                        <div className="admin-avatar-mini">A</div>
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
                        <input type="text" placeholder="Search users by name or ID..." />
                    </div>
                    <div className="admin-header-actions">
                        <button className="admin-notification-btn">
                            <span className="notification-dot"></span>
                            Notifications
                        </button>
                    </div>
                </header>

                <div className="admin-content-inner">
                    <h1 className="admin-page-title">
                        {activeTab === 'dashboard' && 'Dashboard Overview'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'approvals' && 'Pending Identity Approvals'}
                        {activeTab === 'settings' && 'Platform Settings'}
                    </h1>

                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stat Cards */}
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                        <Users size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>Total Users</h3>
                                        <p className="stat-number">12,485</p>
                                        <span className="stat-trend positive">↑ 12% this month</span>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                                        <CheckSquare size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>Pending Validations</h3>
                                        <p className="stat-number">142</p>
                                        <span className="stat-trend negative">Needs attention</span>
                                    </div>
                                </div>
                                <div className="admin-stat-card">
                                    <div className="stat-icon" style={{ backgroundColor: '#dcfce3', color: '#16a34a' }}>
                                        <LayoutDashboard size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>Premium Members</h3>
                                        <p className="stat-number">4,210</p>
                                        <span className="stat-trend positive">↑ 5% this month</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Users Table */}
                            <div className="admin-table-container">
                                <div className="admin-table-header">
                                    <h2>Recently Joined Members</h2>
                                    <button className="admin-btn-secondary">View All Users</button>
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Profile ID</th>
                                            <th>Name</th>
                                            <th>Membership</th>
                                            <th>Status</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockAdminUsers.map((u, idx) => (
                                            <tr key={idx}>
                                                <td className="font-medium text-gray-900">{u.id}</td>
                                                <td>{u.name}</td>
                                                <td>
                                                    <span className={`membership-badge ${u.membership.toLowerCase()}`}>
                                                        {u.membership}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${u.status.toLowerCase()}`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="text-gray-500">{u.joined}</td>
                                                <td>
                                                    <div className="admin-action-buttons">
                                                        <button className="action-btn view" title="View Profile">
                                                            <Eye size={16} />
                                                        </button>
                                                        {u.status === 'Pending' && (
                                                            <button className="action-btn verify" title="Approve Identity">
                                                                <UserCheck size={16} />
                                                            </button>
                                                        )}
                                                        <button className="action-btn delete" title="Delete User">
                                                            <Trash2 size={16} />
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

                    {activeTab !== 'dashboard' && (
                        <div className="admin-placeholder-state">
                            <p>This section is conceptually implemented. To view the UI layout, return to the Dashboard Overview.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
