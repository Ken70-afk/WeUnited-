import React from 'react';
import './Hero.css';
import heroBg from '../assets/hero_bg.png';

const Hero = () => {
    return (
        <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content container">
                <h1 className="hero-title animate-fade-in-up">Find your perfect match</h1>
                <p className="hero-subtitle animate-fade-in-up delay-200">
                    A trusted platform connecting international singles and families for meaningful, long-lasting relationships.
                </p>

                <form className="hero-form animate-fade-in-up delay-400" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="I am looking for"
                            className="hero-input"
                            aria-label="I am looking for"
                        />
                    </div>
                    <button type="submit" className="hero-submit">
                        Continue
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Hero;
