// src/repositories/profileRepository.js
// Data Access layer — all Supabase queries for user profiles
import { supabase } from '../config/supabase';

export const profileRepository = {
    async getByUserId(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_img')
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },
};
