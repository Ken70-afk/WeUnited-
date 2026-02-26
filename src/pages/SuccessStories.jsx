import React from 'react';
import coupleImg from '../assets/success_couple.png';

const SuccessStories = () => {
    return (
        <div className="section-padding container animate-fade-in">
            <h1 className="section-title">Success Stories</h1>
            <p className="about-text" style={{ textAlign: 'center' }}>
                Read heartwarming stories from couples who found each other through WeUnited.
            </p>

            <div className="features-grid" style={{ marginTop: '3rem' }}>
                {[1, 2, 3].map((item) => (
                    <div key={item} className="feature-card animate-fade-in-up" style={{ animationDelay: `${item * 200}ms`, padding: '2rem' }}>
                        <img
                            src={coupleImg}
                            alt="Happy diverse couple"
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                            }}
                        />
                        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                            Couple {item}
                        </h3>
                        <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            "We met on WeUnited and matched perfectly based on our shared cultural background..."
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuccessStories;
