import React from 'react';

const Login = () => {
    return (
        <div className="section-padding container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh', alignItems: 'center' }}>
            <div className="feature-card animate-fade-in-up" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
                <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p className="about-text" style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-body)' }}>Log in to continue your journey.</p>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={e => e.preventDefault()}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Forgot Password?</a>
                        </div>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--bg-subtle)', fontFamily: 'inherit' }}
                        />
                    </div>

                    <button className="hero-submit" style={{ width: '100%', marginTop: '1rem' }}>Log In</button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-body)' }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
