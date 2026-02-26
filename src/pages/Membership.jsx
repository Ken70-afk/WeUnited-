import React from 'react';

const Membership = () => {
    return (
        <div className="section-padding container animate-fade-in" style={{ textAlign: 'center' }}>
            <h1 className="section-title">Membership Plans</h1>
            <p className="about-text" style={{ margin: '0 auto 3rem' }}>
                Choose the plan that's right for your journey to finding love.
            </p>

            <div className="features-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Basic Plan */}
                <div className="feature-card animate-fade-in-up" style={{ border: '1px solid var(--bg-subtle)' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>1 Month Plan</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
                        $29<span style={{ fontSize: '1rem', color: 'var(--text-body)', fontWeight: 'normal' }}>/mo</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem' }}>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ Unlimited messaging</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ Advanced search filters</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ View full profiles</li>
                    </ul>
                    <button className="hero-submit" style={{ width: '100%', padding: '0.75rem' }}>Choose Plan</button>
                </div>

                {/* Premium Plan */}
                <div className="feature-card animate-fade-in-up delay-200" style={{ border: '2px solid var(--primary)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Most Popular
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>2 Month Plan</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
                        $49<span style={{ fontSize: '1rem', color: 'var(--text-body)', fontWeight: 'normal' }}>/total</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem' }}>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ Everything in 1 Month</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ Priority profile placement</li>
                        <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--bg-subtle)' }}>✓ Read receipts for messages</li>
                    </ul>
                    <button className="hero-submit" style={{ width: '100%', padding: '0.75rem' }}>Choose Plan</button>
                </div>

            </div>
        </div>
    );
};

export default Membership;
