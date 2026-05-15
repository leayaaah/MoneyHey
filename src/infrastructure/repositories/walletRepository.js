import { supabase } from '../supabaseClient';

export const fetchWalletBalances = async (userId) => {
    let query = supabase
        .from('wallets')
        .select('balance');

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const fetchWallets = async (userId) => {
    let query = supabase
        .from('wallets')
        .select('*');

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching wallets:', error);
        throw error;
    }
    return data;
};
