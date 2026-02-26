import React from 'react';

const Register = () => {
    return (
        <div className="section-padding container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center' }}>
            <div className="feature-card animate-fade-in-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h1>
                <p className="about-text" style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>Start your journey to finding the perfect match.</p>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', flex: 1 }}>
                            <label htmlFor="firstName" style={{ fontSize: '0.875rem', fontWeight: '500' }}>First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-subtle)', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', flex: 1 }}>
                            <label htmlFor="lastName" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-subtle)', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-subtle)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                        <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-subtle)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <button className="hero-submit" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-body)' }}>
                    Already have an account? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Log in</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
