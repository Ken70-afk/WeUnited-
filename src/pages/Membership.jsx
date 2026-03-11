import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle } from 'lucide-react';
import './Membership.css';

const Membership = () => {
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        { name: "Create Profile & Browse Matches", free: true, basic: true, premium: true },
        { name: "View Primary Photos", free: true, basic: true, premium: true },
        { name: "View 50 Verified Phone Numbers", free: false, basic: true, premium: true },
        { name: "View 150 Verified Phone Numbers", free: false, basic: false, premium: true },
        { name: "Advanced Search Filters", free: false, basic: true, premium: true },
        { name: "Standard Profile Placement", free: false, basic: true, premium: false },
        { name: "Priority Profile Placement", free: false, basic: false, premium: true },
        { name: "Enhanced Trust Badge", free: false, basic: false, premium: true },
        { name: "Dedicated Relationship Advisor", free: false, basic: false, premium: true }
    ];

    const faqs = [
        {
            q: "What payment methods do you accept?",
            a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and secure bank transfers depending on your region."
        },
        {
            q: "Can I upgrade my plan later?",
            a: "Absolutely! You can upgrade from Basic to Premium at any time. The remaining value of your current plan will be prorated towards your new membership."
        },
        {
            q: "Is my payment information secure?",
            a: "Yes, we use industry-standard 256-bit encryption for all transactions. We never store your full credit card details on our servers."
        },
        {
            q: "How does the 'Verified Phone Numbers' feature work?",
            a: "When you purchase a membership, you receive a quota of phone numbers you can unlock. This ensures privacy while allowing serious members to connect directly."
        }
    ];

    return (
        <div className="membership-page animate-fade-in">
            <div className="membership-container">

                <div className="membership-header">
                    <h1 className="membership-title">Find Your Perfect Match Today</h1>
                    <p className="membership-subtitle">
                        Choose the membership plan that fits your journey. Upgrade to unlock premium features and increase your chances of finding the one.
                    </p>
                </div>

                <div className="pricing-grid">
                    {/* Free/Basic Tier */}
                    <div className="pricing-card">
                        <h3 className="plan-name">Free</h3>
                        <div className="plan-price">
                            <span className="price-currency">$</span>0<span className="price-period">/forever</span>
                        </div>
                        <p className="plan-desc">For exploring the platform and seeing who is out there.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Create Profile</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Browse Matches</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">View Primary Photos</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">View Phone Numbers</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Advanced Filters</span></li>
                        </ul>

                        <Link to="/register" className="btn-select-plan outline">Register Free</Link>
                    </div>

                    {/* Premium / Most Popular Tier */}
                    <div className="pricing-card popular">
                        <div className="popular-badge">Most Popular</div>
                        <h3 className="plan-name">Premium</h3>
                        <div className="plan-price">
                            <span className="price-currency">$</span>49<span className="price-period">/2 months</span>
                        </div>
                        <p className="plan-desc">Maximize your reach with priority placement and full access.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Access 150 Phone Numbers</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Priority Search Placement</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Enhanced Trust Badge</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Relationship Advisor</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Advanced Filters</span></li>
                        </ul>

                        <Link to="/payment-success" className="btn-select-plan fill">Get Premium</Link>
                    </div>

                    {/* Standard Tier */}
                    <div className="pricing-card">
                        <h3 className="plan-name">Basic</h3>
                        <div className="plan-price">
                            <span className="price-currency">$</span>29<span className="price-period">/1 month</span>
                        </div>
                        <p className="plan-desc">Great for getting started with connecting to potential matches.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Access 50 Phone Numbers</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Standard Placement</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Advanced Filters</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Trust Badge</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Priority Placement</span></li>
                        </ul>

                        <Link to="/payment-success" className="btn-select-plan outline">Get Basic</Link>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="comparison-section">
                    <h2 className="comparison-title">Compare Plan Features</h2>
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Free</th>
                                <th>Basic ($29)</th>
                                <th className="popular-col">Premium ($49)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, idx) => (
                                <tr key={idx}>
                                    <td>{feature.name}</td>
                                    <td>
                                        {feature.free ? <Check size={24} className="feature-check" style={{ margin: '0 auto' }} /> : <X size={24} className="feature-cross" style={{ margin: '0 auto' }} />}
                                    </td>
                                    <td>
                                        {feature.basic ? <Check size={24} className="feature-check" style={{ margin: '0 auto' }} /> : <X size={24} className="feature-cross" style={{ margin: '0 auto' }} />}
                                    </td>
                                    <td className="popular-col">
                                        {feature.premium ? <Check size={24} className="feature-check" style={{ margin: '0 auto' }} /> : <X size={24} className="feature-cross" style={{ margin: '0 auto' }} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <h2 className="faq-title">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item">
                                <h3 className="faq-question">
                                    <HelpCircle size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    {faq.q}
                                </h3>
                                <p className="faq-answer">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Membership;
