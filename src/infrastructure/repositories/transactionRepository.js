import { supabase } from '../supabaseClient'
export const getTransactions = async (userId) => {
    let query = supabase
        .from('transactions')
        .select(`*,
        categories ( category_name ),
        wallets ( wallet_name )`)
        .order('tx_date', { ascending: false })

    if (userId) {
        query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }
    return data
}
export const addTransaction = async (transaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
    if (error) {
        console.error('Error adding transaction:', error)
        throw error
    }
    return data
}

export const addTransactions = async (transactions) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select()
    if (error) {
        console.error('Error adding transactions:', error)
        throw error
    }
    return data
}

export const getTransactionsByType = async(type) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`*,
        categories ( category_name ),
        wallets ( wallet_name )`)
        .eq('tx_type', type)
    if (error) {
        console.error('Error fetching transactions:', error)
        throw error
    }
    return data
}

export const deleteTransactionsByIds = async (transactionIds) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('trans_id', transactionIds);

    if (error) {
        console.error('Error deleting transactions:', error);
        throw error;
    }
};

export const countTransactionsByWalletId = async (walletId, userId) => {
    let query = supabase
        .from('transactions')
        .select('trans_id', { count: 'exact', head: true })
        .eq('wallet_id', walletId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { count, error } = await query;

    if (error) {
        console.error('Error counting wallet transactions:', error);
        throw error;
    }

    return count || 0;
};
