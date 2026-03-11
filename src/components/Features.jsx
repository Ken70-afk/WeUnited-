import React from 'react';
import { Shield, HeartHandshake, Headphones, Search, UserCheck, Lock } from 'lucide-react';
import './Features.css';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Features = () => {
    const [ref, isVisible] = useIntersectionObserver();

    const features = [
        {
            icon: <Shield size={36} className="feature-icon" />,
            title: "100% Verified Profiles",
            description: "Every profile goes through a manual screening process to ensure authenticity and maintain community trust."
        },
        {
            icon: <HeartHandshake size={36} className="feature-icon" />,
            title: "Smart Matchmaking",
            description: "Our algorithm connects you with individuals who truly share your values, background, and life goals."
        },
        {
            icon: <Lock size={36} className="feature-icon" />,
            title: "Absolute Privacy",
            description: "Your data is secured with bank-level encryption. You control who sees your photos and contact information."
        },
        {
            icon: <Search size={36} className="feature-icon" />,
            title: "Advanced Search",
            description: "Filter matches by specific communities, professions, education levels, and locations worldwide."
        },
        {
            icon: <UserCheck size={36} className="feature-icon" />,
            title: "Premium Memberships",
            description: "Upgrade your visibility and get exclusive access to verified contact numbers and priority placements."
        },
        {
            icon: <Headphones size={36} className="feature-icon" />,
            title: "24/7 Priority Support",
            description: "Our dedicated relationship advisors and support team are always here to assist you on your journey."
        }
    ];

    return (
        <section className="features section-padding" ref={ref}>
            <div className={`container ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
                <div className="features-header">
                    <span className="features-subtitle">Our Promise</span>
                    <h2 className="section-title">Why Choose WeUnited?</h2>
                    <p className="features-desc">We combine modern technology with traditional values to provide the safest, most effective matchmaking experience.</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className={`feature-card ${isVisible ? `animate-fade-in delay-${(index % 3 + 1) * 100}` : ''}`}
                            key={index}
                            style={{ opacity: isVisible ? 1 : 0 }}
                        >
                            <div className="icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="feature-card-title">{feature.title}</h3>
                            <p className="feature-card-desc">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
