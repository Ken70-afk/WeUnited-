import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, CheckCircle, HeartHandshake, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Contact.css';

const AssistedServices = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(false);

        try {
            await addDoc(collection(db, 'assistedMatchmakingRequests'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'pending'
            });
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 5000);
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error submitting assisted services form:", error);
            alert("There was an error sending your request. Please try again or call us directly.");
        }
    };

    return (
        <div className="contact-page animate-fade-in">
            {/* Header Section */}
            <div className="contact-header-section">
                <div className="container">
                    <h1 className="contact-title">Assisted Matchmaking</h1>
                    <p className="contact-subtitle">
                        Get a dedicated Relationship Manager to handpick the best matches for you. Register your interest below and our premium matchmaking team will contact you.
                    </p>
                </div>
            </div>

            <div className="container contact-main">
                <div className="contact-grid">

                    {/* Left Column: Form */}
                    <div className="contact-form-container">
                        <h2 className="form-title">Request a Consultation</h2>
                        <p className="form-desc">Fill out your details to speak with a Relationship Manager.</p>

                        {isSubmitted ? (
                            <div className="success-message">
                                <h3>Thank you!</h3>
                                <p>Your request has been received. A Relationship Manager will be in touch with you shortly.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Any specific requirements?</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="6"
                                        placeholder="Tell us what you are looking for in a partner..."
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-submit">
                                    <Send size={18} /> Request Callback
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Column: Info & Benefits */}
                    <div className="contact-info-container">
                        <div className="info-card">
                            <h3 className="info-title">Why Assisted Services?</h3>
                            <div className="info-items">
                                <div className="info-item">
                                    <div className="icon-box"><HeartHandshake size={24} /></div>
                                    <div>
                                        <p className="info-label">Dedicated Relationship Manager</p>
                                        <span className="info-value">A personal guide to navigate your matchmaking journey.</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-box"><CheckCircle size={24} /></div>
                                    <div>
                                        <p className="info-label">Handpicked Profiles</p>
                                        <span className="info-value">We manually shortlist profiles that match your exact criteria.</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-box"><Phone size={24} /></div>
                                    <div>
                                        <p className="info-label">Meeting Coordination</p>
                                        <span className="info-value">We handle introductions and set up your meetings.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="faq-card">
                            <h3 className="info-title">Direct Contact</h3>
                            <div className="faq-snippet">
                                <p style={{ paddingLeft: 0, color: '#374151', marginBottom: '1rem' }}>
                                    If you want to speak with our premium services team right away, you can reach us at:
                                </p>
                                <h4 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    <Phone size={16} /> +1 (519) 240-9129
                                </h4>
                                <h4 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                    <Mail size={16} /> premium@weunited.com
                                </h4>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div style={{ padding: '0 0 4rem 0' }}></div>
        </div>
    );
};

export default AssistedServices;
