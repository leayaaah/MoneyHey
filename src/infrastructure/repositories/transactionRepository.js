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
