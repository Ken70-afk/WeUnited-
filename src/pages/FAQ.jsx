import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [activeIndex, setActiveIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqCategories = [
        {
            category: "Getting Started",
            items: [
                {
                    q: "How do I create a profile on WeUnited?",
                    a: "Creating a profile is easy and free! Simply click on the 'Register' button on our homepage, fill out your basic details, verify your phone number or email, and you're ready to start building your profile."
                },
                {
                    q: "What documents are required for verification?",
                    a: "To ensure a safe community, we recommend verifying your profile with a government-issued ID (Passport, Driver's License, or National ID). Verified profiles get a trust badge and 10x more visibility."
                },
                {
                    q: "Is WeUnited totally free?",
                    a: "We offer a Free basic tier that lets you create a profile, browse matches, and view primary photos. However, connecting with potential matches via phone numbers or priority placement requires upgrading to a Premium membership."
                }
            ]
        },
        {
            category: "Privacy & Security",
            items: [
                {
                    q: "Who can see my photos?",
                    a: "By default, registered members can see your primary photo. However, you can use our privacy settings to restrict photo access only to members you've explicitly accepted requests from."
                },
                {
                    q: "Is my personal data safe?",
                    a: "Absolutely. We employ bank-level encryption (SSL) and stringent data protection policies. Your personal information is never sold to third-party data brokers."
                },
                {
                    q: "How do I report a suspicious profile?",
                    a: "If you notice anything suspicious or inappropriate, please use the 'Report User' button on their profile. Our trust and safety team will investigate the issue within 24 hours."
                }
            ]
        },
        {
            category: "Membership & Billing",
            items: [
                {
                    q: "What payment methods do you accept?",
                    a: "We accept all major Credit/Debit Cards (Visa, MasterCard, Amex), PayPal, and Google Pay/Apple Pay where available."
                },
                {
                    q: "Can I cancel my premium subscription?",
                    a: "Yes, you can cancel your auto-renewal at any time from your Account Settings. Your premium benefits will continue until the end of your current billing cycle."
                },
                {
                    q: "Do you offer refunds?",
                    a: "Refunds are generally not provided for used periods of subscription. However, if you experience a technical failure preventing you from using our service, please contact our support team to request a review."
                }
            ]
        }
    ];

    // Filter logic
    const filteredCategories = faqCategories.map(cat => {
        const filteredItems = cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...cat, items: filteredItems };
    }).filter(cat => cat.items.length > 0);

    return (
        <div className="faq-page animate-fade-in">
            {/* Header Section */}
            <div className="faq-header-section">
                <div className="container">
                    <h1 className="faq-title">Frequently Asked Questions</h1>
                    <p className="faq-subtitle">
                        Everything you need to know about using WeUnited. Can't find the answer you're looking for? <Link to="/contact">Contact us</Link>.
                    </p>

                    <div className="faq-search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            className="faq-search-input"
                            placeholder="Type keywords to find answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container faq-main">
                {filteredCategories.length > 0 ? (
                    <div className="faq-content">
                        {filteredCategories.map((category, catIndex) => (
                            <div key={catIndex} className="faq-category-block">
                                <h2 className="faq-category-title">{category.category}</h2>
                                <div className="faq-list">
                                    {category.items.map((item, itemIndex) => {
                                        // Create a unique global index so active state toggles correctly across categories
                                        const globalIndex = `${catIndex}-${itemIndex}`;
                                        const isActive = activeIndex === globalIndex;

                                        return (
                                            <div
                                                key={itemIndex}
                                                className={`faq-item ${isActive ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="faq-question"
                                                    onClick={() => toggleAccordion(globalIndex)}
                                                    aria-expanded={isActive}
                                                >
                                                    <span className="q-text">
                                                        <HelpCircle size={18} className="q-icon" />
                                                        {item.q}
                                                    </span>
                                                    <ChevronDown
                                                        size={20}
                                                        className={`chevron ${isActive ? 'rotated' : ''}`}
                                                    />
                                                </button>
                                                <div
                                                    className="faq-answer-wrapper"
                                                    style={{ maxHeight: isActive ? '500px' : '0' }}
                                                >
                                                    <div className="faq-answer">
                                                        <p>{item.a}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-faq-results">
                        <h3>No matching questions found</h3>
                        <p>Try adjusting your search terms, or feel free to reach out to our team directly.</p>
                        <Link to="/contact" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Contact Support</Link>
                    </div>
                )}
            </div>
            <div style={{ padding: '0 0 4rem 0' }}></div>
        </div>
    );
};

export default FAQ;
