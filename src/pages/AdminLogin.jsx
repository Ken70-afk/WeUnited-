import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';
import logoImg from '../assets/logo.png';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, try standard Firebase Login
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            
            // Verify if user is actually admin
            const profileSnap = await getDoc(doc(db, 'profiles', userCred.user.uid));
            if (profileSnap.exists() && profileSnap.data().role === 'admin') {
                navigate('/admin');
            } else if (email === 'admin@weunited.com') {
                // If it's the designated mock admin but the role isn't set, fix it:
                await setDoc(doc(db, 'profiles', userCred.user.uid), { role: 'admin', firstName: 'System', lastName: 'Administrator' }, { merge: true });
                navigate('/admin');
            } else {
                auth.signOut();
                setError('Unauthorized: You do not have admin access.');
            }

        } catch (err) {
            // If the designated mock admin doesn't exist, create it:
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' && email === 'admin@weunited.com') {
                try {
                    const newAdmin = await createUserWithEmailAndPassword(auth, email, password);
                    await setDoc(doc(db, 'profiles', newAdmin.user.uid), {
                        firstName: 'System',
                        lastName: 'Administrator',
                        email: 'admin@weunited.com',
                        role: 'admin',
                        createdAt: new Date(),
                    });
                    navigate('/admin');
                } catch (creationErr) {
                    console.error('Failed to create admin:', creationErr);
                    setError('Invalid credentials or creation failed.');
                }
            } else {
                setError('Invalid administrator credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-header">
                    <img src={logoImg} alt="WeUnited Logo" className="admin-logo" />
                    <h2>Admin Portal</h2>
                    <p>Secure System Access</p>
                </div>

                {error && <div className="admin-error-message">{error}</div>}

                <form className="admin-login-form" onSubmit={handleLogin}>
                    <div className="admin-form-group">
                        <label>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@weunited.com"
                            required
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Admin Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="admin-auth-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Authorize Access'}
                    </button>
                    
                    <div className="admin-back-link">
                        <button type="button" onClick={() => navigate('/')}>Return to Main Site</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
