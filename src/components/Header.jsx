import React, { useState } from 'react';
import { Menu, X, Home, LayoutDashboard, Users, Heart, Award, Star, Eye, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import logoImg from '../assets/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const handleLogout = () => {
        logout();
        toggleMenu();
        navigate('/');
    };

    const navLinks = user ? [
        { name: 'Home', href: '/', icon: <Home size={20} /> },
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Profiles', href: '/profiles', icon: <Users size={20} /> },
        { name: 'Matches', href: '/matches', icon: <Heart size={20} /> },
        { name: 'Notifications', href: '/notifications', icon: <Award size={20} /> },
        { name: 'Shortlists', href: '/shortlists', icon: <Star size={20} /> },
        { name: 'Profile Visitors', href: '/visitors', icon: <Eye size={20} /> },
        { name: 'Assisted Matchmaking', href: '/assisted-services', icon: <Sparkles size={20} /> },
        { name: 'Success Stories', href: '/stories', icon: <Heart size={20} /> },
        { name: 'Membership', href: '/membership', icon: <Award size={20} /> },
    ] : [
        { name: 'Home', href: '/', icon: <Home size={20} /> },
        { name: 'Success Stories', href: '/stories', icon: <Heart size={20} /> },
        { name: 'Membership', href: '/membership', icon: <Award size={20} /> },
    ];

    return (
        <>
            <header className="header">
                <div className="header-container container">
                    <Link to={user ? '/dashboard' : '/'} className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={logoImg} alt="WeUnited Logo" style={{ height: '80px', width: '80px', objectFit: 'contain', mixBlendMode: 'multiply', transform: 'scale(1.4)' }} />
                        WEUNITED
                    </Link>

                    <button className="menu-btn" onClick={toggleMenu} aria-label="Open menu">
                        <Menu size={32} color="var(--primary)" />
                    </button>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={`menu-overlay ${isMenuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
            ></div>

            {/* Side Menu */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="side-menu-header" style={{ justifyContent: 'flex-end' }}>
                    <button className="close-btn" onClick={toggleMenu} aria-label="Close menu">
                        <X size={32} color="var(--text-dark)" />
                    </button>
                </div>

                <nav className="side-nav">
                    {navLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.href}
                            className="side-nav-link"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            onClick={toggleMenu}
                        >
                            {link.icon} {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="header-actions">
                    {user ? (
                        <div className="user-nav-box">
                            <Link to="/profile" className="user-profile-link" onClick={toggleMenu}>
                                <div className="user-avatar-mini">
                                    {(user.avatarPhoto || (user.photos && user.photos.length > 0)) ? (
                                        <img src={user.avatarPhoto || user.photos[0]} alt="Avatar" />
                                    ) : (
                                        <div className="avatar-letter">{(user.firstName || 'U').charAt(0)}</div>
                                    )}
                                </div>
                                <span className="user-name-mini">{user.firstName || 'My Profile'}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn-logout-mini"
                                title="Log Out"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login" onClick={toggleMenu}>Log In</Link>
                            <Link to="/register" className="btn-register" onClick={toggleMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;
