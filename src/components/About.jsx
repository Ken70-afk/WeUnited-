import React from 'react';
import './About.css';
import aboutImage from '../assets/about_img.png';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const About = () => {
    const [ref, isVisible] = useIntersectionObserver();

    return (
        <section className="about section-padding" ref={ref}>
            <div className={`container about-container ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
                <h2 className="section-title">About Us</h2>
                <p className="about-text">
                    We are a Canada-based matrimony platform focused on connecting international
                    individuals looking for love, companionship, and cultural harmony. Whether you're new
                    to Canada or looking for someone who shares your values and background, we're
                    here to help you find your perfect match.
                </p>
                <div className={`about-image-wrapper ${isVisible ? 'animate-fade-in delay-300' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
                    <img
                        src={aboutImage}
                        alt="Traditional wedding ceremony ceremony"
                        className="about-image"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
};

export default About;
