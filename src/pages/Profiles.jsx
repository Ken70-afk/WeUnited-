import React from 'react';
import avatarImg from '../assets/profile_avatar.png';

const Profiles = () => {
    return (
        <div className="section-padding container animate-fade-in">
            <h1 className="section-title">Browse Profiles</h1>
            <p className="about-text" style={{ textAlign: 'center' }}>
                Discover potential matches from around the world. (Profiles coming soon)
            </p>

            <div className="features-grid" style={{ marginTop: '2rem' }}>
                {/* Placeholder Profiles Grid */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="feature-card animate-fade-in-up" style={{ animationDelay: `${item * 100}ms`, padding: '2rem' }}>
                        <img
                            src={avatarImg}
                            alt={`Profile avatar ${item}`}
                            style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                marginBottom: '1rem',
                                border: '4px solid var(--bg-subtle)'
                            }}
                        />
                        <h3 className="feature-card-title">User {item}</h3>
                        <p style={{ color: 'var(--text-body)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Age • Location</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profiles;
