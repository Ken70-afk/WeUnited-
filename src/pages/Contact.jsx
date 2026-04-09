import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, Clock, HelpCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Contact.css';

const Contact = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
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
            await addDoc(collection(db, 'contactMessages'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new'
            });
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 5000);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error("Error submitting contact form:", error);
            alert("There was an error sending your message. Please try again or email us directly.");
        }
    };

    return (
        <div className="contact-page animate-fade-in">
            {/* Header Section */}
            <div className="contact-header-section">
                <div className="container">
                    <h1 className="contact-title">Get in Touch</h1>
                    <p className="contact-subtitle">
                        Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>
            </div>

            <div className="container contact-main">
                <div className="contact-grid">

                    {/* Left Column: Contact Form */}
                    <div className="contact-form-container">
                        <h2 className="form-title">Send us a Message</h2>
                        <p className="form-desc">Fill out the form below and we'll get back to you within 24 hours.</p>

                        {isSubmitted ? (
                            <div className="success-message">
                                <h3>Thank you!</h3>
                                <p>Your message has been successfully sent. We will be in touch shortly.</p>
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
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select a topic</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Technical Support">Technical Support</option>
                                        <option value="Billing Question">Billing Question</option>
                                        <option value="Feedback">Feedback / Suggestion</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-submit">
                                    <Send size={18} /> Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Column: Info & FAQs */}
                    <div className="contact-info-container">
                        <div className="info-card">
                            <h3 className="info-title">Contact Information</h3>
                            <div className="info-items">
                                <div className="info-item">
                                    <div className="icon-box"><Phone size={24} /></div>
                                    <div>
                                        <p className="info-label">Phone Support</p>
                                        <a href="tel:+15192409129" className="info-value">+1 (519) 240-9129</a>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-box"><Mail size={24} /></div>
                                    <div>
                                        <p className="info-label">Email Support</p>
                                        <a href="mailto:support@weunited.com" className="info-value">support@weunited.com</a>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-box"><MapPin size={24} /></div>
                                    <div>
                                        <p className="info-label">Headquarters</p>
                                        <a href="https://www.google.com/maps/search/?api=1&query=12+Market+Square,+Cambridge,+ON,+Canada" target="_blank" rel="noopener noreferrer" className="info-value" style={{ display: 'block' }}>12 Market Square<br />Cambridge, ON N3C 2R7<br />Canada</a>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon-box"><Clock size={24} /></div>
                                    <div>
                                        <p className="info-label">Business Hours</p>
                                        <p className="info-value">Mon - Fri: 8:00 AM - 6:00 PM EST<br />Sat - Sun: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mini FAQ */}
                        <div className="faq-card">
                            <h3 className="info-title">Quick Answers</h3>
                            <div className="faq-snippet">
                                <h4><HelpCircle size={16} className="text-primary" /> How do I delete my profile?</h4>
                                <p>You can deactivate or delete your account anytime from your Profile Settings page.</p>
                            </div>
                            <div className="faq-snippet">
                                <h4><HelpCircle size={16} className="text-primary" /> How long does verification take?</h4>
                                <p>Our team manually reviews ID documents within 24-48 hours of submission.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div style={{ padding: '0 0 4rem 0' }}></div>
        </div>
    );
};

export default Contact;
