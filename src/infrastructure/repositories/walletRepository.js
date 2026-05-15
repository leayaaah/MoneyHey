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

export const fetchWalletById = async (walletId) => {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('wallet_id', walletId)
        .single();

    if (error) {
        console.error('Error fetching wallet by id:', error);
        throw error;
    }

    return data;
};

export const createWallet = async (wallet) => {
    const { data, error } = await supabase
        .from('wallets')
        .insert(wallet)
        .select()
        .single();

    if (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }

    return data;
};

export const updateWallet = async (walletId, wallet) => {
    const { data, error } = await supabase
        .from('wallets')
        .update(wallet)
        .eq('wallet_id', walletId)
        .select()
        .single();

    if (error) {
        console.error('Error updating wallet:', error);
        throw error;
    }

    return data;
};

export const updateWalletBalance = async (walletId, balance) => {
    const { data, error } = await supabase
        .from('wallets')
        .update({ balance })
        .eq('wallet_id', walletId)
        .select()
        .single();

    if (error) {
        console.error('Error updating wallet balance:', error);
        throw error;
    }

    return data;
};

export const deleteWallet = async (walletId) => {
    const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('wallet_id', walletId);

    if (error) {
        console.error('Error deleting wallet:', error);
        throw error;
    }
};
