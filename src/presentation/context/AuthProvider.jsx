import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, signOut } from '../../application/services/authService';
import { getProfile } from '../../application/services/profileService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {

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
