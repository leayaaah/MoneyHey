// src/services/authService.js
// Business Logic layer — authentication operations
import { supabase } from '../config/supabase';

export const authService = {
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        await supabase.auth.signOut();
    },

    async restoreSession(session) {
        const { data, error } = await supabase.auth.setSession(session);
        if (error) throw error;
        return data.session;
    },

    async getUser() {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
    },
};
