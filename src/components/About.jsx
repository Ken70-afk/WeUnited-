import React from 'react';
import './About.css';
import aboutImage from '../assets/about_img.png';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const About = () => {
    const [ref, isVisible] = useIntersectionObserver();

    return (
        <section className="about" ref={ref}>
            <div className={`about-container ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
                <div className="about-grid">

                    {/* Image Area */}
                    <div className={`about-image-wrapper ${isVisible ? 'animate-fade-in delay-200' : ''}`}>
                        <img
                            src={aboutImage}
                            alt="Happy Couple"
                            className="about-image"
                            loading="lazy"
                        />
                    </div>

                    {/* Content Area */}
                    <div className="about-content">
                        <span className="about-subtitle">Welcome to WeUnited</span>
                        <h2 className="about-title">Connecting Hearts Across Borders</h2>

                        <p className="about-text">
                            We are a premier matrimony platform dedicated to connecting international
                            individuals looking for love, companionship, and cultural harmony. Whether you're newly
                            relocated, living abroad, or simply searching for someone who shares your deep-rooted values and background, we're
                            here to help you find your perfect match.
                        </p>

                        <p className="about-text">
                            Our advanced matching algorithms and strict verification processes ensure that your journey to finding a lifetime partner is not just successful, but deeply secure and trustworthy.
                        </p>

                        <div className="about-stats">
                            <div className="stat-item">
                                <span className="stat-number">10k+</span>
                                <span className="stat-label">Verified Profiles</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Communities Served</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
