import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { supabase } from '../services/supabase';

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsLoggedIn(!!session);
            setLoadingAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, loadingAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
