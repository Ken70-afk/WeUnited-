import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <p className="footer-tagline">Contact us</p>
                <h2 className="footer-title">We'd love to hear from you!</h2>
                <p className="footer-subtitle">Our friendly team is always here to chat.</p>

                <div className="contact-grid">
                    <div className="contact-item">
                        <div className="contact-icon-wrapper">
                            <Mail size={32} />
                        </div>
                        <h3 className="contact-title">Email</h3>
                        <p className="contact-desc">Our friendly team is here to help</p>
                        <a href="mailto:weunitedmatrimony@gmail.com" className="contact-link">weunitedmatrimony@gmail.com</a>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon-wrapper">
                            <MapPin size={32} />
                        </div>
                        <h3 className="contact-title">Office</h3>
                        <p className="contact-desc">Come say hello at our office</p>
                        <a
                            href="https://www.google.com/maps/search/?api=1&query=12+Market+Square,+Cambridge,+ON,+Canada"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-link"
                            style={{ textAlign: 'center', display: 'block' }}
                        >
                            12 Market Square, Cambridge, ON,<br />Canada
                        </a>
                    </div>

                    <div className="contact-item">
                        <div className="contact-icon-wrapper">
                            <Phone size={32} />
                        </div>
                        <h3 className="contact-title">Phone</h3>
                        <p className="contact-desc">Mon-Fri 8am to 5pm</p>
                        <a href="tel:+15192409129" className="contact-link">+1 (519) 240-9129</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
