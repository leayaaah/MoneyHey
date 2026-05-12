import { supabase } from '../supabaseClient';

export const fetchWalletBalances = async () => {
    const { data, error } = await supabase
        .from('wallets')
        .select('balance');
    if (error) throw error;
    return data;
};

export const fetchWallets = async () => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*');
    if (error) {
        console.error('Error fetching wallets:', error);
        throw error;
    }
    return data;
};
