import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile = null;
        let handleBeforeUnload = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (unsubscribeProfile) unsubscribeProfile();
            if (handleBeforeUnload) {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                handleBeforeUnload = null;
            }

            if (firebaseUser) {
                const profileRef = doc(db, 'profiles', firebaseUser.uid);
                
                // Track backend presence immediately and record last login
                updateDoc(profileRef, { 
                    isOnline: true, 
                    lastLogin: serverTimestamp() 
                }).catch(err => console.log('Failed to update presence', err));

                // Attempt to toggle offline if tab closes
                handleBeforeUnload = () => {
                    updateDoc(profileRef, { isOnline: false }).catch(() => {});
                };
                window.addEventListener('beforeunload', handleBeforeUnload);

                // Listen to profile data in real-time
                const { onSnapshot } = await import('firebase/firestore');
                
                unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser({ 
                            uid: firebaseUser.uid, 
                            email: firebaseUser.email, 
                            ...docSnap.data() 
                        });
                    } else {
                        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to profile:", error);
                    setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                    setLoading(false);
                });
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
            if (handleBeforeUnload) window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const logout = async () => {
        try {
            if (auth.currentUser) {
                const profileRef = doc(db, 'profiles', auth.currentUser.uid);
                // Switch off presence before closing out the auth session
                await updateDoc(profileRef, { isOnline: false }).catch(() => {});
            }
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
