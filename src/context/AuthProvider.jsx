import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, setSession, signOut } from '../services/authService';
import { getProfile } from '../services/profileService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {

                const savedSession = localStorage.getItem('moneyhey_session');

                if (savedSession) {
                    const session = JSON.parse(savedSession);
                    const isExpired = session.expires_at * 1000 < Date.now();

                    if (!isExpired) {
                        await setSession(session);
                    } else {
                        localStorage.removeItem('moneyhey_session');
                    }
                }


                const { data: authData } = await getUser();

                if (!authData?.user) {
                    setIsLoggedIn(false);
                    setUser(null);
                    return;
                }


                const profile = await getProfile(authData.user.id);

                setUser({
                    user_id: authData.user.id,
                    name: profile?.full_name || 'User',
                    email: profile?.email || '',
                    avatar: profile?.avatar_img || null,
                });

                setIsLoggedIn(true);

            } catch (err) {
                console.error('Auth error:', err);
                setIsLoggedIn(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async () => {
        const { data: authData } = await getUser();

        if (authData?.user) {
            const profile = await getProfile(authData.user.id);

            setUser({
                user_id: authData.user.id,
                name: profile?.full_name || 'User',
                email: profile?.email || '',
                avatar: profile?.avatar_img || null,
            });

            setIsLoggedIn(true);
        }
    };

    const logout = async () => {
        localStorage.removeItem('moneyhey_session');
        await signOut();
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            setIsLoggedIn,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};