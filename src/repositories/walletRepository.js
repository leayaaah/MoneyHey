// src/repositories/walletRepository.js
// Data Access layer — all Supabase queries for wallets
import { supabase } from '../config/supabase';

export const walletRepository = {
    async getAll() {
        const { data, error } = await supabase.from('wallets').select('*');
        if (error) throw error;
        return data;
    },
};
