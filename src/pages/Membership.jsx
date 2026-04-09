import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, HelpCircle, Loader2, MapPin } from 'lucide-react';
import { auth } from '../firebase';
import './Membership.css';

// Regional pricing config
const REGION_PRICING = {
    CA: { label: '🇨🇦 Canada',    currency: 'CAD', symbol: '$',  plan2mo: 79,  plan3mo: 99  },
    US: { label: '🇺🇸 USA',       currency: 'USD', symbol: '$',  plan2mo: 39,  plan3mo: 75  },
    AU: { label: '🇦🇺 Australia', currency: 'AUD', symbol: '$',  plan2mo: 49,  plan3mo: 99  },
    EU: { label: '🇪🇺 Europe',    currency: 'EUR', symbol: '€',  plan2mo: 29,  plan3mo: 59  },
};

// Countries considered part of Europe for region detection
const EU_COUNTRIES = new Set([
    'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU',
    'IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK',
    'NO','CH','IS','GB','AL','BA','ME','MK','RS','TR','UA','BY','MD',
]);

const detectRegion = (countryCode) => {
    if (!countryCode) return 'CA';
    if (countryCode === 'CA') return 'CA';
    if (countryCode === 'US') return 'US';
    if (countryCode === 'AU') return 'AU';
    if (EU_COUNTRIES.has(countryCode)) return 'EU';
    return 'CA'; // default fallback
};

const Membership = () => {
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [region, setRegion] = useState('CA');
    const [detecting, setDetecting] = useState(true);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
                setRegion(detectRegion(data.country_code));
            })
            .catch(() => {
                setRegion('CA');
            })
            .finally(() => setDetecting(false));
    }, []);

    const pricing = REGION_PRICING[region] || REGION_PRICING['CA'];

    const features = [
        { name: "Create Profile", free: true, basic: true, premium: true },
        { name: "Browse Matches", free: true, basic: true, premium: true },
        { name: "Access Limited Profiles", free: false, basic: true, premium: false },
        { name: "Access Unlimited Profiles", free: false, basic: false, premium: true },
        { name: "Advanced Search Filters", free: false, basic: true, premium: true },
        { name: "Enhanced Trust Badge", free: false, basic: false, premium: true },
        { name: "Customer Support", free: false, basic: true, premium: true },
    ];

    const handleCheckout = async (planType) => {
        const user = auth.currentUser;
        if (!user) {
            navigate('/login');
            return;
        }

        setLoadingPlan(planType);

        const PRICE_IDS = {
            premium: {
                CA: import.meta.env.VITE_STRIPE_PREMIUM_CA,
                US: import.meta.env.VITE_STRIPE_PREMIUM_US,
                AU: import.meta.env.VITE_STRIPE_PREMIUM_AU,
                EU: import.meta.env.VITE_STRIPE_PREMIUM_EU,
            },
            basic: {
                CA: import.meta.env.VITE_STRIPE_BASIC_CA,
                US: import.meta.env.VITE_STRIPE_BASIC_US,
                AU: import.meta.env.VITE_STRIPE_BASIC_AU,
                EU: import.meta.env.VITE_STRIPE_BASIC_EU,
            }
        };

        // Get the Price ID based on plan and region
        const priceId = PRICE_IDS[planType]?.[region] || PRICE_IDS[planType]?.['CA'];

        if (!priceId) {
            console.error(`Missing Price ID for ${planType} plan.`);
            alert("Payment configuration error. Please contact support.");
            setLoadingPlan(null);
            return;
        }

        try {
            const response = await fetch('http://localhost:4242/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: user.uid,
                    region, 
                    currency: pricing.currency,
                    planType: planType
                }),
            });

            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                console.error("No checkout URL returned", data);
                alert("Could not initiate checkout. Please try again.");
                setLoadingPlan(null);
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Server connection failed. Is the backend running?");
            setLoadingPlan(null);
        }
    };

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

                    {/* Region indicator (auto-detected, read-only) */}
                    <div className="region-selector">
                        <MapPin size={16} />
                        {detecting ? (
                            <span className="region-detecting">Detecting your region…</span>
                        ) : (
                            <span className="region-label">{pricing.label} — Prices in {pricing.currency}</span>
                        )}
                    </div>
                </div>

                <div className="pricing-grid">
                    {/* Free Tier */}
                    <div className="pricing-card">
                        <h3 className="plan-name">Free</h3>
                        <div className="plan-price">
                            <span className="price-currency">$</span>0<span className="price-period">/forever</span>
                        </div>
                        <p className="plan-desc">For exploring the platform and seeing who is out there.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Browse Matches</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Create Profile</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Access Profiles</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Advanced Filters</span></li>
                        </ul>

                        <Link to="/register" className="btn-select-plan outline">Register Free</Link>
                    </div>

                    {/* 3-Month / Premium Tier */}
                    <div className="pricing-card popular">
                        <div className="popular-badge">Best Value</div>
                        <h3 className="plan-name">Premium</h3>
                        <div className="plan-price">
                            {detecting ? (
                                <span className="price-loading"><Loader2 size={20} className="spinner" /></span>
                            ) : (
                                <>
                                    <span className="price-currency">{pricing.symbol}</span>
                                    {pricing.plan3mo}
                                    <span className="price-period">/3 months</span>
                                    <span className="price-currency-label">{pricing.currency}</span>
                                </>
                            )}
                        </div>
                        <p className="plan-desc">Access to unlimited Profiles, Customer Support.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Access Unlimited Profiles</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Enhanced Trust Badge</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Advanced Filters</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Customer Support</span></li>
                        </ul>

                        <button 
                            onClick={() => handleCheckout('premium')} 
                            className="btn-select-plan fill"
                            disabled={loadingPlan === 'premium'}
                        >
                            {loadingPlan === 'premium' ? <><Loader2 className="spinner" size={18} /> Processing...</> : "Get Premium"}
                        </button>
                    </div>

                    {/* 2-Month / Basic Tier */}
                    <div className="pricing-card">
                        <h3 className="plan-name">Basic</h3>
                        <div className="plan-price">
                            {detecting ? (
                                <span className="price-loading"><Loader2 size={20} className="spinner" /></span>
                            ) : (
                                <>
                                    <span className="price-currency">{pricing.symbol}</span>
                                    {pricing.plan2mo}
                                    <span className="price-period">/2 months</span>
                                    <span className="price-currency-label">{pricing.currency}</span>
                                </>
                            )}
                        </div>
                        <p className="plan-desc">Access to limited Profiles, Customer Support.</p>

                        <ul className="plan-features">
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Access Limited Profiles</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Advanced Filters</span></li>
                            <li><Check size={20} className="feature-check" /> <span className="feature-text">Customer Support</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Unlimited Profiles</span></li>
                            <li><X size={20} className="feature-cross" /> <span className="feature-text disabled">Trust Badge</span></li>
                        </ul>

                        <button 
                            onClick={() => handleCheckout('basic')} 
                            className="btn-select-plan outline"
                            disabled={loadingPlan === 'basic'}
                        >
                            {loadingPlan === 'basic' ? <><Loader2 className="spinner" size={18} /> Processing...</> : "Get Basic"}
                        </button>
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
                                <th>Basic ({pricing.symbol}{pricing.plan2mo} {pricing.currency})</th>
                                <th className="popular-col">Premium ({pricing.symbol}{pricing.plan3mo} {pricing.currency})</th>
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
