// src/hooks/useAuth.js
// Adapter layer — bridges authService with React state
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const savedSession = localStorage.getItem('moneyhey_session');
        if (!savedSession) return;
        try {
            const session = JSON.parse(savedSession);
            const isExpired = session.expires_at && session.expires_at * 1000 < Date.now();
            if (isExpired) {
                localStorage.removeItem('moneyhey_session');
                return;
            }
            authService.restoreSession(session)
                .then(restoredSession => {
                    if (restoredSession) setIsLoggedIn(true);
                    else localStorage.removeItem('moneyhey_session');
                })
                .catch(() => localStorage.removeItem('moneyhey_session'));
        } catch {
            localStorage.removeItem('moneyhey_session');
        }
    }, []);

    const signIn = async (email, password, rememberMe = false) => {
        const data = await authService.signIn(email, password);
        if (rememberMe) {
            localStorage.setItem('moneyhey_session', JSON.stringify(data.session));
        }
        setIsLoggedIn(true);
        return data;
    };

    const signOut = async () => {
        localStorage.removeItem('moneyhey_session');
        await authService.signOut();
        setIsLoggedIn(false);
    };

    return { isLoggedIn, signIn, signOut };
}
