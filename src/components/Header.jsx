import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoImg from '../assets/logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // Prevent scrolling when menu is open
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Profiles', href: '/profiles' },
        { name: 'Success Stories', href: '/stories' },
        { name: 'Membership', href: '/membership' },
    ];

    return (
        <>
            <header className="header">
                <div className="header-container container">
                    <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                            onClick={toggleMenu}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="side-menu-footer">
                    <Link to="/login" className="login-btn" onClick={toggleMenu}>Log In</Link>
                    <Link to="/register" className="register-btn" onClick={toggleMenu}>Create Account</Link>
                </div>
            </div>
        </>
    );
};

export default Header;
