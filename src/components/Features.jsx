import React from 'react';
import { Shield, Handshake, Headphones } from 'lucide-react';
import './Features.css';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Features = () => {
    const [ref, isVisible] = useIntersectionObserver();

    const features = [
        {
            icon: <Shield size={40} className="feature-icon" />,
            title: "100% Verified profiles",
            description: "Verified profiles"
        },
        {
            icon: <Handshake size={40} className="feature-icon" />,
            title: "Personalized Matchmaking",
            description: "Matchmaking"
        },
        {
            icon: <Headphones size={40} className="feature-icon" />,
            title: "Supportive Customer care",
            description: "Customer care"
        }
    ];

    return (
        <section className="features section-padding" ref={ref}>
            <div className={`container ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
                <h2 className="section-title">Why choose us?</h2>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className={`feature-card ${isVisible ? `animate-fade-in delay-${(index + 1) * 200}` : ''}`}
                            key={index}
                            style={{ opacity: isVisible ? 1 : 0 }}
                        >
                            <div className="icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="feature-card-title">{feature.title}</h3>
                            {/* <p className="feature-card-desc">{feature.description}</p> */}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
