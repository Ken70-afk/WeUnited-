import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-grid">

                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <Link to="/" className="footer-brand">
                            <span className="brand-highlight">We</span>United
                        </Link>
                        <p className="footer-brand-desc">
                            Connecting hearts across borders. Your trusted premium matrimony platform designed for modern individuals rooting for traditional values.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className="social-icon" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" className="social-icon" aria-label="Youtube"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/profiles">Browse Matches</Link></li>
                            <li><Link to="/stories">Success Stories</Link></li>
                            <li><Link to="/membership">Membership Plans</Link></li>
                        </ul>
                    </div>

                    {/* Support Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Support & Legal</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Get in Touch</h4>
                        <ul className="footer-contact-info">
                            <li>
                                <Mail size={16} className="fc-icon" />
                                <a href="mailto:support@weunited.example.com">help@weunited.com</a>
                            </li>
                            <li>
                                <Phone size={16} className="fc-icon" />
                                <a href="tel:+15192409129">+1 (519) 240-9129</a>
                            </li>
                            <li>
                                <MapPin size={16} className="fc-icon" />
                                <a href="https://www.google.com/maps/search/?api=1&query=12+Market+Square,+Cambridge,+ON,+Canada" target="_blank" rel="noopener noreferrer">12 Market Square, Cambridge, ON, Canada</a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} WeUnited Matrimony. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
